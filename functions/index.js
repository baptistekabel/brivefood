const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Applique le blocage côté serveur.
 *
 * L'application admin écrit `blocked: true` sur users/{uid}. Ce déclencheur
 * répercute l'état sur Firebase Auth : le compte est désactivé et ses jetons
 * révoqués, ce qui rend le blocage réel même si quelqu'un contourne l'app.
 *
 * Sans ça, le blocage n'est qu'un signal que le code client accepte de respecter.
 */
exports.syncUserBlockedState = onDocumentWritten('users/{docId}', async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  // Document supprimé : la suppression du compte Auth est gérée ailleurs
  if (!after) return;

  const wasBlocked = before?.blocked === true;
  const isBlocked = after.blocked === true;

  // Ne rien faire tant que le champ `blocked` n'a pas changé : sans ce garde,
  // chaque écriture de profil (adresse, téléphone...) appellerait l'API Auth
  if (wasBlocked === isBlocked) return;

  // Les profils livreurs en attente sont indexés par email, pas par UID Auth
  const uid = after.uid || event.params.docId;

  try {
    await admin.auth().updateUser(uid, { disabled: isBlocked });

    if (isBlocked) {
      // Invalide les sessions en cours : le prochain rafraîchissement de jeton échoue
      await admin.auth().revokeRefreshTokens(uid);
      logger.info(`Compte bloqué et sessions révoquées: ${uid}`);
    } else {
      logger.info(`Compte débloqué: ${uid}`);
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Profil Firestore sans compte Auth correspondant (livreur pas encore activé,
      // document orphelin). Le blocage applicatif reste effectif.
      logger.warn(`Aucun compte Auth pour ${uid}, blocage applicatif uniquement`);
      return;
    }

    logger.error(`Échec synchronisation du blocage pour ${uid}`, error);
    throw error;
  }
});

// ---------------------------------------------------------------------------
// Avancement automatique du statut des commandes
// ---------------------------------------------------------------------------

// Minutes écoulées depuis la création à partir desquelles chaque statut s'applique.
// Ordonné du plus tardif au plus précoce : on prend la première étape atteinte.
// Les durées reprennent les temps annoncés au client (getEstimatedTime).
const STATUS_SCHEDULE = {
  delivery: [
    { afterMinutes: 45, status: 'delivered' },
    { afterMinutes: 25, status: 'in_delivery' },
    { afterMinutes: 20, status: 'ready' },
    { afterMinutes: 2, status: 'preparing' },
    { afterMinutes: 0, status: 'pending' },
  ],
  // Sur place et à emporter : pas d'étape de livraison
  default: [
    { afterMinutes: 25, status: 'delivered' },
    { afterMinutes: 15, status: 'ready' },
    { afterMinutes: 2, status: 'preparing' },
    { afterMinutes: 0, status: 'pending' },
  ],
};

// Statuts terminaux : une fois atteints, la commande n'évolue plus
const FINAL_STATUSES = ['delivered', 'cancelled'];

// Fenêtre de travail du balayage. Le calendrier le plus long s'achève à 45 min
// (plus l'affluence) : au-delà de quelques heures, une commande a forcément
// atteint son état final et n'a plus rien à faire dans la requête.
//
// Ce filtre remplace un `where('status', 'not-in', FINAL_STATUSES)` qui, en plus
// de relire tout l'historique non clos, écartait silencieusement les documents
// dépourvus de champ `status` — Firestore ne renvoie jamais un document dont le
// champ filtré est absent. Ces commandes-là n'avançaient donc jamais.
const AUTO_ADVANCE_WINDOW_MS = 6 * 60 * 60 * 1000;

// `extraMinutes` : affluence signalée par le restaurant. Elle ne s'applique
// qu'aux livraisons, comme le délai annoncé au client. Le passage en
// préparation reste immédiat : la cuisine s'y met tout de suite, c'est la
// sortie qui prend du retard.
const getScheduledStatus = (mode, minutesElapsed, extraMinutes = 0) => {
  const normalizedMode = String(mode || '').toLowerCase();
  const isDelivery = normalizedMode === 'delivery';
  const schedule = isDelivery ? STATUS_SCHEDULE.delivery : STATUS_SCHEDULE.default;

  const extra = isDelivery ? (Number(extraMinutes) || 0) : 0;
  const step = schedule.find(entry => {
    const threshold = entry.afterMinutes > 2
      ? entry.afterMinutes + extra
      : entry.afterMinutes;
    return minutesElapsed >= threshold;
  });

  return step ? step.status : 'pending';
};

// Affluence en cours, écrite par l'application admin
const getRushExtraMinutes = async (db) => {
  try {
    const snapshot = await db.collection('settings').doc('service_load').get();
    if (!snapshot.exists) return 0;

    const data = snapshot.data();
    return data.active === true ? Number(data.extraMinutes) || 0 : 0;
  } catch (error) {
    // Une lecture ratée ne doit pas bloquer l'avancement des commandes
    logger.warn('Lecture du mode affluence impossible, calendrier normal appliqué', error);
    return 0;
  }
};

/**
 * Fait avancer les commandes selon le temps écoulé depuis leur création.
 *
 * Exécuté côté serveur pour que le cycle se déroule même si aucune tablette
 * admin n'est allumée.
 *
 * Le calendrier ne fait autorité que tant que personne n'est intervenu. Dès
 * qu'un statut a été posé à la main — bouton de la cuisine, affectation d'un
 * livreur — la commande sort du pilotage automatique et n'est plus repositionnée.
 * Sans cette règle, une commande marquée « prête » à 12 minutes revenait « en
 * préparation » au passage suivant (seuil : 15 minutes), et une commande confiée
 * à un livreur repassait de « en livraison » à « prête ».
 *
 * Les commandes livrées ou annulées ne sont jamais touchées.
 */
exports.autoAdvanceOrderStatus = onSchedule('every 1 minutes', async () => {
  const db = admin.firestore();
  const now = Date.now();

  const snapshot = await db
    .collection('orders')
    .where(
      'createdAt',
      '>=',
      admin.firestore.Timestamp.fromMillis(now - AUTO_ADVANCE_WINDOW_MS)
    )
    .get();

  if (snapshot.empty) return;

  const rushExtraMinutes = await getRushExtraMinutes(db);
  let batch = db.batch();
  let pendingWrites = 0;
  let updated = 0;

  for (const document of snapshot.docs) {
    const order = document.data();

    // Statut final : plus rien à faire
    if (FINAL_STATUSES.includes(order.status)) continue;

    // Quelqu'un a pris la main sur cette commande : on la laisse tranquille
    if (order.lastStatusChangeType === 'manual') continue;

    // Sans date de création, impossible de situer la commande dans le calendrier
    const createdAt = order.createdAt?.toDate?.();
    if (!createdAt) {
      logger.warn(`Commande ${order.id || document.id} sans createdAt, ignorée`);
      continue;
    }

    const minutesElapsed = (now - createdAt.getTime()) / 60000;
    const expectedStatus = getScheduledStatus(order.mode, minutesElapsed, rushExtraMinutes);

    if (expectedStatus === order.status) continue;

    batch.update(document.ref, {
      status: expectedStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastStatusChangeType: 'auto',
      autoStatusChangeAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(expectedStatus === 'delivered' && { autoCompleted: true }),
    });

    updated += 1;
    pendingWrites += 1;

    // Une transaction Firestore est plafonnée à 500 opérations
    if (pendingWrites === 450) {
      await batch.commit();
      batch = db.batch();
      pendingWrites = 0;
    }
  }

  if (pendingWrites > 0) await batch.commit();

  if (updated > 0) {
    logger.info(`Statuts avancés automatiquement : ${updated} commande(s)`);
  }
});
