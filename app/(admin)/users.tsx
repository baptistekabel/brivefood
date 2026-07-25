import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

// Comptes qui ne doivent jamais pouvoir être bloqués depuis l'application
const PROTECTED_EMAILS = [
  'admin@brivefood.com',
  'kabelbaptiste971@gmail.com',
  'brivefood@gmail.com',
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingUid, setUpdatingUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const loaded = snapshot.docs.map(document => ({
          docId: document.id,
          ...document.data(),
        }));
        setUsers(loaded);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        setLoading(false);
        Alert.alert('Erreur', 'Impossible de charger la liste des utilisateurs.');
      }
    );

    return unsubscribe;
  }, []);

  const isProtected = (user) =>
    user.role === 'admin' || PROTECTED_EMAILS.includes((user.email || '').toLowerCase());

  const getDisplayName = (user) => {
    const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Utilisateur sans nom';
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'delivery':
        return 'Livreur';
      case 'customer':
        return 'Client';
      default:
        return role || 'Inconnu';
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    const matches = users.filter(user => {
      if (!term) return true;
      return [user.email, user.name, user.firstName, user.lastName, user.phone]
        .filter(Boolean)
        .some(field => String(field).toLowerCase().includes(term));
    });

    // Comptes bloqués en tête, puis ordre alphabétique
    return matches.sort((a, b) => {
      if (!!a.blocked !== !!b.blocked) return a.blocked ? -1 : 1;
      return getDisplayName(a).localeCompare(getDisplayName(b));
    });
  }, [users, search]);

  const blockedCount = useMemo(
    () => users.filter(user => user.blocked).length,
    [users]
  );

  const applyBlockedState = async (user, blocked) => {
    setUpdatingUid(user.docId);
    try {
      await updateDoc(doc(db, 'users', user.docId), {
        blocked,
        blockedAt: blocked ? serverTimestamp() : null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erreur mise à jour du blocage:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Erreur',
        `Impossible de ${blocked ? 'bloquer' : 'débloquer'} ce compte. Vérifiez votre connexion.`
      );
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleToggleBlock = (user) => {
    if (isProtected(user)) {
      Alert.alert(
        'Action impossible',
        'Un compte administrateur ne peut pas être bloqué depuis l\'application.'
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (user.blocked) {
      Alert.alert(
        'Débloquer le compte',
        `${getDisplayName(user)} pourra de nouveau se connecter et commander.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Débloquer', onPress: () => applyBlockedState(user, false) },
        ]
      );
      return;
    }

    Alert.alert(
      'Bloquer le compte',
      `${getDisplayName(user)} sera déconnecté immédiatement et ne pourra plus se connecter.\n\n`
        + `Ses commandes et ses points de fidélité sont conservés : le déblocage rétablit tout.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          style: 'destructive',
          onPress: () => applyBlockedState(user, true),
        },
      ]
    );
  };

  const renderUser = ({ item: user }) => {
    const blocked = !!user.blocked;
    const protectedAccount = isProtected(user);
    const isUpdating = updatingUid === user.docId;

    return (
      <View style={[styles.userCard, blocked && styles.userCardBlocked]}>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName} numberOfLines={1}>{getDisplayName(user)}</Text>
            <View style={[styles.roleBadge, blocked && styles.roleBadgeBlocked]}>
              <Text style={[styles.roleBadgeText, blocked && styles.roleBadgeTextBlocked]}>
                {blocked ? 'Bloqué' : getRoleLabel(user.role)}
              </Text>
            </View>
          </View>

          {!!user.email && (
            <View style={styles.userMetaRow}>
              <Ionicons name="mail-outline" size={15} color={colors.neutral.gray500} />
              <Text style={styles.userMeta} numberOfLines={1}>{user.email}</Text>
            </View>
          )}

          {!!user.phone && (
            <View style={styles.userMetaRow}>
              <Ionicons name="call-outline" size={15} color={colors.neutral.gray500} />
              <Text style={styles.userMeta}>{user.phone}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            blocked ? styles.actionButtonUnblock : styles.actionButtonBlock,
            protectedAccount && styles.actionButtonDisabled,
          ]}
          onPress={() => handleToggleBlock(user)}
          disabled={protectedAccount || isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={blocked ? '#16A34A' : '#DC2626'} />
          ) : (
            <Ionicons
              name={protectedAccount ? 'shield-checkmark' : blocked ? 'lock-open-outline' : 'ban-outline'}
              size={20}
              color={protectedAccount ? colors.neutral.gray400 : blocked ? '#16A34A' : '#DC2626'}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.neutral.gray400} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={colors.neutral.gray300} />
        <Text style={styles.emptyTitle}>
          {search ? 'Aucun résultat' : 'Aucun utilisateur'}
        </Text>
        <Text style={styles.emptyMessage}>
          {search
            ? 'Essayez avec un autre nom, email ou téléphone.'
            : 'Les comptes créés depuis l\'application apparaîtront ici.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // (admin) est un navigateur a onglets : router.back() retombe sur
              // le tableau de bord. On revient explicitement aux parametres,
              // l'ecran depuis lequel on arrive.
              router.replace('/(admin)/settings');
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Utilisateurs</Text>

          {/* Espace symétrique pour garder le titre centré */}
          <View style={styles.headerButtonPlaceholder} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Compte{users.length > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, blockedCount > 0 && styles.statValueDanger]}>
              {blockedCount}
            </Text>
            <Text style={styles.statLabel}>Bloqué{blockedCount > 1 ? 's' : ''}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.neutral.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un nom, email, téléphone"
            placeholderTextColor={colors.neutral.gray500}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.neutral.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(user) => user.docId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={10}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.title,
    color: colors.neutral.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSizes['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.white,
  },
  statValueDanger: {
    color: '#EF4444',
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral.gray400,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    padding: 0,
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  listContent: {
    padding: spacing.lg,
    // La tab bar admin est en position absolue (85px)
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  userCardBlocked: {
    backgroundColor: '#FEF2F2',
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    flexShrink: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.black,
  },
  roleBadge: {
    backgroundColor: colors.neutral.gray200,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  roleBadgeBlocked: {
    backgroundColor: '#FEE2E2',
  },
  roleBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.neutral.gray600,
  },
  roleBadgeTextBlocked: {
    color: '#DC2626',
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userMeta: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray600,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonBlock: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  actionButtonUnblock: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  actionButtonDisabled: {
    backgroundColor: colors.neutral.gray100,
    borderColor: colors.neutral.gray200,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral.gray600,
    marginTop: spacing.md,
  },
  emptyMessage: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
});
