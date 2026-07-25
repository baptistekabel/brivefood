import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

// Confirmation passagère, en remplacement des Alert bloquantes : en plein
// service, un message qui exige un appui sur « OK » immobilise la tablette et
// la commande suivante attend.
const DEFAULT_DURATION = 2000;

export default function Toast({
  visible,
  message,
  icon = 'checkmark-circle',
  tone = 'success',
  duration = DEFAULT_DURATION,
  onHide,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const hideTimer = useRef(null);

  useEffect(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (!visible) {
      opacity.setValue(0);
      translateY.setValue(-20);
      return undefined;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();

    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 220, useNativeDriver: true }),
      ]).start(() => onHide && onHide());
    }, duration);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible, message, duration]);

  if (!visible) return null;

  const toneStyle = tone === 'error' ? styles.error : styles.success;
  const toneColor = tone === 'error' ? '#DC2626' : '#16A34A';

  return (
    <Animated.View
      style={[styles.container, toneStyle, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Ionicons name={icon} size={20} color={toneColor} />
      <Text style={[styles.message, { color: toneColor }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    elevation: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  success: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  message: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
  },
});
