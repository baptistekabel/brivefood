import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

export default function DeliveryPriceManagement() {
  const [deliverySettings, setDeliverySettings] = useState({
    restaurantAddress: '23 Bis Avenue Du Président Roosevelt, Brive-La-Gaillarde',
    priceZone1: 5.00, // 0-3km
    priceZone2: 6.00, // 3-5km  
    priceZone3: 10.00, // 5-10km
    maxDistance: 10,
  });
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editType, setEditType] = useState(''); // 'prices', 'distance'
  const [tempPriceZone1, setTempPriceZone1] = useState('');
  const [tempPriceZone2, setTempPriceZone2] = useState('');
  const [tempPriceZone3, setTempPriceZone3] = useState('');
  const [tempMaxDistance, setTempMaxDistance] = useState('');

  useEffect(() => {
    loadDeliverySettings();
  }, []);

  const loadDeliverySettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('@deliverySettings');
      if (storedSettings) {
        setDeliverySettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading delivery settings:', error);
    }
  };

  const saveDeliverySettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('@deliverySettings', JSON.stringify(newSettings));
      setDeliverySettings(newSettings);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Paramètres de livraison mis à jour');
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const openEditModal = (type) => {
    setEditType(type);
    
    if (type === 'prices') {
      setTempPriceZone1(deliverySettings.priceZone1.toString());
      setTempPriceZone2(deliverySettings.priceZone2.toString());
      setTempPriceZone3(deliverySettings.priceZone3.toString());
    } else if (type === 'distance') {
      setTempMaxDistance(deliverySettings.maxDistance.toString());
    }
    
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    let newSettings = { ...deliverySettings };
    
    if (editType === 'prices') {
      const priceZone1 = parseFloat(tempPriceZone1);
      const priceZone2 = parseFloat(tempPriceZone2);
      const priceZone3 = parseFloat(tempPriceZone3);
      
      if (isNaN(priceZone1) || isNaN(priceZone2) || isNaN(priceZone3) || 
          priceZone1 < 0 || priceZone2 < 0 || priceZone3 < 0) {
        Alert.alert('Erreur', 'Veuillez entrer des prix valides');
        return;
      }
      
      if (priceZone2 <= priceZone1 || priceZone3 <= priceZone2) {
        Alert.alert('Erreur', 'Les prix doivent être croissants (Zone 1 < Zone 2 < Zone 3)');
        return;
      }
      
      newSettings.priceZone1 = priceZone1;
      newSettings.priceZone2 = priceZone2;
      newSettings.priceZone3 = priceZone3;
      
    } else if (editType === 'distance') {
      const maxDistance = parseFloat(tempMaxDistance);
      
      if (isNaN(maxDistance) || maxDistance <= 0 || maxDistance > 50) {
        Alert.alert('Erreur', 'Veuillez entrer une distance valide (1-50 km)');
        return;
      }
      
      newSettings.maxDistance = maxDistance;
    }
    
    await saveDeliverySettings(newSettings);
    setIsModalVisible(false);
  };


  const renderSettingCard = (title, subtitle, value, onPress, icon) => (
    <TouchableOpacity style={styles.settingCard} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#000000" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.settingValue}>
        <Text style={styles.settingValueText}>{value}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray400} />
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => {
    let title = '';
    let content = null;
    
    switch (editType) {
      case 'prices':
        title = 'Modifier les prix de livraison';
        content = (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Zone 1 (0-3km)</Text>
              <TextInput
                style={styles.priceInput}
                value={tempPriceZone1}
                onChangeText={setTempPriceZone1}
                keyboardType="decimal-pad"
                placeholder="5.00"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Zone 2 (3-5km)</Text>
              <TextInput
                style={styles.priceInput}
                value={tempPriceZone2}
                onChangeText={setTempPriceZone2}
                keyboardType="decimal-pad"
                placeholder="6.00"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Zone 3 (5-10km)</Text>
              <TextInput
                style={styles.priceInput}
                value={tempPriceZone3}
                onChangeText={setTempPriceZone3}
                keyboardType="decimal-pad"
                placeholder="10.00"
              />
            </View>
          </>
        );
        break;
        
      case 'distance':
        title = 'Modifier la distance maximale';
        content = (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Distance maximale de livraison (km)</Text>
            <TextInput
              style={styles.priceInput}
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
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.neutral.gray600} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {content}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <LinearGradient
                    colors={['#000000', '#000000', '#000000']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
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
          <Text style={styles.headerTitle}>Paramètres Livraison</Text>
        </View>

        {/* Settings Container */}
        <View style={styles.settingsContainer}>
          {/* Restaurant Address */}
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={24} color="#000000" />
              <Text style={styles.addressTitle}>Adresse du restaurant</Text>
            </View>
            <Text style={styles.addressText}>{deliverySettings.restaurantAddress}</Text>
          </View>

          {/* Delivery Prices */}
          {renderSettingCard(
            'Prix de livraison',
            `0-3km: ${deliverySettings.priceZone1.toFixed(2)}€ • 3-5km: ${deliverySettings.priceZone2.toFixed(2)}€ • 5-10km: ${deliverySettings.priceZone3.toFixed(2)}€`,
            'Modifier',
            () => openEditModal('prices'),
            'card-outline'
          )}

          {/* Maximum Distance */}
          {renderSettingCard(
            'Distance maximale',
            'Limite de livraison depuis le restaurant',
            `${deliverySettings.maxDistance} km`,
            () => openEditModal('distance'),
            'compass-outline'
          )}


          {/* Information Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#0066cc" />
              <Text style={styles.infoTitle}>Comment ça marche</Text>
            </View>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Distance 0-3km : {deliverySettings.priceZone1.toFixed(2)}€</Text>
              <Text style={styles.infoItem}>• Distance 3-5km : {deliverySettings.priceZone2.toFixed(2)}€</Text>
              <Text style={styles.infoItem}>• Distance 5-10km : {deliverySettings.priceZone3.toFixed(2)}€</Text>
              <Text style={styles.infoItem}>• Distance > {deliverySettings.maxDistance}km : Livraison impossible</Text>
            </View>
          </View>
        </View>

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
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
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
});