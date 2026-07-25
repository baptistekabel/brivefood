import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import tabletPrinterService from '../../src/services/TabletPrinterService';
import bluetoothPrinterService from '../../src/services/BluetoothPrinterService';

export default function TabletSetup() {
  const [isTabletMode, setIsTabletMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // États pour Bluetooth
  const [connectedPrinter, setConnectedPrinter] = useState(null);
  const [discoveredPrinters, setDiscoveredPrinters] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');

  // États pour configuration manuelle
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [selectedManualPrinter, setSelectedManualPrinter] = useState(null);
  const [macAddress, setMacAddress] = useState('');

  // Formater l'adresse MAC pendant la saisie
  const handleMacAddressChange = (text) => {
    // Supprimer les ":" existants pour permettre la saisie libre
    const withoutColons = text.replace(/:/g, '');

    // Garder seulement les caractères hexadécimaux
    const hexOnly = withoutColons.replace(/[^0-9A-Fa-f]/g, '');

    // Limiter à 12 caractères
    const limited = hexOnly.slice(0, 12);

    // Formater avec les ":"
    let formatted = '';
    for (let i = 0; i < limited.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formatted += ':';
      }
      formatted += limited[i];
    }

    // Convertir en majuscules
    setMacAddress(formatted.toUpperCase());
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Activer automatiquement le mode tablette à chaque connexion
      await tabletPrinterService.enableTabletMode();
      setIsTabletMode(true);

      // Charger l'imprimante Bluetooth connectée
      const savedPrinter = await bluetoothPrinterService.getConnectedPrinter();
      setConnectedPrinter(savedPrinter);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const handleToggleTabletMode = async (enabled) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (enabled) {
        // Activer le mode tablette
        await tabletPrinterService.enableTabletMode();
        setIsTabletMode(true);
        
        Alert.alert(
          '🏪 Mode Tablette Activé',
          'Cette tablette va maintenant imprimer automatiquement toutes les nouvelles commandes.',
          [{ text: 'OK' }]
        );
      } else {
        // Désactiver le mode tablette
        await tabletPrinterService.disableTabletMode();
        setIsTabletMode(false);
        
        Alert.alert(
          '📱 Mode Tablette Désactivé',
          'L\'impression automatique est arrêtée.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Erreur toggle mode tablette:', error);
      Alert.alert('Erreur', 'Impossible de modifier le mode tablette');
    } finally {
      setLoading(false);
    }
  };

  // Rechercher les imprimantes Bluetooth
  const handleScanPrinters = async () => {
    try {
      setIsScanning(true);
      setDiscoveredPrinters([]); // Vider la liste pendant la recherche
      setScanProgress(0);
      setScanPhase('Initialisation...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('🔍 Début de la recherche Bluetooth...');

      // Simuler la progression de scan
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 1;
        });
      }, 100); // Mise à jour toutes les 100ms

      // Mettre à jour les phases avec messages plus clairs
      setTimeout(() => setScanPhase('Recherche Bluetooth en cours...'), 1000);
      setTimeout(() => setScanPhase('Vérification appareils jumelés...'), 3000);
      setTimeout(() => setScanPhase('Recherche EPSON TM-M30III...'), 5000);
      setTimeout(() => setScanPhase('Préparation options de configuration...'), 8000);
      setTimeout(() => setScanPhase('Finalisation...'), 10000);

      const result = await bluetoothPrinterService.discoverPrinters();

      clearInterval(progressInterval);
      setScanProgress(100);

      if (result.success) {
        setDiscoveredPrinters(result.devices);

        // Toujours afficher les résultats (y compris options manuelles EPSON)
        if (result.devices.length === 0) {
          console.log('📱 Aucun appareil trouvé, affichage options EPSON...');
          Alert.alert(
            '🔍 Bluetooth non disponible',
            'Aucune imprimante détectée automatiquement.\n\n📱 Raisons possibles :\n• Bluetooth désactivé sur l\'imprimante EPSON\n• Imprimante non en mode "Découvrable"\n• Permissions Bluetooth manquantes\n\nVous pouvez configurer manuellement ci-dessous.',
            [{ text: 'OK' }]
          );
        } else {
          // Compter les options manuelles vs appareils réels
          const manualDevices = result.devices.filter(d => d.isManual || d.isCommon).length;
          const realDevices = result.devices.length - manualDevices;

          if (realDevices > 0) {
            Alert.alert(
              '✅ Imprimantes trouvées',
              `${realDevices} imprimante(s) détectée(s) automatiquement + ${manualDevices} option(s) de configuration manuelle.`,
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              '🔧 Options de configuration',
              'Aucune imprimante détectée automatiquement, mais plusieurs options de configuration manuelle sont disponibles.\n\n💡 Activez le Bluetooth sur votre EPSON TM-M30III et réessayez.',
              [{ text: 'OK' }]
            );
          }
        }
      } else {
        // En cas d'erreur, proposer aussi les options manuelles
        console.log('❌ Erreur recherche, affichage options manuelles...');
        const manualOptions = await bluetoothPrinterService.getManualPrinterOptions();
        setDiscoveredPrinters(manualOptions);

        Alert.alert(
          'Recherche Bluetooth échouée',
          `${result.error || 'Erreur inconnue'}\n\nVous pouvez configurer manuellement votre EPSON TM-M30 ci-dessous.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erreur recherche imprimantes:', error);

      // En cas d'exception, proposer les options manuelles
      try {
        const manualOptions = await bluetoothPrinterService.getManualPrinterOptions();
        setDiscoveredPrinters(manualOptions);
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError);
      }

      Alert.alert(
        'Erreur de recherche',
        'Impossible d\'effectuer la recherche Bluetooth.\n\nVous pouvez configurer manuellement votre EPSON TM-M30 ci-dessous.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanPhase('');
    }
  };

  // Se connecter à une imprimante
  const handleConnectPrinter = async (printer) => {
    try {
      setIsConnecting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await bluetoothPrinterService.connectToPrinter(printer);

      if (result.success) {
        setConnectedPrinter(result.printer);
        Alert.alert(
          '✅ Connexion réussie',
          result.message,
          [{ text: 'OK' }]
        );
      } else if (result.requiresManualSetup) {
        // Ouvrir le modal de configuration manuelle
        setSelectedManualPrinter(printer);
        setMacAddress('');
        setIsManualModalVisible(true);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de se connecter');
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      Alert.alert('Erreur', 'Erreur lors de la connexion');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connecter une imprimante manuellement
  const handleManualConnect = async () => {
    try {
      const trimmedMac = macAddress.trim();

      if (!trimmedMac) {
        Alert.alert('Erreur', 'Veuillez saisir une adresse MAC');
        return;
      }

      // Vérifier que l'adresse MAC est complète
      if (trimmedMac.length !== 17) {
        Alert.alert(
          'Adresse MAC incomplète',
          'L\'adresse MAC doit contenir 12 caractères hexadécimaux.\nFormat attendu: XX:XX:XX:XX:XX:XX',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsConnecting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await bluetoothPrinterService.connectManualPrinter(
        selectedManualPrinter,
        trimmedMac
      );

      if (result.success) {
        setConnectedPrinter(result.printer);
        setIsManualModalVisible(false);
        setMacAddress('');
        setSelectedManualPrinter(null);

        Alert.alert(
          '✅ Connexion réussie',
          result.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de se connecter');
      }
    } catch (error) {
      console.error('Erreur connexion manuelle:', error);
      Alert.alert('Erreur', 'Erreur lors de la connexion');
    } finally {
      setIsConnecting(false);
    }
  };

  // Fermer le modal de configuration manuelle
  const closeManualModal = () => {
    setIsManualModalVisible(false);
    setMacAddress('');
    setSelectedManualPrinter(null);
  };

  // Déconnecter l'imprimante
  const handleDisconnectPrinter = async () => {
    try {
      const result = await bluetoothPrinterService.disconnectPrinter();

      if (result.success) {
        setConnectedPrinter(null);
        Alert.alert('✅ Déconnexion', result.message);
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  // Tester l'impression
  const handleTestPrint = async () => {
    try {
      setIsTesting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await bluetoothPrinterService.testPrint();

      if (result.success) {
        Alert.alert('✅ Test réussi', result.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('❌ Test échoué', result.error);
      }
    } catch (error) {
      console.error('Erreur test:', error);
      Alert.alert('Erreur', 'Erreur lors du test');
    } finally {
      setIsTesting(false);
    }
  };

  // Rendu d'une imprimante découverte
  const renderDiscoveredPrinter = ({ item: printer }) => (
    <TouchableOpacity
      style={styles.printerItem}
      onPress={() => handleConnectPrinter(printer)}
      disabled={isConnecting}
    >
      <View style={styles.printerIcon}>
        <Ionicons
          name="print"
          size={24}
          color={printer.paired ? colors.status.success : colors.neutral.gray500}
        />
      </View>

      <View style={styles.printerInfo}>
        <Text style={styles.printerName}>{printer.name}</Text>
        <Text style={styles.printerAddress}>
          {printer.isManual ? 'Configuration requise' : printer.address}
        </Text>
        <View style={styles.printerMeta}>
          {!printer.isManual && (
            <Text style={styles.printerSignal}>Signal: {printer.rssi}dBm</Text>
          )}
          {printer.paired && (
            <View style={styles.pairedBadge}>
              <Text style={styles.pairedText}>Jumelé</Text>
            </View>
          )}
          {printer.isManual && (
            <View style={styles.manualBadge}>
              <Text style={styles.manualText}>Manuel</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray400} />
    </TouchableOpacity>
  );


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

          <Text style={styles.headerTitle}>Configuration Tablette</Text>

          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isTabletMode ? '#4CAF50' : '#FF5722' }]} />
            <Text style={styles.statusText}>
              {isTabletMode ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          
          {/* Mode Tablette */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="tablet-portrait" size={24} color="#000000" />
              <Text style={styles.cardTitle}>Mode Tablette Restaurant</Text>
            </View>
            
            <Text style={styles.cardDescription}>
              Activez cette option pour que cette tablette imprime automatiquement 
              toutes les nouvelles commandes reçues.
            </Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {isTabletMode ? '🏪 Mode activé' : '📱 Mode désactivé'}
              </Text>
              <Switch
                value={isTabletMode}
                onValueChange={handleToggleTabletMode}
                disabled={loading}
                trackColor={{ false: '#767577', true: '#000000' }}
                thumbColor={isTabletMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Configuration Imprimante Bluetooth */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bluetooth" size={24} color="#2196F3" />
              <Text style={styles.cardTitle}>Imprimante Bluetooth</Text>
            </View>

            <Text style={styles.cardDescription}>
              Connectez votre imprimante EPSON TM-M30III via Bluetooth pour imprimer automatiquement
              les commandes cuisine.
            </Text>

            {/* Instructions activation Bluetooth */}
            <View style={styles.bluetoothInstructions}>
              <Text style={styles.instructionTitle}>📋 Avant de continuer :</Text>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Activez le Bluetooth sur votre EPSON TM-M30III
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.instructionText}>
                  Rendez l'imprimante "découvrable" (voir manuel)
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Vérifiez le voyant Bluetooth 🔵 allumé
                </Text>
              </View>
            </View>

            {/* Imprimante connectée */}
            {connectedPrinter ? (
              <View style={styles.connectedPrinterCard}>
                <View style={styles.connectedHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                  <Text style={styles.connectedTitle}>Imprimante connectée</Text>
                </View>

                <Text style={styles.connectedName}>{connectedPrinter.name}</Text>
                <Text style={styles.connectedAddress}>{connectedPrinter.address}</Text>

                <View style={styles.connectedActions}>
                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={handleTestPrint}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <ActivityIndicator size="small" color={colors.neutral.white} />
                    ) : (
                      <Ionicons name="print" size={16} color={colors.neutral.white} />
                    )}
                    <Text style={styles.testButtonText}>
                      {isTesting ? 'Test...' : 'Test'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={handleDisconnectPrinter}
                  >
                    <Ionicons name="close" size={16} color={colors.status.error} />
                    <Text style={styles.disconnectButtonText}>Déconnecter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Bouton recherche */}
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanPrinters}
                  disabled={isScanning}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.scanButtonGradient}
                  >
                    {isScanning ? (
                      <ActivityIndicator size="small" color={colors.neutral.white} />
                    ) : (
                      <Ionicons name="search" size={16} color={colors.neutral.white} />
                    )}
                    <Text style={styles.scanButtonText}>
                      {isScanning ? 'Scan Bluetooth...' : 'Rechercher imprimantes'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Message pendant la recherche */}
                {isScanning && (
                  <View style={styles.scanningInfo}>
                    <Ionicons name="bluetooth" size={24} color={colors.status.info} />

                    <Text style={styles.scanningText}>
                      Recherche d'imprimantes Bluetooth en cours...
                    </Text>

                    <Text style={styles.scanningPhase}>
                      {scanPhase}
                    </Text>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${scanProgress}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{scanProgress}%</Text>
                    </View>

                    <Text style={styles.scanningSubtext}>
                      Recherche approfondie... Cela peut prendre 10-15 secondes
                    </Text>

                    <Text style={styles.scanningHint}>
                      💡 Assurez-vous que votre imprimante est allumée et visible
                    </Text>
                  </View>
                )}

                {/* Liste des imprimantes découvertes */}
                {!isScanning && discoveredPrinters.length > 0 && (
                  <View style={styles.discoveredSection}>
                    <Text style={styles.discoveredTitle}>
                      {discoveredPrinters.some(p => p.isManual)
                        ? 'Configuration EPSON TM-M30'
                        : `Imprimantes trouvées (${discoveredPrinters.length})`}
                    </Text>

                    <FlatList
                      data={discoveredPrinters}
                      renderItem={renderDiscoveredPrinter}
                      keyExtractor={(item) => item.id}
                      style={styles.printersList}
                      scrollEnabled={false}
                    />
                  </View>
                )}
              </>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#2196F3" />
              <Text style={styles.cardTitle}>Comment ça marche</Text>
            </View>
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Placez cette tablette au restaurant
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.instructionText}>
                  Activez le "Mode Tablette Restaurant"
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Chaque nouvelle commande s'affichera automatiquement !
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal de configuration manuelle */}
        <Modal
          visible={isManualModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeManualModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Configuration Manuelle</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeManualModal}
                  >
                    <Ionicons name="close" size={24} color={colors.neutral.gray600} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {selectedManualPrinter && (
                    <>
                      <View style={styles.printerInfoModal}>
                        <Ionicons name="print" size={32} color={colors.primary.main} />
                        <Text style={styles.printerNameModal}>
                          {selectedManualPrinter.name}
                        </Text>
                        <Text style={styles.printerDescModal}>
                          {selectedManualPrinter.description}
                        </Text>
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Adresse MAC de l'imprimante</Text>
                        <Text style={styles.inputHint}>
                          Format: XX:XX:XX:XX:XX:XX (ex: 68:96:7A:12:34:56)
                        </Text>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            style={[
                              styles.textInput,
                              macAddress.length === 17 ? styles.textInputValid : styles.textInputNormal
                            ]}
                            value={macAddress}
                            onChangeText={handleMacAddressChange}
                            placeholder="Ex: 68967A123456"
                            placeholderTextColor={colors.neutral.gray400}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            editable={!isConnecting}
                            keyboardType="ascii-capable"
                          />
                          {macAddress.length === 17 && (
                            <View style={styles.validIcon}>
                              <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                            </View>
                          )}
                        </View>

                        {macAddress.length > 0 && macAddress.length < 17 && (
                          <Text style={styles.progressText}>
                            {macAddress.length}/17 caractères - Continuez à taper...
                          </Text>
                        )}

                        {macAddress.length === 17 && (
                          <Text style={styles.validText}>
                            ✅ Adresse MAC valide !
                          </Text>
                        )}
                      </View>


                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={closeManualModal}
                          disabled={isConnecting}
                        >
                          <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
                          onPress={handleManualConnect}
                          disabled={isConnecting}
                        >
                          <LinearGradient
                            colors={isConnecting ? ['#cccccc', '#cccccc'] : ['#000000', '#000000']}
                            style={styles.connectButtonGradient}
                          >
                            {isConnecting ? (
                              <ActivityIndicator size="small" color={colors.neutral.white} />
                            ) : (
                              <Ionicons name="bluetooth" size={16} color={colors.neutral.white} />
                            )}
                            <Text style={styles.connectButtonText}>
                              {isConnecting ? 'Connexion...' : 'Connecter'}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginLeft: spacing.sm,
    flex: 1,
  },
  helpButton: {
    padding: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
  },
  instructionsList: {
    marginTop: spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    color: colors.neutral.white,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    marginRight: spacing.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray700,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.base,
  },
  // Styles Bluetooth
  connectedPrinterCard: {
    backgroundColor: colors.status.success + '10',
    borderWidth: 1,
    borderColor: colors.status.success + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  connectedTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.status.success,
    marginLeft: spacing.xs,
  },
  connectedName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs / 2,
  },
  connectedAddress: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.md,
  },
  connectedActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  testButton: {
    flex: 1,
    backgroundColor: colors.status.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  testButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.status.error,
    gap: spacing.xs,
  },
  disconnectButtonText: {
    color: colors.status.error,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  scanButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  scanButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
  },
  discoveredSection: {
    marginTop: spacing.lg,
  },
  discoveredTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray700,
    marginBottom: spacing.md,
  },
  printersList: {
    maxHeight: 300,
  },
  printerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  printerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs / 2,
  },
  printerAddress: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  printerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  printerSignal: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
  },
  pairedBadge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  pairedText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.semibold,
  },
  manualBadge: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  manualText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.semibold,
  },
  // Styles Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
  printerInfoModal: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  printerNameModal: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  printerDescModal: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  inputHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingRight: spacing['3xl'], // Espace pour l'icône
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    backgroundColor: colors.neutral.gray50,
    color: colors.neutral.gray800,
  },
  textInputNormal: {
    borderColor: colors.neutral.gray200,
  },
  textInputValid: {
    borderColor: colors.status.success,
    backgroundColor: colors.status.success + '10',
  },
  validIcon: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.medium,
  },
  validText: {
    fontSize: typography.fontSizes.sm,
    color: colors.status.success,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
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
  connectButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  connectButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  // Styles information de scan
  scanningInfo: {
    backgroundColor: colors.status.info + '10',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  scanningText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.status.info,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  scanningSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  scanningPhase: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.status.info,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.status.info,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.status.info,
    minWidth: 40,
    textAlign: 'right',
  },
  scanningHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray500,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Styles instructions Bluetooth
  bluetoothInstructions: {
    backgroundColor: colors.status.info + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.info,
  },
  instructionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.status.info,
    marginBottom: spacing.sm,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});