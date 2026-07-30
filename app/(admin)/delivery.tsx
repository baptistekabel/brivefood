import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { isTablet, isLandscape } from '../../src/utils/deviceUtils';
import {
  DEFAULT_DELIVERY_SETTINGS,
  loadDeliverySettings,
  saveDeliverySettings,
  ensureDeliverySettingsPublished,
  normalizeTierPrices,
  getTierLabel,
} from '../../src/utils/deliveryPricing';

export default function DeliveryPriceManagement() {
  const [deliverySettings, setDeliverySettings] = useState(DEFAULT_DELIVERY_SETTINGS);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editType, setEditType] = useState(''); // 'prices', 'distance'
  const [tempTierPrices, setTempTierPrices] = useState([]);
  const [tempMaxDistance, setTempMaxDistance] = useState('');

  // Détection de l'appareil et orientation
  const isTabletDevice = isTablet();
  const isLandscapeMode = isLandscape();
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    const init = async () => {
      // Publie la grille locale si elle n'a jamais été mise en ligne : sans ça,
      // les clients continueraient d'appliquer les tarifs par défaut
      await ensureDeliverySettingsPublished();
      const settings = await loadDeliverySettings();
      setDeliverySettings(settings);
    };
    init();
  }, []);

  const persistSettings = async (newSettings) => {
    const result = await saveDeliverySettings(newSettings);

    if (result.success) {
      setDeliverySettings(result.settings);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Paramètres de livraison mis à jour');
    } else {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const openEditModal = (type) => {
    setEditType(type);

    if (type === 'prices') {
      setTempTierPrices(deliverySettings.tierPrices.map(price => price.toString()));
    } else if (type === 'distance') {
      setTempMaxDistance(deliverySettings.maxDistance.toString());
    }

    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateTierPrice = (index, value) => {
    setTempTierPrices(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    let newSettings = { ...deliverySettings };

    if (editType === 'prices') {
      const parsed = tempTierPrices.map(value => parseFloat(String(value).replace(',', '.')));

      if (parsed.some(price => isNaN(price) || price < 0)) {
        Alert.alert('Erreur', 'Veuillez entrer un prix valide pour chaque palier');
        return;
      }

      newSettings.tierPrices = parsed;

    } else if (editType === 'distance') {
      const maxDistance = parseFloat(tempMaxDistance);

      if (isNaN(maxDistance) || maxDistance <= 0 || maxDistance > 50) {
        Alert.alert('Erreur', 'Veuillez entrer une distance valide (1-50 km)');
        return;
      }

      newSettings.maxDistance = maxDistance;
      // La grille suit la nouvelle distance : paliers ajoutés ou retirés
      newSettings.tierPrices = normalizeTierPrices(newSettings.tierPrices, maxDistance);
    }

    await persistSettings(newSettings);
    setIsModalVisible(false);
  };

  const minTierPrice = Math.min(...deliverySettings.tierPrices);
  const maxTierPrice = Math.max(...deliverySettings.tierPrices);


  const renderSettingCard = (title, subtitle, value, onPress, icon) => (
    <TouchableOpacity
      style={[
        styles.settingCard,
        isTabletDevice && isLandscapeMode && styles.settingCardTablet
      ]}
      onPress={onPress}
    >
      <View style={[
        styles.settingIcon,
        isTabletDevice && isLandscapeMode && styles.settingIconTablet
      ]}>
        <Ionicons
          name={icon}
          size={isTabletDevice && isLandscapeMode ? 32 : 24}
          color="#000000"
        />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[
          styles.settingTitle,
          isTabletDevice && isLandscapeMode && styles.settingTitleTablet
        ]}>{title}</Text>
        <Text style={[
          styles.settingSubtitle,
          isTabletDevice && isLandscapeMode && styles.settingSubtitleTablet
        ]}>{subtitle}</Text>
      </View>
      <View style={styles.settingValue}>
        <Text style={[
          styles.settingValueText,
          isTabletDevice && isLandscapeMode && styles.settingValueTextTablet
        ]}>{value}</Text>
        <Ionicons
          name="chevron-forward"
          size={isTabletDevice && isLandscapeMode ? 28 : 20}
          color={colors.neutral.gray400}
        />
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => {
    let title = '';
    let content = null;
    
    switch (editType) {
      case 'prices':
        title = 'Modifier les prix par palier';
        content = (
          <ScrollView
            style={styles.tierScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {tempTierPrices.map((price, index) => (
              <View
                key={index}
                style={[
                  styles.inputContainer,
                  isTabletDevice && isLandscapeMode && styles.inputContainerTablet
                ]}
              >
                <Text style={[
                  styles.inputLabel,
                  isTabletDevice && isLandscapeMode && styles.inputLabelTablet
                ]}>
                  Distance {getTierLabel(index)}
                </Text>
                <TextInput
                  style={[
                    styles.priceInput,
                    isTabletDevice && isLandscapeMode && styles.priceInputTablet
                  ]}
                  value={price}
                  onChangeText={(value) => updateTierPrice(index, value)}
                  keyboardType="decimal-pad"
                  placeholder="5.00"
                />
              </View>
            ))}
          </ScrollView>
        );
        break;
        
      case 'distance':
        title = 'Modifier la distance maximale';
        content = (
          <View style={[
            styles.inputContainer,
            isTabletDevice && isLandscapeMode && styles.inputContainerTablet
          ]}>
            <Text style={[
              styles.inputLabel,
              isTabletDevice && isLandscapeMode && styles.inputLabelTablet
            ]}>Distance maximale de livraison (km)</Text>
            <TextInput
              style={[
                styles.priceInput,
                isTabletDevice && isLandscapeMode && styles.priceInputTablet
              ]}
              value={tempMaxDistance}
              onChangeText={setTempMaxDistance}
              keyboardType="decimal-pad"
              placeholder="10"
            />
          </View>
        );
        break;
        
    }
    
    return (
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            isTabletDevice && isLandscapeMode && styles.modalContainerTablet
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isTabletDevice && isLandscapeMode && styles.modalTitleTablet
              ]}>{title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={isTabletDevice && isLandscapeMode ? 32 : 24}
                  color={colors.neutral.gray600}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={[
                styles.modalContent,
                isTabletDevice && isLandscapeMode && styles.modalContentTablet
              ]}
              showsVerticalScrollIndicator={false}
            >
              {content}

              <View style={[
                styles.modalButtons,
                isTabletDevice && isLandscapeMode && styles.modalButtonsTablet
              ]}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    isTabletDevice && isLandscapeMode && styles.cancelButtonTablet
                  ]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={[
                    styles.cancelButtonText,
                    isTabletDevice && isLandscapeMode && styles.cancelButtonTextTablet
                  ]}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isTabletDevice && isLandscapeMode && styles.saveButtonTablet
                  ]}
                  onPress={handleSave}
                >
                  <LinearGradient
                    colors={['#000000', '#000000', '#000000']}
                    style={[
                      styles.saveButtonGradient,
                      isTabletDevice && isLandscapeMode && styles.saveButtonGradientTablet
                    ]}
                  >
                    <Text style={[
                      styles.saveButtonText,
                      isTabletDevice && isLandscapeMode && styles.saveButtonTextTablet
                    ]}>Sauvegarder</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // (admin) est un navigateur a onglets : router.back() retombe sur
              // le tableau de bord. On revient explicitement aux parametres,
              // l'ecran depuis lequel on arrive.
              router.replace('/(admin)/settings');
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Paramètres Livraison</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Settings Container */}
        <ScrollView
          style={[
            styles.settingsContainer,
            isTabletDevice && isLandscapeMode && styles.settingsContainerTablet
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.settingsContent,
            isTabletDevice && isLandscapeMode && styles.settingsContentTablet
          ]}
        >
          {isTabletDevice && isLandscapeMode ? (
            // Layout tablette optimisé
            <>
              {/* Première ligne : Adresse + Aperçu rapide */}
              <View style={styles.topRowTablet}>
                {/* Restaurant Address */}
                <View style={[styles.addressCard, styles.addressCardTablet]}>
                  <View style={[styles.addressHeader, styles.addressHeaderTablet]}>
                    <View style={styles.addressIconContainer}>
                      <Ionicons name="location" size={28} color="#000000" />
                    </View>
                    <Text style={[styles.addressTitle, styles.addressTitleTablet]}>
                      Adresse du restaurant
                    </Text>
                  </View>
                  <Text style={[styles.addressText, styles.addressTextTablet]}>
                    {deliverySettings.restaurantAddress}
                  </Text>
                </View>

                {/* Quick Overview Card */}
                <View style={styles.quickOverviewCard}>
                  <View style={styles.quickOverviewHeader}>
                    <View style={styles.quickOverviewIconContainer}>
                      <Ionicons name="speedometer" size={28} color="#000000" />
                    </View>
                    <Text style={styles.quickOverviewTitle}>Aperçu rapide</Text>
                  </View>
                  <View style={styles.quickOverviewContent}>
                    <View style={styles.quickOverviewItem}>
                      <Text style={styles.quickOverviewLabel}>Prix mini</Text>
                      <Text style={styles.quickOverviewValue}>{minTierPrice.toFixed(2)}€</Text>
                    </View>
                    <View style={styles.quickOverviewItem}>
                      <Text style={styles.quickOverviewLabel}>Prix maxi</Text>
                      <Text style={styles.quickOverviewValue}>{maxTierPrice.toFixed(2)}€</Text>
                    </View>
                    <View style={styles.quickOverviewItem}>
                      <Text style={styles.quickOverviewLabel}>Paliers</Text>
                      <Text style={styles.quickOverviewValue}>{deliverySettings.tierPrices.length}</Text>
                    </View>
                    <View style={styles.quickOverviewItem}>
                      <Text style={styles.quickOverviewLabel}>Max</Text>
                      <Text style={styles.quickOverviewValue}>{deliverySettings.maxDistance}km</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Deuxième ligne : Cartes de paramètres */}
              <View style={styles.settingsRowTablet}>
                {renderSettingCard(
                  'Prix par palier',
                  `${deliverySettings.tierPrices.length} paliers de 1 km • ${minTierPrice.toFixed(2)}€ à ${maxTierPrice.toFixed(2)}€`,
                  'Modifier',
                  () => openEditModal('prices'),
                  'card-outline'
                )}

                {renderSettingCard(
                  'Distance maximale',
                  'Limite de livraison depuis le restaurant',
                  `${deliverySettings.maxDistance} km`,
                  () => openEditModal('distance'),
                  'compass-outline'
                )}
              </View>

              {/* Troisième ligne : Information détaillée */}
              <View style={[styles.infoCard, styles.infoCardTablet]}>
                <View style={[styles.infoHeader, styles.infoHeaderTablet]}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="information-circle" size={28} color="#0066cc" />
                  </View>
                  <Text style={[styles.infoTitle, styles.infoTitleTablet]}>
                    Tarifs par palier de distance
                  </Text>
                </View>
                <View style={styles.infoGridTablet}>
                  <View style={styles.infoColumn}>
                    {deliverySettings.tierPrices
                      .slice(0, Math.ceil(deliverySettings.tierPrices.length / 2))
                      .map((price, index) => (
                        <View key={index} style={styles.infoZoneCard}>
                          <Text style={styles.infoZoneTitle}>{getTierLabel(index)}</Text>
                          <Text style={styles.infoZonePrice}>{price.toFixed(2)}€</Text>
                        </View>
                      ))}
                  </View>
                  <View style={styles.infoColumn}>
                    {deliverySettings.tierPrices
                      .slice(Math.ceil(deliverySettings.tierPrices.length / 2))
                      .map((price, index) => {
                        const tierIndex = Math.ceil(deliverySettings.tierPrices.length / 2) + index;
                        return (
                          <View key={tierIndex} style={styles.infoZoneCard}>
                            <Text style={styles.infoZoneTitle}>{getTierLabel(tierIndex)}</Text>
                            <Text style={styles.infoZonePrice}>{price.toFixed(2)}€</Text>
                          </View>
                        );
                      })}
                    <View style={styles.infoZoneCard}>
                      <Text style={styles.infoZoneTitle}>Au-delà • +{deliverySettings.maxDistance}km</Text>
                      <Text style={styles.infoZoneUnavailable}>Non disponible</Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : (
            // Layout mobile standard
            <>
              {/* Restaurant Address */}
              <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Ionicons name="location" size={24} color="#000000" />
                  <Text style={styles.addressTitle}>Adresse du restaurant</Text>
                </View>
                <Text style={styles.addressText}>{deliverySettings.restaurantAddress}</Text>
              </View>

              {/* Settings Grid for Mobile */}
              <View style={styles.settingsGrid}>
                {renderSettingCard(
                  'Prix par palier',
                  `${deliverySettings.tierPrices.length} paliers de 1 km • ${minTierPrice.toFixed(2)}€ à ${maxTierPrice.toFixed(2)}€`,
                  'Modifier',
                  () => openEditModal('prices'),
                  'card-outline'
                )}

                {renderSettingCard(
                  'Distance maximale',
                  'Limite de livraison depuis le restaurant',
                  `${deliverySettings.maxDistance} km`,
                  () => openEditModal('distance'),
                  'compass-outline'
                )}
              </View>

              {/* Information Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={24} color="#0066cc" />
                  <Text style={styles.infoTitle}>Comment ça marche</Text>
                </View>
                <View style={styles.infoList}>
                  {deliverySettings.tierPrices.map((price, index) => (
                    <Text key={index} style={styles.infoItem}>
                      • Distance {getTierLabel(index)} : {price.toFixed(2)}€
                    </Text>
                  ))}
                  <Text style={styles.infoItem}>• Distance &gt; {deliverySettings.maxDistance}km : Livraison impossible</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {renderModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: 100, // Space for tab bar
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginLeft: spacing.sm,
  },
  addressText: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
  },
  settingCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingValueText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: '#000000',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.2)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: '#0066cc',
    marginLeft: spacing.sm,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray700,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  // Liste des paliers dans le modal : reste scrollable même avec 10 lignes
  tierScroll: {
    maxHeight: 380,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    backgroundColor: colors.neutral.gray50,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },

  // ========== STYLES TABLETTE PAYSAGE ==========

  // Container principal
  settingsContainerTablet: {
    paddingHorizontal: spacing.xl * 1.5,
    paddingTop: spacing.xl,
  },

  settingsContent: {
    flexGrow: 1,
  },

  settingsContentTablet: {
    paddingBottom: spacing.xl * 2,
  },

  // Layout en lignes pour tablette
  topRowTablet: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  settingsRowTablet: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  // Grille pour les cartes sur tablette
  settingsGrid: {
    // Style de base (mobile) - éléments empilés verticalement
  },
  settingsGridTablet: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },

  // Carte d'adresse pour tablette
  addressCardTablet: {
    flex: 1.2,
    padding: spacing.xl * 1.2,
    marginBottom: 0,
    borderRadius: borderRadius.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 140,
  },

  addressHeaderTablet: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },

  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  addressTitleTablet: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
  },

  addressTextTablet: {
    fontSize: typography.fontSizes.base,
    lineHeight: typography.fontSizes.base * 1.6,
    color: colors.neutral.gray700,
  },

  // Carte aperçu rapide
  quickOverviewCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl * 1.2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 140,
  },

  quickOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  quickOverviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  quickOverviewTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },

  quickOverviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },

  quickOverviewItem: {
    alignItems: 'center',
    flex: 1,
  },

  quickOverviewLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },

  quickOverviewValue: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },

  // Cartes de paramètres pour tablette
  settingCardTablet: {
    flex: 1,
    padding: spacing.xl * 1.2,
    borderRadius: borderRadius.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 120,
    marginBottom: 0,
  },

  settingIconTablet: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.lg,
  },

  settingTitleTablet: {
    fontSize: typography.fontSizes.lg,
    marginBottom: spacing.sm,
  },

  settingSubtitleTablet: {
    fontSize: typography.fontSizes.base,
    lineHeight: typography.fontSizes.base * 1.4,
  },

  settingValueTextTablet: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
  },

  // Carte d'information pour tablette
  infoCardTablet: {
    padding: spacing.xl * 1.5,
    borderRadius: borderRadius.xl,
    marginTop: 0,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  infoHeaderTablet: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },

  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  infoTitleTablet: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
  },

  infoItemTablet: {
    fontSize: typography.fontSizes.base,
    lineHeight: typography.fontSizes.base * 1.6,
  },

  // Grille d'information pour tablette
  infoGridTablet: {
    flexDirection: 'row',
    gap: spacing.xl,
  },

  infoColumn: {
    flex: 1,
    gap: spacing.md,
  },

  infoZoneCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.1)',
    alignItems: 'center',
  },

  infoZoneTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },

  infoZonePrice: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
    marginBottom: spacing.xs,
  },

  infoZoneUnavailable: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray400,
    marginBottom: spacing.xs,
  },

  infoZoneDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: typography.fontSizes.xs * 1.4,
  },

  // Modal pour tablette
  modalContainerTablet: {
    width: '70%',
    maxWidth: 700,
    minWidth: 500,
    maxHeight: '80%',
    borderRadius: borderRadius['2xl'],
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 25,
  },

  modalTitleTablet: {
    fontSize: typography.fontSizes.xl,
  },

  modalContentTablet: {
    padding: spacing.xl,
  },

  // Inputs pour tablette
  inputContainerTablet: {
    marginBottom: spacing.xl,
  },

  inputLabelTablet: {
    fontSize: typography.fontSizes.lg,
    marginBottom: spacing.md,
  },

  priceInputTablet: {
    padding: spacing.lg,
    fontSize: typography.fontSizes.lg,
    borderRadius: borderRadius.lg,
  },

  // Boutons du modal pour tablette
  modalButtonsTablet: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },

  cancelButtonTablet: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },

  cancelButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
  },

  saveButtonTablet: {
    borderRadius: borderRadius.lg,
  },

  saveButtonGradientTablet: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },

  saveButtonTextTablet: {
    fontSize: typography.fontSizes.lg,
  },
});