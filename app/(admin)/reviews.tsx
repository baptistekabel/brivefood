import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import orderRatingService from '../../src/services/orderRatingService';
import firebaseRatingService from '../../src/services/firebaseRatingService';
import ratingsSyncService from '../../src/services/RatingsSyncService';
import RealTimeRatingsWidget from '../../src/components/admin/RealTimeRatingsWidget';

export default function AdminReviews() {
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'

  // Charger les données
  useEffect(() => {
    loadRatingsData();
  }, []);

  // Fonction de test pour ajouter une notation de test
  const addTestRating = async () => {
    try {
      const testRating = {
        orderId: `TEST_${Date.now()}`,
        rating: 5,
        comment: 'Test d\'avis depuis l\'admin - excellent !',
        timestamp: new Date().toISOString(),
      };

      const result = await orderRatingService.saveRating(testRating);
      if (result.success) {
        Alert.alert('Succès', 'Avis de test ajouté avec succès');
        await loadRatingsData();
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'avis de test');
      }
    } catch (error) {
      console.error('Erreur test rating:', error);
      Alert.alert('Erreur', 'Erreur lors du test');
    }
  };

  // 🚀 NOUVELLE MÉTHODE : Synchronisation ultra-fiable
  const ultraReliableSync = async () => {
    try {
      console.log('🚀 [AdminReviews] Début synchronisation ULTRA-FIABLE...');

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Utiliser le nouveau service ultra-fiable
      const syncResult = await ratingsSyncService.forceSyncAll();

      if (syncResult.success) {
        await loadRatingsData(); // Recharger les données

        // Obtenir les stats de fiabilité
        const syncStats = await ratingsSyncService.getSyncStats();

        Alert.alert(
          '✅ Synchronisation Ultra-Fiable Terminée',
          `🔄 ${syncResult.synced} avis synchronisés\n📊 Fiabilité: ${syncStats.syncRate}%\n💾 Total: ${syncStats.totalRatings} avis\n⏳ En attente: ${syncStats.pendingSync}\n❌ Échecs: ${syncStats.failedSync}`,
          [{ text: 'Super !' }]
        );
      } else {
        Alert.alert(
          '❌ Échec Synchronisation',
          syncResult.error || 'Erreur inconnue lors de la synchronisation ultra-fiable',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ [AdminReviews] Erreur sync ultra-fiable:', error);
      Alert.alert('❌ Erreur Critique', 'Impossible d\'effectuer la synchronisation ultra-fiable');
    }
  };

  // Fonction pour synchroniser les données locales vers Firebase (ancienne méthode)
  const syncToFirebase = async () => {
    try {
      console.log('🔄 Début synchronisation vers Firebase...');
      await orderRatingService.syncLocalRatingsToFirebase();
      await loadRatingsData(); // Recharger après synchronisation
      Alert.alert('Succès', 'Synchronisation Firebase terminée');
    } catch (error) {
      console.error('Erreur sync Firebase:', error);
      Alert.alert('Erreur', 'Erreur lors de la synchronisation');
    }
  };

  // Fonction pour vérifier directement Firebase
  const checkFirebase = async () => {
    try {
      console.log('🔍 Vérification directe Firebase...');

      // Test de connexion d'abord
      const connectionTest = await firebaseRatingService.testConnection();
      console.log('🔗 Test connexion:', connectionTest);

      if (!connectionTest.success) {
        Alert.alert('Erreur Firebase', `Connexion échouée: ${connectionTest.error}`);
        return;
      }

      // Récupération des avis
      const firebaseRatings = await firebaseRatingService.getAllRatings();
      console.log('🔥 Données Firebase directes:', firebaseRatings);

      Alert.alert(
        'Firebase Status',
        `✅ Connexion OK\n📊 ${firebaseRatings.length} avis trouvés\n\nVoir console pour détails`
      );

      if (firebaseRatings.length > 0) {
        setRatings(firebaseRatings);
      }
    } catch (error) {
      console.error('Erreur vérification Firebase:', error);
      Alert.alert('Erreur', 'Erreur vérification Firebase');
    }
  };

  const loadRatingsData = async () => {
    try {
      console.log('🔄 [AdminReviews] Chargement données avec forceFirebase=true');

      const [ratingsData, statsData] = await Promise.all([
        orderRatingService.getRatings(true), // Force Firebase côté admin
        orderRatingService.getRatingStats(true) // Force Firebase côté admin
      ]);

      console.log('📊 [AdminReviews] Données reçues:', ratingsData.length, 'avis');
      console.log('📊 [AdminReviews] Stats reçues:', statsData);

      setRatings(ratingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setRatingStats(statsData);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      Alert.alert('Erreur', 'Impossible de charger les avis');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRatingsData();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(false);
  };

  // Filtrer les avis selon le filtre sélectionné
  const getFilteredRatings = () => {
    if (filter === 'all') return ratings;
    return ratings.filter(rating => rating.rating === parseInt(filter));
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rendu d'un avis
  const renderRating = (rating) => (
    <View key={rating.id} style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <Ionicons
              key={star}
              name={star <= rating.rating ? "star" : "star-outline"}
              size={18}
              color="#F59E0B"
            />
          ))}
        </View>
        <Text style={styles.ratingDate}>{formatDate(rating.createdAt)}</Text>
      </View>

      <View style={styles.ratingContent}>
        <Text style={styles.orderInfo}>
          Commande #{rating.orderId}
        </Text>

        {rating.comment && (
          <Text style={styles.ratingComment}>{rating.comment}</Text>
        )}
      </View>

      <View style={styles.ratingFooter}>
        <View style={[
          styles.ratingBadge,
          { backgroundColor: getRatingColor(rating.rating) + '20' }
        ]}>
          <Text style={[
            styles.ratingBadgeText,
            { color: getRatingColor(rating.rating) }
          ]}>
            {getRatingText(rating.rating)}
          </Text>
        </View>
      </View>
    </View>
  );

  // Couleur selon la note
  const getRatingColor = (rating) => {
    switch (rating) {
      case 5: return '#10B981';
      case 4: return '#22C55E';
      case 3: return '#F59E0B';
      case 2: return '#F97316';
      case 1: return '#EF4444';
      default: return colors.neutral.gray500;
    }
  };

  // Texte selon la note
  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Très bon';
      case 3: return 'Correct';
      case 2: return 'Décevant';
      case 1: return 'Très déçu';
      default: return '';
    }
  };

  // Rendu des filtres
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous ({ratings.length})
          </Text>
        </TouchableOpacity>

        {[5, 4, 3, 2, 1].map(star => (
          <TouchableOpacity
            key={star}
            style={[styles.filterButton, filter === star.toString() && styles.filterButtonActive]}
            onPress={() => setFilter(star.toString())}
          >
            <View style={styles.filterContent}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={[styles.filterText, filter === star.toString() && styles.filterTextActive]}>
                {star} ({ratingStats?.ratingDistribution[star] || 0})
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const filteredRatings = getFilteredRatings();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* 🚀 Widget Temps Réel Ultra-Fiable */}
        <RealTimeRatingsWidget />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Avis clients</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.checkButton}
              onPress={checkFirebase}
            >
              <Ionicons name="search" size={18} color={colors.neutral.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.syncButton, { backgroundColor: 'rgba(34, 197, 94, 0.3)' }]}
              onPress={ultraReliableSync}
            >
              <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={addTestRating}
            >
              <Ionicons name="add" size={18} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Résumé des statistiques */}
          {ratingStats && (
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Résumé des avis</Text>
              </View>

              <View style={styles.statsContent}>
                <View style={styles.averageSection}>
                  <Text style={styles.averageRating}>
                    {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : '—'}
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(ratingStats.averageRating) ? "star" : "star-outline"}
                        size={20}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text style={styles.totalRatingsText}>
                    Basé sur {ratingStats.totalRatings} avis
                  </Text>
                </View>

                <View style={styles.distributionSection}>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <View key={rating} style={styles.distributionRow}>
                      <Text style={styles.distributionNumber}>{rating}★</Text>
                      <View style={styles.distributionBar}>
                        <View
                          style={[
                            styles.distributionBarFill,
                            {
                              width: ratingStats.totalRatings > 0
                                ? `${(ratingStats.ratingDistribution[rating] / ratingStats.totalRatings) * 100}%`
                                : '0%',
                              backgroundColor: getRatingColor(rating)
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.distributionCount}>
                        {ratingStats.ratingDistribution[rating]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Filtres */}
          {renderFilters()}

          {/* Liste des avis */}
          <ScrollView
            style={styles.ratingsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredRatings.length > 0 ? (
              filteredRatings.map(renderRating)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={64} color={colors.neutral.gray300} />
                <Text style={styles.emptyTitle}>
                  {filter === 'all' ? 'Aucun avis pour le moment' : `Aucun avis ${filter} étoile${filter !== '1' ? 's' : ''}`}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {filter === 'all'
                    ? 'Les avis clients apparaîtront ici'
                    : 'Essayez un autre filtre'
                  }
                </Text>
              </View>
            )}

            {/* Bottom spacing */}
            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
  },
  statsCard: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    marginBottom: spacing.md,
  },
  statsTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  statsContent: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  averageSection: {
    flex: 1,
    alignItems: 'center',
  },
  averageRating: {
    fontSize: typography.fontSizes['4xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#F59E0B',
    marginBottom: spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: spacing.xs,
  },
  totalRatingsText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    textAlign: 'center',
  },
  distributionSection: {
    flex: 2,
    gap: spacing.xs,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distributionNumber: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    width: 25,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
  },
  distributionCount: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    width: 30,
    textAlign: 'right',
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  filterButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  filterTextActive: {
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.bold,
  },
  ratingsList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  ratingCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
  },
  ratingContent: {
    marginBottom: spacing.md,
  },
  orderInfo: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  ratingComment: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray800,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
    fontStyle: 'italic',
  },
  ratingFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  ratingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  ratingBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
});