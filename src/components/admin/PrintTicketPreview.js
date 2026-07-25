import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import printerService from '../../services/PrinterService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Police à chasse fixe, comme sur une imprimante thermique
const MONO_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

// Dents de scie du bord déchiré du papier
const TEETH_COUNT = 30;

const PaperTearEdge = ({ position }) => (
  <View style={[styles.tearRow, position === 'top' ? styles.tearTop : styles.tearBottom]}>
    {Array.from({ length: TEETH_COUNT }).map((_, index) => (
      <View key={index} style={styles.tooth} />
    ))}
  </View>
);

export default function PrintTicketPreview({ visible, order, onClose, autoPrinted = false }) {
  // Sortie du papier : le ticket se déroule vers le bas
  const paperFeed = useRef(new Animated.Value(0)).current;

  const lines = useMemo(() => {
    if (!order) return [];
    try {
      return printerService.getTicketPreviewLines(order);
    } catch (error) {
      console.error('❌ Erreur génération aperçu ticket:', error);
      return [];
    }
  }, [order]);

  useEffect(() => {
    if (visible) {
      paperFeed.setValue(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.timing(paperFeed, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, order]);

  if (!order) return null;

  const translateY = paperFeed.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_HEIGHT * 0.5, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Ionicons name="print" size={16} color="#22C55E" />
            <Text style={styles.headerBadgeText}>
              {autoPrinted ? 'Ticket imprimé' : 'Aperçu du ticket'}
            </Text>
          </View>
          <Text style={styles.headerHint}>
            Simulation du rendu imprimante Epson TM-M30II
          </Text>
        </View>

        <Animated.View style={[styles.paperWrapper, { transform: [{ translateY }] }]}>
          <PaperTearEdge position="top" />

          <ScrollView
            style={styles.paper}
            contentContainerStyle={styles.paperContent}
            showsVerticalScrollIndicator={false}
          >
            {lines.map((line, index) => (
              <Text
                key={index}
                style={[
                  styles.line,
                  line.bold && styles.lineBold,
                  line.center && styles.lineCenter,
                  line.large && styles.lineLarge,
                ]}
              >
                {line.text || ' '}
              </Text>
            ))}
          </ScrollView>

          <PaperTearEdge position="bottom" />
        </Animated.View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={20} color={colors.neutral.white} />
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  headerBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#22C55E',
  },
  headerHint: {
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Le rouleau de papier
  paperWrapper: {
    width: 300,
    maxHeight: '72%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
  },
  paper: {
    backgroundColor: '#FCFCFA',
  },
  paperContent: {
    paddingHorizontal: 18,
    paddingVertical: spacing.md,
  },
  line: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    lineHeight: 16,
    color: '#1A1A1A',
  },
  lineBold: {
    fontWeight: 'bold',
  },
  lineCenter: {
    textAlign: 'center',
  },
  lineLarge: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 'bold',
  },

  // Bords déchirés du papier
  tearRow: {
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
  tearTop: {
    alignItems: 'flex-start',
  },
  tearBottom: {
    alignItems: 'flex-end',
  },
  tooth: {
    flex: 1,
    height: 8,
    backgroundColor: '#FCFCFA',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: -1,
  },

  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  closeButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
});
