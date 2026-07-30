import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import {
  DEFAULT_DELIVERY_SETTINGS,
  DEFAULT_RESTAURANT_COORDS,
  loadDeliverySettings,
  subscribeToDeliverySettings,
  geocodeAddress,
  getDeliveryFee,
} from '../../utils/deliveryPricing';

export default function AddressInput({ onAddressSelect, onDeliveryFeeCalculated }) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingFees, setIsCalculatingFees] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [distance, setDistance] = useState(null);
  // Tarifs configurés par l'admin (paliers d'1 km)
  const [deliverySettings, setDeliverySettings] = useState(DEFAULT_DELIVERY_SETTINGS);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      const settings = await loadDeliverySettings();
      if (!cancelled) setDeliverySettings(settings);
    };
    loadSettings();

    // L'admin ajuste un palier : les paniers déjà ouverts en tiennent compte
    const unsubscribe = subscribeToDeliverySettings(settings => {
      if (!cancelled) setDeliverySettings(settings);
    });

    return () => {
      cancelled = true;
      unsubscribe && unsubscribe();
    };
  }, []);

  // Position du restaurant : issue des réglages, et non plus figée dans le code.
  // Filet de sécurité si l'adresse a été changée sans que les coordonnées
  // suivent — sans quoi toutes les distances resteraient calculées depuis
  // l'ancien point.
  const [restaurantCoords, setRestaurantCoords] = useState(DEFAULT_RESTAURANT_COORDS);

  useEffect(() => {
    let cancelled = false;

    const resolveCoords = async () => {
      if (deliverySettings.restaurantCoords) {
        setRestaurantCoords(deliverySettings.restaurantCoords);
        return;
      }

      const geocoded = await geocodeAddress(deliverySettings.restaurantAddress);
      if (!cancelled && geocoded) setRestaurantCoords(geocoded);
    };

    resolveCoords();
    return () => { cancelled = true; };
  }, [deliverySettings.restaurantCoords, deliverySettings.restaurantAddress]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const searchTimeout = useRef(null);

  // Animation de pulsation pour le chargement
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // Recherche d'adresses via l'API gouvernementale
  const searchAddresses = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=8`
      );
      const data = await response.json();
      
      const formattedSuggestions = data.features.map((feature) => ({
        id: feature.properties.id,
        label: feature.properties.label,
        address: feature.properties.name,
        city: feature.properties.city,
        postcode: feature.properties.postcode,
        coordinates: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        }
      }));
      
      setSuggestions(formattedSuggestions);
      
      // Animation fade in des suggestions
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Erreur recherche adresse:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul de la distance entre deux coordonnées (formule de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Frais de livraison selon la grille configurée dans l'admin
  const calculateDeliveryFee = (distanceKm) => {
    return getDeliveryFee(distanceKm, deliverySettings);
  };

  // Sélection d'une adresse
  const selectAddress = async (address) => {
    setSelectedAddress(address);
    setSearchText(address.label);
    setSuggestions([]);
    setIsCalculatingFees(true);
    startPulseAnimation();
    
    // Animation fade out des suggestions
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Simulation d'un délai de calcul pour l'animation
    setTimeout(() => {
      const calculatedDistance = calculateDistance(
        restaurantCoords.lat,
        restaurantCoords.lng,
        address.coordinates.lat,
        address.coordinates.lng
      );
      
      const fee = calculateDeliveryFee(calculatedDistance);
      
      setDistance(calculatedDistance);
      setDeliveryFee(fee);
      setIsCalculatingFees(false);
      stopPulseAnimation();
      
      // Callback vers le composant parent
      onAddressSelect?.(address);
      onDeliveryFeeCalculated?.(fee, calculatedDistance);
    }, 1500); // Délai pour montrer l'animation
  };

  // Debounce pour la recherche
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      searchAddresses(searchText);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchText]);

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => selectAddress(item)}
    >
      <Ionicons name="location-outline" size={16} color={colors.neutral.gray500} />
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionAddress}>{item.address}</Text>
        <Text style={styles.suggestionCity}>{item.postcode} {item.city}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Adresse de livraison</Text>
        
        <View style={styles.inputContainer}>
        <Ionicons name="location" size={20} color={colors.neutral.gray500} />
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tapez votre adresse..."
          placeholderTextColor={colors.neutral.gray400}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {isLoading && <ActivityIndicator size="small" color="#000000" />}
      </View>

      {/* Suggestions d'adresses */}
      {suggestions.length > 0 && (
        <Animated.View style={[styles.suggestionsContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </Animated.View>
      )}

        {/* Informations de livraison */}
        {selectedAddress && (
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <Ionicons name="navigate" size={16} color="#000000" />
              <Text style={styles.deliveryText}>
                Distance: {distance ? `${distance.toFixed(1)} km` : 'Calcul...'}
              </Text>
            </View>
            
            <View style={styles.deliveryRow}>
              <Animated.View style={{ transform: [{ scale: isCalculatingFees ? pulseAnim : 1 }] }}>
                <Ionicons name="card" size={16} color="#000000" />
              </Animated.View>
              <Text style={styles.deliveryText}>
                Frais de livraison: {
                  isCalculatingFees ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : deliveryFee !== null ? (
                    `${deliveryFee.toFixed(2)} €`
                  ) : (
                    `Livraison non disponible (> ${deliverySettings.maxDistance}km)`
                  )
                }
              </Text>
            </View>

            {deliveryFee === null && distance > deliverySettings.maxDistance && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color={colors.accent.main} />
                <Text style={styles.warningText}>
                  Désolé, nous ne livrons pas au-delà de {deliverySettings.maxDistance}km du restaurant.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.sm,
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray800,
    padding: 0,
  },
  suggestionsContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    elevation: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
    gap: spacing.sm,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionAddress: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray800,
    marginBottom: 2,
  },
  suggestionCity: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  deliveryInfo: {
    backgroundColor: 'rgba(216, 68, 128, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deliveryText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.accent.main,
    fontFamily: typography.fontFamily.medium,
  },
});