import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import orderRatingService from '../../services/orderRatingService';
import ratingsSyncService from '../../services/RatingsSyncService';

const { width, height } = Dimensions.get('window');

export default function RealTimeRatingsWidget() {
  const [newRatings, setNewRatings] = useState([]);
  const [totalRatings, setTotalRatings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [allRatings, setAllRatings] = useState([]);

  // Animations
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationScale = useRef(new Animated.Value(0.8)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;

  // Polling et surveillance
  const pollInterval = useRef(null);
  const lastCheckTimestamp = useRef(Date.now());

  useEffect(() => {
    // Initialiser et démarrer la surveillance
    initializeRealTimeMonitoring();

    // Nettoyer à la destruction
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  // Initialiser la surveillance temps réel
  const initializeRealTimeMonitoring = async () => {
    try {
      console.log('🚀 [RealTimeRatingsWidget] Initialisation surveillance temps réel...');

      // Charger les données initiales
      await loadInitialData();

      // Démarrer le polling temps réel (toutes les 5 secondes)
      pollInterval.current = setInterval(async () => {
        await checkForNewRatings();
        await updateSyncStats();
      }, 5000);

      // Vérifier les stats de synchronisation toutes les 30 secondes
      setInterval(updateSyncStats, 30000);

      console.log('✅ [RealTimeRatingsWidget] Surveillance temps réel activée');
    } catch (error) {
      console.error('❌ [RealTimeRatingsWidget] Erreur initialisation:', error);
    }
  };

  // Charger les données initiales
  const loadInitialData = async () => {
    try {
      console.log('📊 [RealTimeRatingsWidget] Chargement données initiales...');

      // Récupérer toutes les notations
      const ratings = await orderRatingService.getRatings(true); // Force Firebase pour admin
      setAllRatings(ratings);

      // Calculer les statistiques
      const stats = await orderRatingService.getRatingStats(true);
      setTotalRatings(stats.totalRatings);
      setAverageRating(stats.averageRating);

      // Récupérer les nouvelles notations (dernières 5)
      const recentRatings = ratings
        .filter(r => r.createdAt && new Date(r.createdAt).getTime() > (Date.now() - 24 * 60 * 60 * 1000)) // Dernières 24h
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setNewRatings(recentRatings);

      console.log('📊 [RealTimeRatingsWidget] Données chargées:', {
        total: stats.totalRatings,
        average: stats.averageRating,
        recent: recentRatings.length
      });

    } catch (error) {
      console.error('❌ [RealTimeRatingsWidget] Erreur chargement données:', error);
    }
  };

  // Vérifier les nouvelles notations
  const checkForNewRatings = async () => {
    try {
      // Récupérer les notations depuis le timestamp de la dernière vérification
      const ratings = await orderRatingService.getRatings(true);
      const currentTimestamp = Date.now();

      // Filtrer les nouvelles notations
      const newOnes = ratings.filter(rating => {
        const ratingTime = new Date(rating.createdAt).getTime();
        return ratingTime > lastCheckTimestamp.current;
      });

      if (newOnes.length > 0) {
        console.log(`🆕 [RealTimeRatingsWidget] ${newOnes.length} nouvelles notations détectées`);

        // Déclencher l'alerte pour la plus récente
        const newestRating = newOnes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        await showNewRatingNotification(newestRating);

        // Mettre à jour la liste
        setNewRatings(prev => [...newOnes, ...prev].slice(0, 5));
        setAllRatings(ratings);

        // Recalculer les stats
        const stats = await orderRatingService.getRatingStats(true);
        setTotalRatings(stats.totalRatings);
        setAverageRating(stats.averageRating);
      }

      lastCheckTimestamp.current = currentTimestamp;

    } catch (error) {
      console.error('❌ [RealTimeRatingsWidget] Erreur vérification nouvelles notations:', error);
    }
  };

  // Afficher une notification pour une nouvelle notation
  const showNewRatingNotification = async (rating) => {
    try {
      console.log('🔔 [RealTimeRatingsWidget] Nouvelle notification:', rating.orderId);

      setLastNotification(rating);
      setShowNotification(true);

      // Vibration et son
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      // Animation d'apparition
      Animated.parallel([
        Animated.spring(notificationOpacity, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(notificationScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation du badge
      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide après 8 secondes
      setTimeout(() => {
        hideNotification();
      }, 8000);

    } catch (error) {
      console.error('❌ [RealTimeRatingsWidget] Erreur notification:', error);
    }
  };

  // Cacher la notification
  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(notificationScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowNotification(false);
      setLastNotification(null);
    });
  };

  // Mettre à jour les statistiques de synchronisation
  const updateSyncStats = async () => {
    try {
      const stats = await ratingsSyncService.getSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.warn('⚠️ [RealTimeRatingsWidget] Erreur stats sync:', error);
    }
  };

  // Animation de pulse continue
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulse();
  }, []);

  // Obtenir la couleur selon la note
  const getRatingColor = (rating) => {
    if (rating >= 5) return '#10B981'; // Vert excellent
    if (rating >= 4) return '#22C55E'; // Vert bon
    if (rating === 3) return '#F59E0B'; // Orange moyen
    if (rating === 2) return '#F97316'; // Orange mauvais
    return '#EF4444'; // Rouge très mauvais
  };

  // Obtenir l'icône selon la note
  const getRatingIcon = (rating) => {
    if (rating >= 5) return 'star';
    if (rating >= 4) return 'star-half';
    if (rating === 3) return 'star-outline';
    if (rating === 2) return 'warning';
    return 'alert-circle';
  };

  // Forcer la synchronisation manuelle
  const forceSyncAll = async () => {
    try {
      console.log('🔄 [RealTimeRatingsWidget] Synchronisation forcée...');

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await ratingsSyncService.forceSyncAll();

      if (result.success) {
        Alert.alert(
          '✅ Synchronisation réussie',
          `${result.synced} avis synchronisés avec succès`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Erreur de synchronisation',
          result.error || 'Échec de la synchronisation',
          [{ text: 'OK' }]
        );
      }

      // Recharger les données
      await loadInitialData();
      await updateSyncStats();

    } catch (error) {
      console.error('❌ [RealTimeRatingsWidget] Erreur sync forcée:', error);
      Alert.alert('❌ Erreur', 'Impossible de forcer la synchronisation');
    }
  };

  return (
    <View style={styles.container}>
      {/* Widget principal compact */}
      <TouchableOpacity
        style={styles.widget}
        onPress={() => setShowFullModal(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#1F2937', '#374151', '#4B5563']}
          style={styles.widgetGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header avec indicateur temps réel */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="star" size={20} color={colors.accent.main} />
              <Text style={styles.title}>Avis Temps Réel</Text>
              <Animated.View
                style={[
                  styles.liveDot,
                  { transform: [{ scale: pulseAnimation }] }
                ]}
              />
            </View>

            {syncStats && (
              <Text style={styles.syncText}>
                Fiabilité: {syncStats.syncRate}%
              </Text>
            )}
          </View>

          {/* Statistiques principales */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalRatings}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: getRatingColor(averageRating) }]}>
                {averageRating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Moyenne</Text>
            </View>

            <Animated.View
              style={[
                styles.statItem,
                { transform: [{ scale: badgeScale }] }
              ]}
            >
              <Text style={[styles.statNumber, { color: colors.accent.main }]}>
                {newRatings.length}
              </Text>
              <Text style={styles.statLabel}>Récents</Text>
            </Animated.View>
          </View>

          {/* Actions rapides */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={forceSyncAll}
              activeOpacity={0.7}
            >
              <Ionicons name="sync" size={16} color={colors.neutral.white} />
              <Text style={styles.actionText}>Sync</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFullModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="eye" size={16} color={colors.neutral.white} />
              <Text style={styles.actionText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Notification flottante pour nouveaux avis */}
      {showNotification && lastNotification && (
        <Animated.View
          style={[
            styles.notification,
            {
              opacity: notificationOpacity,
              transform: [{ scale: notificationScale }],
            },
          ]}
        >
          <LinearGradient
            colors={
              lastNotification.rating >= 4
                ? ['#10B981', '#059669']
                : lastNotification.rating <= 2
                ? ['#EF4444', '#DC2626']
                : ['#F59E0B', '#D97706']
            }
            style={styles.notificationGradient}
          >
            <TouchableOpacity
              style={styles.notificationClose}
              onPress={hideNotification}
            >
              <Ionicons name="close" size={18} color={colors.neutral.white} />
            </TouchableOpacity>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Ionicons
                  name={getRatingIcon(lastNotification.rating)}
                  size={24}
                  color={colors.neutral.white}
                />
                <Text style={styles.notificationTitle}>
                  Nouvel avis {lastNotification.rating}/5
                </Text>
              </View>

              <Text style={styles.notificationOrder}>
                Commande #{lastNotification.orderId}
              </Text>

              {lastNotification.comment && (
                <Text style={styles.notificationComment} numberOfLines={2}>
                  "{lastNotification.comment}"
                </Text>
              )}

              <Text style={styles.notificationTime}>
                À l'instant
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Modal complet pour voir tous les avis */}
      <Modal
        visible={showFullModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFullModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#111827', '#1F2937', '#374151']}
            style={styles.modalGradient}
          >
            {/* Header modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📊 Tous les avis</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowFullModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.neutral.white} />
              </TouchableOpacity>
            </View>

            {/* Stats détaillées */}
            {syncStats && (
              <View style={styles.detailedStats}>
                <Text style={styles.detailedStatsTitle}>Statistiques de synchronisation</Text>
                <View style={styles.detailedStatsRow}>
                  <Text style={styles.detailedStat}>Total: {syncStats.totalRatings}</Text>
                  <Text style={styles.detailedStat}>En attente: {syncStats.pendingSync}</Text>
                  <Text style={styles.detailedStat}>Échecs: {syncStats.failedSync}</Text>
                  <Text style={[styles.detailedStat, { color: colors.accent.main }]}>
                    Fiabilité: {syncStats.syncRate}%
                  </Text>
                </View>
              </View>
            )}

            {/* Liste de tous les avis */}
            <ScrollView style={styles.ratingsList} showsVerticalScrollIndicator={false}>
              {allRatings.map((rating, index) => (
                <View key={rating.id || index} style={styles.ratingItem}>
                  <View style={styles.ratingHeader}>
                    <View style={styles.ratingInfo}>
                      <Text style={styles.ratingOrder}>#{rating.orderId}</Text>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Ionicons
                            key={star}
                            name={star <= rating.rating ? 'star' : 'star-outline'}
                            size={16}
                            color={star <= rating.rating ? colors.accent.main : colors.neutral.gray400}
                          />
                        ))}
                        <Text style={[styles.ratingValue, { color: getRatingColor(rating.rating) }]}>
                          {rating.rating}/5
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.ratingTime}>
                      {new Date(rating.createdAt).toLocaleString('fr-FR')}
                    </Text>
                  </View>

                  {rating.comment && (
                    <Text style={styles.ratingComment}>"{rating.comment}"</Text>
                  )}

                  {rating.emergency && (
                    <Text style={styles.emergencyBadge}>🚨 Sauvegarde d'urgence</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: spacing.md,
    zIndex: 1000,
  },
  widget: {
    width: 160,
    borderRadius: 16,
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  widgetGradient: {
    borderRadius: 16,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginLeft: spacing.xs,
    flex: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  syncText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray300,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray400,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs / 2,
  },
  actionText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  notification: {
    position: 'absolute',
    top: 120,
    right: 0,
    width: width * 0.9,
    maxWidth: 350,
    borderRadius: 16,
    elevation: 12,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  notificationGradient: {
    borderRadius: 16,
    padding: spacing.lg,
  },
  notificationClose: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    paddingRight: 40,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  notificationTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },
  notificationOrder: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  notificationComment: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xl + 20 : spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedStats: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  detailedStatsTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
  },
  detailedStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailedStat: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray300,
  },
  ratingsList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  ratingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingOrder: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs / 2,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  ratingValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    marginLeft: spacing.xs,
  },
  ratingTime: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray400,
  },
  ratingComment: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray200,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  emergencyBadge: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});