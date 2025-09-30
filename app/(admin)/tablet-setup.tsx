import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import tabletPrinterService from '../../src/services/TabletPrinterService';

export default function TabletSetup() {
  const [isTabletMode, setIsTabletMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const tabletMode = await tabletPrinterService.checkTabletMode();
      setIsTabletMode(tabletMode);
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
});