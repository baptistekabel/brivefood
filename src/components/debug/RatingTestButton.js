import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderRating } from '../../context/OrderRatingContext';
import { colors, typography, spacing } from '../../constants/theme';

export default function RatingTestButton() {
  const { triggerRatingRequest } = useOrderRating();

  const testOrderData = {
    orderId: 'TEST-' + Date.now(),
    customerName: 'Client Test',
    total: 25.90,
    orderDate: new Date().toLocaleDateString('fr-FR'),
    orderTime: new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
  };

  const handleTestRating = () => {
    console.log('🧪 Test du modal de notation');
    triggerRatingRequest(testOrderData);
  };

  // En mode développement seulement
  if (__DEV__) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTestRating}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={20} color={colors.neutral.white} />
          <Text style={styles.buttonText}>Test Notation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: spacing.lg,
    zIndex: 9999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.info,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
  },
});