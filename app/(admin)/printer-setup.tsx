import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import epsonBluetoothService from '../../src/services/EpsonBluetoothService';

// Wrapper pour compatibilité - avec attente d'initialisation
const getPrinterService = () => ({
  waitForInit: async () => {
    console.log('⏳ Attente initialisation service Epson...');
    const result = await epsonBluetoothService.waitForInit();
    console.log('✅ Service initialisé:', result);
    return result;
  },
  getStatus: () => {
    const status = epsonBluetoothService.getStatus();
    console.log('📊 Status service:', status);
    return status;
  },
  disconnect: async () => epsonBluetoothService.disconnect(),
  printTest: async () => {
    await epsonBluetoothService.waitForInit();
    return epsonBluetoothService.printTest();
  },
  setAutoPrintEnabled: async (enabled: boolean) => epsonBluetoothService.setAutoPrintEnabled(enabled),
  connectToWiFi: async (ipAddress: string) => {
    await epsonBluetoothService.waitForInit();
    return epsonBluetoothService.connectToWiFiPrinter(ipAddress);
  },
});

interface PrinterStatus {
  isConnected: boolean;
  device: {
    name?: string;
    ip?: string;
    address?: string;
  } | null;
  autoPrintEnabled: boolean;
  moduleAvailable: boolean;
}

export default function PrinterSetup() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);

  // WiFi mode
  const [showWiFiInput, setShowWiFiInput] = useState(false);
  const [wifiAddress, setWifiAddress] = useState('');

  // Charger l'état initial
  useEffect(() => {
    loadPrinterStatus();
  }, []);

  // Charger le statut de l'imprimante
  const loadPrinterStatus = async () => {
    try {
      setIsLoading(true);

      const service = getPrinterService();

      // IMPORTANT: Attendre que le service soit initialisé
      console.log('⏳ Chargement statut imprimante...');
      await service.waitForInit();

      const status = service.getStatus();
      setPrinterStatus(status);
      setAutoPrintEnabled(status.autoPrintEnabled);

      console.log('📋 Statut imprimante:', status);
      console.log('   - isConnected:', status.isConnected);
      console.log('   - device:', status.device?.name);
      console.log('   - moduleAvailable:', status.moduleAvailable);

    } catch (error) {
      console.error('Erreur chargement statut:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrinterStatus();
    setRefreshing(false);
  }, []);

  // Déconnecter l'imprimante
  const disconnectPrinter = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Déconnecter l\'imprimante',
      'Voulez-vous vraiment déconnecter l\'imprimante ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            const result = await getPrinterService().disconnect();
            setPrinterStatus(getPrinterService().getStatus());
            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Déconnecté', 'Imprimante déconnectée.');
            }
          }
        }
      ]
    );
  };

  // Test d'impression
  const testPrint = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTesting(true);

    try {
      console.log('🧪 Lancement test impression...');
      const result = await getPrinterService().printTest();

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Succès !', 'Ticket test imprimé !');
      } else {
        Alert.alert('Échec', result.error || 'Impossible d\'imprimer');
      }

    } catch (error: any) {
      console.error('Erreur test impression:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setIsTesting(false);
    }
  };

  // Toggle impression automatique
  const toggleAutoPrint = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAutoPrintEnabled(value);
    await getPrinterService().setAutoPrintEnabled(value);
    setPrinterStatus(getPrinterService().getStatus());
  };

  // Connexion WiFi
  const connectWiFi = async () => {
    if (!wifiAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer l\'adresse IP de l\'imprimante');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsConnecting(true);

    try {
      console.log('📶 Connexion WiFi à:', wifiAddress);
      const result = await getPrinterService().connectToWiFi(wifiAddress.trim());

      if (result.success) {
        setPrinterStatus(getPrinterService().getStatus());
        setShowWiFiInput(false);
        setWifiAddress('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Succès !', `Imprimante WiFi configurée !\n\nIP: ${wifiAddress}\n\nTestez l'impression.`);
      } else {
        Alert.alert('Échec', result.error);
      }
    } catch (error: any) {
      console.error('Erreur connexion WiFi:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Render statut de connexion
  const renderConnectionStatus = () => {
    const isConnected = printerStatus?.isConnected;
    const device = printerStatus?.device;

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: isConnected ? '#22C55E' : '#EF4444' }
          ]}>
            <Ionicons
              name={isConnected ? 'checkmark' : 'close'}
              size={16}
              color="#FFF"
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {isConnected ? 'Imprimante connectee' : 'Non connectee'}
            </Text>
            {device && (
              <>
                <Text style={styles.statusSubtitle}>
                  {device.name}
                </Text>
                <Text style={styles.statusAddress}>
                  {device.ip || device.address?.replace('TCP:', '') || ''}
                </Text>
              </>
            )}
          </View>
        </View>

        {isConnected && (
          <View style={styles.statusActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={testPrint}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="print" size={18} color="#000" />
                  <Text style={styles.actionButtonText}>Test</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.disconnectButton]}
              onPress={disconnectPrinter}
            >
              <Ionicons name="unlink" size={18} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                Deconnecter
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render option impression auto
  const renderAutoPrintOption = () => (
    <View style={styles.optionCard}>
      <View style={styles.optionRow}>
        <View style={styles.optionInfo}>
          <Ionicons name="flash" size={24} color="#FF6B35" />
          <View style={styles.optionTexts}>
            <Text style={styles.optionTitle}>Impression automatique</Text>
            <Text style={styles.optionSubtitle}>
              Imprimer les tickets a chaque nouvelle commande
            </Text>
          </View>
        </View>
        <Switch
          value={autoPrintEnabled}
          onValueChange={toggleAutoPrint}
          trackColor={{ false: '#E5E5E5', true: '#FF6B35' }}
          thumbColor="#FFF"
        />
      </View>
    </View>
  );

  // Render bouton connexion WiFi
  const renderConnectButton = () => (
    <View style={styles.devicesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Connecter une imprimante</Text>
      </View>

      {/* Bouton WiFi */}
      <TouchableOpacity
        style={styles.wifiMainButton}
        onPress={() => setShowWiFiInput(true)}
      >
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={styles.wifiMainGradient}
        >
          <Ionicons name="wifi" size={24} color="#FFF" />
          <View style={styles.wifiMainText}>
            <Text style={styles.wifiMainTitle}>Connexion WiFi</Text>
            <Text style={styles.wifiMainSubtitle}>
              Connectez votre imprimante via le reseau
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#4CAF50" />
        <Text style={styles.infoText}>
          L'imprimante et l'iPhone doivent etre sur le meme reseau WiFi.
        </Text>
      </View>
    </View>
  );

  // Render input WiFi
  const renderWiFiInput = () => (
    <View style={styles.manualSection}>
      <Text style={styles.sectionTitle}>Configuration WiFi</Text>
      <View style={styles.manualInputCard}>
        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Ionicons name="wifi" size={24} color="#4CAF50" />
          <Text style={styles.instructionText}>
            <Text style={styles.instructionBold}>Connexion reseau{'\n\n'}</Text>
            Trouvez l'adresse IP de l'imprimante dans TM Utility ou imprimez un ticket de statut.
          </Text>
        </View>

        <Text style={styles.inputLabel}>Adresse IP de l'imprimante</Text>
        <TextInput
          style={styles.textInput}
          value={wifiAddress}
          onChangeText={setWifiAddress}
          placeholder="192.168.1.20"
          placeholderTextColor="#AAA"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
        <Text style={styles.inputHint}>
          Exemple: 192.168.1.20 ou 10.0.0.50
        </Text>

        <View style={styles.manualButtons}>
          <TouchableOpacity
            style={styles.cancelManualButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowWiFiInput(false);
              setWifiAddress('');
            }}
          >
            <Text style={styles.cancelManualText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.connectManualButton, !wifiAddress.trim() && styles.connectManualButtonDisabled]}
            onPress={connectWiFi}
            disabled={isConnecting || !wifiAddress.trim()}
          >
            <LinearGradient
              colors={wifiAddress.trim() ? ['#4CAF50', '#388E3C'] : ['#CCC', '#CCC']}
              style={styles.connectManualGradient}
            >
              {isConnecting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="wifi" size={18} color="#FFF" />
                  <Text style={styles.connectManualText}>Connecter</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render instructions
  const renderInstructions = () => (
    <View style={styles.instructionsCard}>
      <View style={styles.instructionHeader}>
        <Ionicons name="information-circle" size={24} color="#4CAF50" />
        <Text style={styles.instructionTitle}>Comment configurer</Text>
      </View>

      <View style={styles.instructionSteps}>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>
            Allumez votre imprimante et connectez-la au meme reseau WiFi
          </Text>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>
            Trouvez l'adresse IP de l'imprimante (TM Utility ou ticket de statut)
          </Text>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>
            Entrez l'adresse IP et appuyez sur "Connecter"
          </Text>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepText}>
            Testez l'impression avec le bouton "Test"
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

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
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Imprimante WiFi</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Statut de connexion */}
          {renderConnectionStatus()}

          {/* Option impression auto */}
          {renderAutoPrintOption()}

          {/* Input WiFi */}
          {showWiFiInput ? renderWiFiInput() : renderConnectButton()}

          {/* Instructions */}
          {!printerStatus?.isConnected && renderInstructions()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: spacing.md,
    color: '#FFF',
    fontSize: typography.fontSizes.base,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000',
  },
  statusSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: '#666',
    marginTop: 2,
  },
  statusAddress: {
    fontSize: typography.fontSizes.xs,
    color: '#999',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F0F0',
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#000',
  },
  disconnectButton: {
    backgroundColor: '#FEE2E2',
  },

  // Option Card
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTexts: {
    marginLeft: spacing.md,
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#000',
  },
  optionSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: '#666',
    marginTop: 2,
  },

  // Devices Section
  devicesSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#000',
  },
  wifiMainButton: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  wifiMainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  wifiMainText: {
    flex: 1,
  },
  wifiMainTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#FFF',
  },
  wifiMainSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: '#2E7D32',
    lineHeight: 20,
  },

  // Manual Section
  manualSection: {
    marginBottom: spacing.lg,
  },
  manualInputCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: '#2E7D32',
    lineHeight: 22,
  },
  instructionBold: {
    fontFamily: typography.fontFamily.bold,
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#000',
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.fontSizes.xl,
    backgroundColor: '#FFFFFF',
    fontFamily: 'monospace',
    color: '#000000',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  inputHint: {
    fontSize: typography.fontSizes.xs,
    color: '#999',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  manualButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelManualButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelManualText: {
    fontSize: typography.fontSizes.base,
    color: '#666',
  },
  connectManualButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  connectManualButtonDisabled: {
    opacity: 0.6,
  },
  connectManualGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  connectManualText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#FFF',
  },

  // Instructions
  instructionsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  instructionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#2E7D32',
    marginLeft: spacing.sm,
  },
  instructionSteps: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#FFF',
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: '#2E7D32',
    lineHeight: 20,
  },
});
