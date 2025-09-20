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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { useDeliveryManagement } from '../../src/context/DeliveryManagementContext';

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

  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'password'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const stats = getDeliveryStats();

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
    await refreshDeliveryUsers();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          {user.lastLogin && (
            <Text style={styles.userLastLogin}>
              Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
            </Text>
          )}
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
          <Text style={styles.headerTitle}>Gestion Livreurs</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateUser}>
            <Ionicons name="add" size={24} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
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

        {/* Users List */}
        <View style={styles.listContainer}>
          {deliveryUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={64} color={colors.neutral.gray300} />
              <Text style={styles.emptyStateTitle}>Aucun livreur</Text>
              <Text style={styles.emptyStateMessage}>
                Créez le premier compte livreur pour commencer
              </Text>
            </View>
          ) : (
            <FlatList
              data={deliveryUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContent}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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