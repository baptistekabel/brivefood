// La journée de service commence à 9h du matin : une commande passée à 1h du
// matin appartient encore au service de la veille. La numérotation affichée
// repart donc à 1 chaque jour à 9h.
export const SERVICE_DAY_START_HOUR = 9;

// Identifiant de la journée de service en cours, ex. « 2026-07-25 »
export const getServiceDayKey = (date = new Date()) => {
  const d = new Date(date);

  if (d.getHours() < SERVICE_DAY_START_HOUR) {
    d.setDate(d.getDate() - 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// Numéro montré au client et à la cuisine. On retombe sur l'identifiant unique
// pour les commandes créées avant la mise en place du compteur quotidien.
export const getOrderDisplayNumber = (order) => {
  if (!order) return '';
  return order.orderNumber || order.id || '';
};
