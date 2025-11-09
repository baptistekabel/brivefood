import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import restaurantStatusService from '../../services/restaurantStatusService';

export default function RestaurantStatusControl({ style }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideType, setOverrideType] = useState('open'); // 'open' or 'close'
  const [customReason, setCustomReason] = useState('');
  const [duration, setDuration] = useState('');

  // Charger le statut initial
  useEffect(() => {
    loadStatus();

    // Écouter les changements de statut
    const removeListener = restaurantStatusService.addStatusListener((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      removeListener();
    };
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const currentStatus = await restaurantStatusService.getStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickToggle = () => {
    if (!status) return;

    const newStatus = !status.isOpen;

    if (newStatus) {
      // Pour l'ouverture, action directe sans demander de raison
      Alert.alert(
        'Ouvrir le restaurant',
        'Voulez-vous ouvrir le restaurant immédiatement ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ouvrir',
            onPress: () => forceStatus(true, 'Ouvert manuellement'),
            style: 'default'
          }
        ]
      );
    } else {
      // Pour la fermeture, action directe sans demander de raison
      Alert.alert(
        'Fermer le restaurant',
        'Voulez-vous fermer le restaurant immédiatement ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Fermer',
            onPress: () => forceStatus(false, 'Fermé manuellement'),
            style: 'destructive'
          }
        ]
      );
    }
  };

  const handleAdvancedOverride = (type) => {
    setOverrideType(type);
    setCustomReason('');
    setDuration('');
    setShowOverrideModal(true);
  };

  const forceStatus = async (isOpen, reason = null, durationMinutes = null) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await restaurantStatusService.forceStatus(
        isOpen,
        reason,
        durationMinutes
      );

      if (result.success) {
        Alert.alert(
          'Statut modifié',
          `Restaurant ${isOpen ? 'ouvert' : 'fermé'} manuellement${durationMinutes ? ` pour ${durationMinutes} minutes` : ''}`
        );
      } else {
        Alert.alert('Erreur', 'Impossible de modifier le statut');
      }
    } catch (error) {
      console.error('Erreur forçage statut:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleClearOverride = () => {
    Alert.alert(
      'Retour au mode automatique',
      'Le statut sera déterminé automatiquement selon les horaires configurés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await restaurantStatusService.clearOverride();
              Alert.alert('Mode automatique', 'Le statut est maintenant géré automatiquement');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de revenir au mode automatique');
            }
          }
        }
      ]
    );
  };

  const handleOverrideConfirm = () => {
    const isOpen = overrideType === 'open';
    const reason = customReason.trim() || (isOpen ? 'Ouvert manuellement' : 'Fermé manuellement');
    const durationMinutes = duration ? parseInt(duration, 10) : null;

    if (duration && (isNaN(durationMinutes) || durationMinutes <= 0)) {
      Alert.alert('Erreur', 'Veuillez entrer une durée valide en minutes');
      return;
    }

    forceStatus(isOpen, reason, durationMinutes);
    setShowOverrideModal(false);
  };

  const formatTimeRemaining = (isoString) => {
    if (!isoString) return null;

    const now = new Date();
    const target = new Date(isoString);
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return 'Bientôt';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      const remainingMinutes = diffMinutes % 60;
      return `${diffHours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
    } else {
      return `${diffMinutes}min`;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Erreur de chargement</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Statut actuel */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: status.isOpen ? '#22C55E' : '#EF4444' }
          ]}>
            <Ionicons
              name={status.isOpen ? 'checkmark' : 'close'}
              size={16}
              color={colors.neutral.white}
            />
          </View>
          <Text style={styles.statusTitle}>
            Restaurant {status.isOpen ? 'OUVERT' : 'FERMÉ'}
          </Text>
          <View style={[
            styles.modeIndicator,
            { backgroundColor: status.mode === 'manual' ? '#F59E0B' : '#6B7280' }
          ]}>
            <Ionicons
              name={status.mode === 'manual' ? 'hand-left' : 'time'}
              size={12}
              color={colors.neutral.white}
            />
          </View>
        </View>

        <Text style={styles.statusReason}>{status.reason}</Text>

        {status.nextChange && (
          <Text style={styles.nextChange}>
            {status.isOpen ? 'Ferme' : 'Ouvre'} dans {formatTimeRemaining(status.nextChange)}
          </Text>
        )}
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        {/* Toggle rapide */}
        <TouchableOpacity
          style={styles.quickToggleButton}
          onPress={handleQuickToggle}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={status.isOpen ? ['#EF4444', '#DC2626'] : ['#22C55E', '#16A34A']}
            style={styles.quickToggleGradient}
          >
            <Ionicons
              name={status.isOpen ? 'close-circle' : 'checkmark-circle'}
              size={20}
              color={colors.neutral.white}
            />
            <Text style={styles.quickToggleText}>
              {status.isOpen ? 'Fermer' : 'Ouvrir'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Contrôles avancés */}
        <View style={styles.advancedControls}>
          <TouchableOpacity
            style={styles.advancedButton}
            onPress={() => {
              Alert.alert(
                'Ouvrir le restaurant',
                'Voulez-vous ouvrir le restaurant immédiatement ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Ouvrir',
                    onPress: () => forceStatus(true, 'Ouvert manuellement'),
                    style: 'default'
                  }
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="play-circle-outline" size={18} color="#22C55E" />
            <Text style={[styles.advancedButtonText, { color: '#22C55E' }]}>
              Ouvrir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.advancedButton}
            onPress={() => {
              Alert.alert(
                'Fermer le restaurant',
                'Voulez-vous fermer le restaurant immédiatement ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Fermer',
                    onPress: () => forceStatus(false, 'Fermé manuellement'),
                    style: 'destructive'
                  }
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="pause-circle-outline" size={18} color="#EF4444" />
            <Text style={[styles.advancedButtonText, { color: '#EF4444' }]}>
              Fermer
            </Text>
          </TouchableOpacity>

          {status.mode === 'manual' && (
            <TouchableOpacity
              style={styles.advancedButton}
              onPress={handleClearOverride}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-circle-outline" size={18} color="#6B7280" />
              <Text style={[styles.advancedButtonText, { color: '#6B7280' }]}>
                Auto
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal de configuration avancée */}
      <Modal
        visible={showOverrideModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOverrideModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {overrideType === 'open' ? 'Ouvrir' : 'Fermer'} manuellement
              </Text>
              <TouchableOpacity
                onPress={() => setShowOverrideModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.neutral.gray600} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Raison (optionnel)</Text>
                <TextInput
                  style={styles.textInput}
                  value={customReason}
                  onChangeText={setCustomReason}
                  placeholder={`Ex: ${overrideType === 'open' ? 'Service exceptionnel' : 'Maintenance urgente'}`}
                  placeholderTextColor={colors.neutral.gray400}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Durée (optionnel)</Text>
                <TextInput
                  style={styles.textInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Durée en minutes"
                  placeholderTextColor={colors.neutral.gray400}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Text style={styles.inputHint}>
                  Laissez vide pour un changement permanent
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowOverrideModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleOverrideConfirm}
              >
                <LinearGradient
                  colors={overrideType === 'open' ? ['#22C55E', '#16A34A'] : ['#EF4444', '#DC2626']}
                  style={styles.modalConfirmGradient}
                >
                  <Text style={styles.modalConfirmText}>
                    {overrideType === 'open' ? 'Ouvrir' : 'Fermer'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    textAlign: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.base,
    color: colors.status.error,
    textAlign: 'center',
    padding: spacing.lg,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statusTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
  },
  modeIndicator: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusReason: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  nextChange: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
  },
  controls: {
    gap: spacing.md,
  },
  quickToggleButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickToggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  quickToggleText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  advancedControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  advancedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.gray50,
    gap: spacing.xs,
  },
  advancedButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    backgroundColor: colors.neutral.white,
  },
  inputHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
});