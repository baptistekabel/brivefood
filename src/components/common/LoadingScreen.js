import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../constants/theme';
import useFonts from '../../hooks/useFonts';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ isVisible = true }) => {
  const fontsLoaded = useFonts();

  // Animations pour le logo
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  
  // Animations pour le texte
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  
  // Animation pour le pulse
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Animation pour la transition de sortie
  const fadeOutOpacity = useRef(new Animated.Value(1)).current;
  
  // Animations pour les emojis flottants (40 emojis pour le splash)
  const floatingEmojis = useRef(
    Array.from({ length: 40 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animation des emojis flottants
    const startFloatingEmojisAnimation = () => {
      floatingEmojis.forEach((animValue, index) => {
        const delay = (index * 150) + Math.random() * 3000; // Délai progressif + aléatoire pour éviter les groupes
        const duration = 5000 + Math.random() * 4000; // Animation plus uniforme
        
        setTimeout(() => {
          Animated.loop(
            Animated.timing(animValue, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            })
          ).start();
        }, delay);
      });
    };

    // Animation principale du logo
    const startLogoAnimation = () => {
      // 1. Apparition et rotation du logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Animation du texte (avec délai)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(textTranslateY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 400);
    };

    // Animation de pulse continue
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloatingEmojisAnimation();
    startLogoAnimation();
    startPulseAnimation();
  }, []);

  // Gestion de la transition de sortie
  useEffect(() => {
    if (!isVisible) {
      Animated.timing(fadeOutOpacity, {
        toValue: 0,
        duration: 2000, // Transition encore plus longue
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const rotateInterpolation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOutOpacity }]}>
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Emojis flottants de fast food */}
        {floatingEmojis.map((animValue, index) => {
          const fastFoodEmojis = ['🍔', '🍟', '🍕', '🌮', '🌭', '🥪', '🥙', '🍗', '🥓', '🌯', '🥯', '🥧', '🥤', '🥛', '☕', '🧃'];
          const currentEmoji = fastFoodEmojis[index % fastFoodEmojis.length];
          
          // Distribution plus équilibrée sur l'écran avec plus de variété
          const trajectoryType = index % 16; // Encore plus de types de trajectoires
          const laneIndex = index % 4; // 4 couloirs pour éviter les collisions
          const laneWidth = width / 4;
          let startX, endX, startY, endY;
          
          switch (trajectoryType) {
            case 0: // Du bas vers le haut - couloir assigné
              startX = laneIndex * laneWidth + Math.random() * (laneWidth * 0.8) + laneWidth * 0.1;
              endX = startX + (Math.random() - 0.5) * 80; // Moins de variation latérale
              startY = height + 100;
              endY = -100;
              break;
            case 1: // Du bas vers le haut - couloir décalé
              startX = ((laneIndex + 1) % 4) * laneWidth + Math.random() * (laneWidth * 0.8) + laneWidth * 0.1;
              endX = startX + (Math.random() - 0.5) * 60;
              startY = height + 100;
              endY = -100;
              break;
            case 2: // Du bas vers le haut - couloir opposé
              startX = ((laneIndex + 2) % 4) * laneWidth + Math.random() * (laneWidth * 0.8) + laneWidth * 0.1;
              endX = startX + (Math.random() - 0.5) * 80;
              startY = height + 100;
              endY = -100;
              break;
            case 3: // De la gauche vers la droite
              startX = -100;
              endX = width + 100;
              startY = height/3 + Math.random() * (height/3);
              endY = startY + (Math.random() - 0.5) * 200;
              break;
            case 4: // De la droite vers la gauche
              startX = width + 100;
              endX = -100;
              startY = height/3 + Math.random() * (height/3);
              endY = startY + (Math.random() - 0.5) * 200;
              break;
            case 5: // Du haut vers le bas - gauche
              startX = Math.random() * (width/2);
              endX = startX + (Math.random() - 0.5) * 100;
              startY = -100;
              endY = height + 100;
              break;
            case 6: // Du haut vers le bas - droite
              startX = width/2 + Math.random() * (width/2);
              endX = startX + (Math.random() - 0.5) * 100;
              startY = -100;
              endY = height + 100;
              break;
            case 7: // Diagonal gauche-droite
              startX = -100;
              endX = width + 100;
              startY = -100;
              endY = height + 100;
              break;
            case 8: // Diagonal droite-gauche
              startX = width + 100;
              endX = -100;
              startY = -100;
              endY = height + 100;
              break;
            case 9: // Spirale montante
              startX = width/2;
              endX = width/2;
              startY = height + 100;
              endY = -100;
              break;
            case 10: // Zigzag vertical
              startX = Math.random() * width;
              endX = startX + (Math.random() - 0.5) * 300;
              startY = height + 100;
              endY = -100;
              break;
            case 11: // Rebond horizontal
              startX = Math.random() > 0.5 ? -100 : width + 100;
              endX = startX === -100 ? width + 100 : -100;
              startY = Math.random() * height;
              endY = startY + (Math.random() - 0.5) * 400;
              break;
            case 12: // Trajectoire en coeur
              startX = width/2;
              endX = width/2;
              startY = height + 100;
              endY = -100;
              break;
            case 13: // Trajectoire en spirale complexe
              startX = width/2;
              endX = width/2 + 150 * Math.cos(index);
              startY = height + 100;
              endY = -100;
              break;
            case 14: // Vague sinusoidale
              startX = -100;
              endX = width + 100;
              startY = height/2;
              endY = height/2;
              break;
            case 15: // Explosion depuis le centre
              const angle = (index / 40) * Math.PI * 2;
              startX = width/2;
              endX = width/2 + Math.cos(angle) * 300;
              startY = height/2;
              endY = height/2 + Math.sin(angle) * 300;
              break;
          }
          
          const amplitude = 10 + (index % 3) * 8; // Amplitude réduite pour moins d'interférences
          const rotationSpeed = (index % 3 + 1) * 360; // Rotation plus modérée
          const scaleVariation = 0.8 + (index % 2) * 0.3; // Variation de taille plus subtile
          
          return (
            <Animated.View 
              key={index}
              style={[
                styles.floatingEmoji,
                {
                  transform: [
                    {
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [startY, endY],
                      }),
                    },
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [startX, endX],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: trajectoryType === 12 ?
                          // Animation en coeur simplifiée
                          [0, amplitude * 0.5, 0, -amplitude * 0.5, 0] :
                          trajectoryType === 13 ?
                          // Spirale simplifiée
                          [0, amplitude, -amplitude * 0.5, amplitude * 0.8, 0] :
                          trajectoryType === 14 ?
                          // Vague simplifiée
                          [0, amplitude * 0.8, 0, -amplitude * 0.8, 0] :
                          // Animation normale simplifiée
                          [0, amplitude * 0.6, -amplitude * 0.4, amplitude * 0.3, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      rotate: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${rotationSpeed}deg`],
                      }),
                    },
                    {
                      scale: animValue.interpolate({
                        inputRange: [0, 0.2, 0.5, 0.8, 1],
                        outputRange: [scaleVariation, 1.2, 1.5, 1.1, scaleVariation],
                      }),
                    },
                  ],
                  opacity: animValue.interpolate({
                    inputRange: [0, 0.15, 0.3, 0.7, 0.85, 1],
                    outputRange: [0, 0.8, 1, 1, 0.6, 0],
                  }),
                  shadowColor: '#000',
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                },
              ]}
            >
              <Text style={styles.emojiText}>{currentEmoji}</Text>
            </Animated.View>
          );
        })}

        {/* Logo et texte principal */}
        <View style={styles.logoContainer}>
          {/* Cercles d'animation en arrière-plan */}
          <Animated.View 
            style={[
              styles.backgroundCircle,
              styles.circle1,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: pulseValue },
                  { rotate: rotateInterpolation }
                ]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.backgroundCircle,
              styles.circle2,
              {
                opacity: logoOpacity,
                transform: [
                  { 
                    scale: pulseValue.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [1.2, 1.3],
                    })
                  },
                  { 
                    rotate: logoRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['360deg', '0deg'],
                    })
                  }
                ]
              }
            ]}
          />


          {/* Texte BriveFood avec animation */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }]
              }
            ]}
          >
            <Text style={styles.brandText}>BRIVEFOOD</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Cercles d'animation
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
  },
  circle1: {
    width: 200,
    height: 200,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    width: 300,
    height: 300,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  
  
  // Texte
  textContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: 56,
    fontFamily: 'gliker-regular',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  
  
  // Emojis flottants
  floatingEmoji: {
    position: 'absolute',
    zIndex: -1,
  },
  emojiText: {
    fontSize: 32,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default LoadingScreen;