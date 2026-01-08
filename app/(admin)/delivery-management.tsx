import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useDeliveryManagement } from '../../src/context/DeliveryManagementContext';
import { useOrders } from '../../src/context/OrdersContext';
import { OrderStatus, OrderMode } from '../../src/types';
import deliveryNotificationService from '../../src/services/deliveryNotificationService';

export default function DeliveryManagement() {
  const {
    deliveryUsers,
    createDeliveryUser,
    updateDeliveryUser,
    deleteDeliveryUser,
    toggleDeliveryUserStatus,
    resetDeliveryPassword,
    getDeliveryStats,
    refreshDeliveryUsers,
  } = useDeliveryManagement();

  const { orders, assignOrderToDelivery, getAvailableDeliveryOrders, getActiveDeliveryOrders, updateOrderStatus, refreshOrders } = useOrders();

  const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', 'users'
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'password'
  const [selectedUser, setSelectedUser] = useState(null);
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0);

  
  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const stats = getDeliveryStats();
  const availableOrders = getAvailableDeliveryOrders();
  const activeOrders = orders.filter(order =>
    order.mode === OrderMode.DELIVERY &&
    order.status === OrderStatus.IN_DELIVERY &&
    order.assignedDelivery
  );

  // Surveillance automatique des nouvelles commandes
  useEffect(() => {
    const currentOrdersCount = availableOrders.length;
    console.log('📋 Available orders updated:', currentOrdersCount);

    // Détecter si une nouvelle commande est arrivée
    if (previousOrdersCount > 0 && currentOrdersCount > previousOrdersCount) {
      console.log('🆕 Nouvelle commande détectée !');

      // Trouver la nouvelle commande (la plus récente)
      const newOrders = availableOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, currentOrdersCount - previousOrdersCount);

      // Envoyer notification pour chaque nouvelle commande
      newOrders.forEach(async (order) => {
        try {
          const result = await deliveryNotificationService.notifyNewDeliveryOrder(order);
          if (result.success) {
            console.log(`✅ Notification envoyée pour commande #${order.id} à ${result.sentCount} livreurs`);

            // Vibration pour indiquer qu'une notification a été envoyée
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            console.warn('⚠️ Échec envoi notification:', result.error);
          }
        } catch (error) {
          console.error('❌ Erreur envoi notification:', error);
        }
      });
    }

    // Mettre à jour le compteur
    setPreviousOrdersCount(currentOrdersCount);
  }, [availableOrders, previousOrdersCount]);

  // Initialisation du service de notifications
  useEffect(() => {
    const initNotificationService = async () => {
      try {
        // Nettoyer les anciens enregistrements au démarrage
        await deliveryNotificationService.clearOldRegistrations();

        // Demander les permissions de notification
        const hasPermission = await deliveryNotificationService.requestPermissions();
        if (hasPermission) {
          console.log('✅ Service de notifications initialisé');
        } else {
          console.warn('⚠️ Permissions de notification refusées');
        }
      } catch (error) {
        console.error('❌ Erreur initialisation notifications:', error);
      }
    };

    initNotificationService();
  }, []);

  // Fonction pour calculer la distance (simulation)
  const calculateDistance = (address) => {
    // Ici on pourrait utiliser une API de géolocalisation
    // Pour le moment, simulation basée sur la longueur de l'adresse
    const words = address.split(' ').length;
    return Math.round((words * 0.8 + Math.random() * 2) * 10) / 10;
  };

  // Fonction pour passer un appel téléphonique direct
  const handlePhoneCall = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\s/g, ''); // Enlever les espaces
    const phoneUrl = `tel:${cleanPhone}`;

    Linking.openURL(phoneUrl)
      .then(() => {
        console.log('📞 Appel initié vers:', phoneNumber);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'appel:', error);
        Alert.alert('Erreur', 'Impossible de passer l\'appel');
      });
  };

  // Fonction pour ouvrir la navigation
  const openNavigation = (address) => {
    if (!address || address.trim() === '') {
      Alert.alert('Erreur', 'Aucune adresse disponible pour la navigation');
      return;
    }

    const encodedAddress = encodeURIComponent(address);

    Alert.alert(
      '🗺️ Choisir l\'application de navigation',
      `Naviguer vers :\n${address}`,
      [
        {
          text: Platform.OS === 'ios' ? '📍 Plans (Apple)' : '📍 Maps',
          onPress: () => {
            const mapsUrl = Platform.OS === 'ios'
              ? `http://maps.apple.com/?daddr=${encodedAddress}`
              : `geo:0,0?q=${encodedAddress}`;

            Linking.openURL(mapsUrl)
              .then(() => {
                console.log('🗺️ Navigation ouverte dans Plans/Maps:', address);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              })
              .catch(() => {
                Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application Maps');
              });
          }
        },
        {
          text: '🌍 Google Maps',
          onPress: () => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

            Linking.openURL(googleMapsUrl)
              .then(() => {
                console.log('🗺️ Navigation ouverte dans Google Maps:', address);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              })
              .catch(() => {
                Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps');
              });
          }
        },
        {
          text: '🚗 Waze',
          onPress: () => {
            const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

            Linking.openURL(wazeUrl)
              .then(() => {
                console.log('🗺️ Navigation ouverte dans Waze:', address);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              })
              .catch(() => {
                // Si Waze n'est pas installé, essayer l'URL alternative
                const wazeWebUrl = `https://www.waze.com/ul?q=${encodedAddress}&navigate=yes`;
                Linking.openURL(wazeWebUrl)
                  .catch(() => {
                    Alert.alert('Erreur', 'Waze n\'est pas installé sur cet appareil');
                  });
              });
          }
        },
        {
          text: 'Annuler',
          style: 'cancel'
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
    });
  };

  const handleCreateUser = () => {
    setModalType('create');
    setSelectedUser(null);
    resetForm();
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditUser = (user) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone || '',
    });
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResetPassword = (user) => {
    setModalType('password');
    setSelectedUser(user);
    setFormData({ ...formData, password: '' });
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveUser = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      let result;

      if (modalType === 'create') {
        result = await createDeliveryUser(formData);
      } else if (modalType === 'edit') {
        result = await updateDeliveryUser(selectedUser.id, formData);
      } else if (modalType === 'password') {
        result = await resetDeliveryPassword(selectedUser.id, formData.password);
      }

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsModalVisible(false);
        resetForm();

        if (modalType === 'create') {
          Alert.alert(
            '✅ Livreur créé',
            `Le compte de ${formData.name} a été créé avec succès.\n\nLe livreur pourra se connecter avec ses identifiants lors de sa première utilisation.`
          );
        } else if (modalType === 'edit') {
          Alert.alert('✅ Livreur modifié', 'Les informations ont été mises à jour');
        } else {
          Alert.alert('✅ Mot de passe réinitialisé', 'Le nouveau mot de passe a été défini');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };


  const handleDeleteUser = async (user) => {
    Alert.alert(
      'Supprimer le livreur',
      `Êtes-vous sûr de vouloir supprimer définitivement ${user.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteDeliveryUser(user.id);
            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('✅ Supprimé', `${user.name} a été supprimé`);
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Rafraîchir les données selon l'onglet actif
      if (activeTab === 'available' || activeTab === 'active') {
        await refreshOrders();
        console.log('🔄 Orders refreshed');
      } else {
        await refreshDeliveryUsers();
        console.log('🔄 Delivery users refreshed');
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const renderActiveOrderCard = ({ item: order }) => {
    const distance = calculateDistance(order.address || 'Adresse non spécifiée');

    return (
      <View style={[styles.orderCard, styles.activeOrderCard]}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Commande #{order.id}</Text>
            <Text style={styles.orderTime}>{order.orderTime} • {order.orderDate}</Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalText}>{order.total.toFixed(2)}€</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          {order.phone && (
            <TouchableOpacity
              style={styles.phoneContainer}
              onPress={() => handlePhoneCall(order.phone)}
            >
              <Ionicons name="call" size={16} color="#4CAF50" />
              <Text style={styles.customerPhone}>{order.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Informations du livreur */}
        {order.assignedDelivery && (
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryHeader}>
              <Ionicons name="person" size={16} color="#FF9800" />
              <Text style={styles.deliveryLabel}>Livreur assigné</Text>
            </View>
            <Text style={styles.deliveryName}>{order.assignedDelivery.name}</Text>
            {order.assignedDelivery.phone && (
              <TouchableOpacity
                style={styles.phoneContainer}
                onPress={() => handlePhoneCall(order.assignedDelivery.phone)}
              >
                <Ionicons name="call" size={16} color="#4CAF50" />
                <Text style={styles.customerPhone}>{order.assignedDelivery.phone}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.assignedTime}>
              Assigné le {new Date(order.assignedDelivery.assignedAt?.toDate?.() || new Date()).toLocaleString('fr-FR')}
            </Text>
          </View>
        )}

        <View style={styles.addressSection}>
          <View style={styles.addressInfo}>
            <Ionicons name="location" size={16} color="#2196F3" />
            <Text style={styles.addressText}>{order.address || 'Adresse non spécifiée'}</Text>
          </View>
          <View style={styles.distanceInfo}>
            <Ionicons name="navigate" size={14} color="#666" />
            <Text style={styles.distanceText}>{distance} km</Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => openNavigation(order.address)}
          >
            <Ionicons name="navigate" size={16} color={colors.neutral.white} />
            <Text style={styles.navigationButtonText}>Navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeOrderButton}
            onPress={() => handleCompleteOrder(order)}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.neutral.white} />
            <Text style={styles.completeOrderButtonText}>Terminée</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleCompleteOrder = (order) => {
    Alert.alert(
      'Marquer comme livré',
      `Marquer la commande #${order.id} comme livrée ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Livré',
          onPress: async () => {
            try {
              const result = await updateOrderStatus(order.id, OrderStatus.DELIVERED);
              if (result.success) {
                console.log(`✅ Commande #${order.id} marquée comme livrée`);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('✅ Livraison terminée', `Commande #${order.id} marquée comme livrée`);
              } else {
                Alert.alert('❌ Erreur', result.error || 'Impossible de marquer la commande comme livrée');
              }
            } catch (error) {
              console.error('❌ Erreur changement statut:', error);
              Alert.alert('❌ Erreur', 'Une erreur est survenue');
            }
          }
        }
      ]
    );
  };

  const renderOrderCard = ({ item: order }) => {
    const distance = calculateDistance(order.address || 'Adresse non spécifiée');

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Commande #{order.id}</Text>
            <Text style={styles.orderTime}>{order.orderTime} • {order.orderDate}</Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalText}>{order.total.toFixed(2)}€</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          {order.phone && (
            <TouchableOpacity
              style={styles.phoneContainer}
              onPress={() => handlePhoneCall(order.phone)}
            >
              <Ionicons name="call" size={16} color="#4CAF50" />
              <Text style={styles.customerPhone}>{order.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressInfo}>
            <Ionicons name="location" size={16} color="#2196F3" />
            <Text style={styles.addressText}>{order.address || 'Adresse non spécifiée'}</Text>
          </View>
          <View style={styles.distanceInfo}>
            <Ionicons name="navigate" size={14} color="#666" />
            <Text style={styles.distanceText}>{distance} km</Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => openNavigation(order.address)}
          >
            <Ionicons name="navigate" size={16} color={colors.neutral.white} />
            <Text style={styles.navigationButtonText}>Navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.takeOrderButton}
            onPress={() => handleTakeOrder(order)}
          >
            <Ionicons name="bicycle" size={16} color={colors.neutral.white} />
            <Text style={styles.takeOrderButtonText}>Prendre</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleTakeOrder = (order) => {
    // Afficher la liste des livreurs actifs pour sélection
    const activeDeliveryUsers = deliveryUsers.filter(user => user.isActive);

    if (activeDeliveryUsers.length === 0) {
      Alert.alert(
        'Aucun livreur disponible',
        'Il n\'y a aucun livreur actif pour prendre cette commande. Veuillez d\'abord créer et activer un compte livreur.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Créer les options de livreurs
    const deliveryOptions = activeDeliveryUsers.map(user => ({
      text: `${user.name} (${user.email})`,
      onPress: () => assignOrderToDeliveryUser(order, user)
    }));

    Alert.alert(
      'Assigner la commande',
      `Choisir un livreur pour la commande #${order.id} :`,
      [
        ...deliveryOptions,
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const assignOrderToDeliveryUser = async (order, deliveryUser) => {
    try {
      console.log(`📦 Assignation commande #${order.id} à ${deliveryUser.name}`);

      const result = await assignOrderToDelivery(order.id, deliveryUser);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '✅ Commande assignée',
          `La commande #${order.id} a été assignée à ${deliveryUser.name} et est maintenant en cours de livraison.`,
          [{ text: 'OK' }]
        );

        console.log(`✅ Commande #${order.id} assignée à ${deliveryUser.name}`);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('❌ Erreur', result.error || 'Impossible d\'assigner la commande');
        console.error('❌ Erreur assignation:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur assignation commande:', error);
      Alert.alert('❌ Erreur', 'Une erreur est survenue lors de l\'assignation');
    }
  };

  const handleTestNotification = async () => {
    try {
      // Enregistrer un livreur de test pour les notifications
      const testUserId = 'test_delivery_user';
      const testUserInfo = {
        name: 'Livreur Test',
        email: 'test@delivery.com',
        phone: '06 12 34 56 78'
      };

      const result = await deliveryNotificationService.registerDeliveryUser(testUserId, testUserInfo);

      if (result.success) {
        Alert.alert(
          '🔔 Test de notification',
          'Un livreur de test a été enregistré. Les nouvelles commandes déclencheront des notifications.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('🧪 Livreur de test enregistré:', result.token);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          ]
        );
      } else {
        Alert.alert('❌ Erreur', `Impossible d'enregistrer le livreur de test: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
      Alert.alert('❌ Erreur', 'Une erreur est survenue lors du test de notification');
    }
  };

  const renderUserCard = ({ item: user }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: user.isActive ? '#4CAF50' : '#FF5722' }]}>
              <Text style={styles.statusText}>{user.isActive ? 'Actif' : 'Inactif'}</Text>
            </View>
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.phone && <Text style={styles.userPhone}>📞 {user.phone}</Text>}
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUser(user)}
        >
          <Ionicons name="pencil" size={16} color={colors.neutral.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.passwordButton]}
          onPress={() => handleResetPassword(user)}
        >
          <Ionicons name="key" size={16} color={colors.neutral.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(user)}
        >
          <Ionicons name="trash" size={16} color={colors.neutral.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => {
    let title = '';
    let submitText = '';

    switch (modalType) {
      case 'create':
        title = 'Créer un nouveau livreur';
        submitText = 'Créer';
        break;
      case 'edit':
        title = `Modifier ${selectedUser?.name}`;
        submitText = 'Modifier';
        break;
      case 'password':
        title = `Réinitialiser le mot de passe de ${selectedUser?.name}`;
        submitText = 'Réinitialiser';
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

            <ScrollView style={styles.modalContent}>
              {modalType !== 'password' && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nom complet *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      placeholder="Ex: Jean Dupont"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      placeholder="jean@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Téléphone</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      placeholder="06 12 34 56 78"
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {modalType === 'password' ? 'Nouveau mot de passe *' : 'Mot de passe *'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  placeholder="Mot de passe"
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveUser}
                >
                  <LinearGradient
                    colors={['#000000', '#000000', '#000000']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>{submitText}</Text>
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
          <Text style={styles.headerTitle}>Gestion Livraisons</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.addButton} onPress={handleCreateUser}>
              <Ionicons name="add" size={24} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <Ionicons
              name={activeTab === 'available' ? "bicycle" : "bicycle-outline"}
              size={18}
              color={activeTab === 'available' ? colors.neutral.white : colors.neutral.gray300}
            />
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              Disponibles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Ionicons
              name={activeTab === 'active' ? "timer" : "timer-outline"}
              size={18}
              color={activeTab === 'active' ? colors.neutral.white : colors.neutral.gray300}
            />
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              En cours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons
              name={activeTab === 'users' ? "people" : "people-outline"}
              size={18}
              color={activeTab === 'users' ? colors.neutral.white : colors.neutral.gray300}
            />
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
              Livreurs ({deliveryUsers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {activeTab === 'users' && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.active}</Text>
              <Text style={styles.statLabel}>Actifs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#FF5722' }]}>{stats.inactive}</Text>
              <Text style={styles.statLabel}>Inactifs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.recentLogins}</Text>
              <Text style={styles.statLabel}>Récents</Text>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.listContainer}>
          {activeTab === 'available' ? (
            // Liste des commandes disponibles
            <FlatList
              data={availableOrders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="bicycle-outline" size={64} color={colors.neutral.gray300} />
                  <Text style={styles.emptyStateTitle}>Aucune commande disponible</Text>
                  <Text style={styles.emptyStateMessage}>
                    Les commandes prêtes pour livraison apparaîtront ici
                  </Text>
                </View>
              )}
            />
          ) : activeTab === 'active' ? (
            // Liste des commandes en cours
            <FlatList
              data={activeOrders}
              renderItem={renderActiveOrderCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="timer-outline" size={64} color={colors.neutral.gray300} />
                  <Text style={styles.emptyStateTitle}>Aucune livraison en cours</Text>
                  <Text style={styles.emptyStateMessage}>
                    Les commandes assignées aux livreurs apparaîtront ici
                  </Text>
                </View>
              )}
            />
          ) : (
            // Liste des livreurs
            <FlatList
              data={deliveryUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={64} color={colors.neutral.gray300} />
                  <Text style={styles.emptyStateTitle}>Aucun livreur</Text>
                  <Text style={styles.emptyStateMessage}>
                    Créez le premier compte livreur pour commencer
                  </Text>
                </View>
              )}
            />
          )}
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
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray300,
  },
  activeTabText: {
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray600,
    marginTop: spacing.xs,
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateMessage: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  userCard: {
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
  userHeader: {
    marginBottom: spacing.md,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.white,
  },
  userEmail: {
    fontSize: typography.fontSizes.base,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  userLastLogin: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  passwordButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  // Order Card Styles
  orderCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  orderTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray600,
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  orderTotalText: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: '#2196F3',
  },
  customerInfo: {
    marginBottom: spacing.md,
  },
  customerName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerPhone: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#4CAF50',
  },
  addressSection: {
    marginBottom: spacing.md,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  addressText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray700,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distanceText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray600,
  },
  orderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navigationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#2196F3',
    gap: spacing.sm,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  navigationButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  takeOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#4CAF50',
    gap: spacing.sm,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  takeOrderButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  // Active Order Card Styles
  activeOrderCard: {
    borderLeftColor: '#FF9800',
  },
  deliveryInfo: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  deliveryLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: '#FF9800',
  },
  deliveryName: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  assignedTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray500,
    marginTop: spacing.xs,
  },
  completeOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#4CAF50',
    gap: spacing.sm,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  completeOrderButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
    letterSpacing: 0.5,
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
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray700,
    marginBottom: spacing.sm,
  },
  textInput: {
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