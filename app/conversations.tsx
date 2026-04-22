import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import { listUsers } from '@/api/auth';
import { createOrGetRoom, listRooms } from '@/api/chat';
import { Avatar } from '@/components/chat/avatar';
import { ConversationListItem } from '@/components/chat/conversation-list-item';
import { ThemedText } from '@/components/themed-text';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { NoticeBanner } from '@/components/ui/notice-banner';
import { useAuth } from '@/context/auth-context';
import { useSocket } from '@/context/socket-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { buildContactConversations } from '@/lib/chat';
import { getErrorMessageFromUnknown } from '@/lib/errors';
import { ContactConversation } from '@/types/chat';

export default function ConversationsScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { isHydrated, logout, user } = useAuth();
  const { connectionError, isConnected } = useSocket();
  const [conversations, setConversations] = useState<ContactConversation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [openingContactId, setOpeningContactId] = useState<number | null>(null);

  const loadConversations = useCallback(
    async (isRefreshing = false) => {
      if (!user) {
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const [users, rooms] = await Promise.all([listUsers(), listRooms(user.id)]);
        setConversations(buildContactConversations(users, rooms, user.id));
      } catch (loadError) {
        setError(getErrorMessageFromUnknown(loadError, 'Impossible de charger les conversations.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user || !isFocused) {
      return;
    }

    void loadConversations();
  }, [isFocused, loadConversations, user]);

  if (!isHydrated) {
    return <FullScreenLoader label="Chargement des conversations..." />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const filteredConversations = conversations.filter(({ contact }) =>
    contact.username.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await logout();
      router.replace('/login');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleOpenConversation = async (conversation: ContactConversation) => {
    if (!user) {
      return;
    }

    setOpeningContactId(conversation.contact.id);
    setError(null);

    try {
      const room = await createOrGetRoom(user.id, conversation.contact.id);
      router.push({
        pathname: '/chat/[roomId]',
        params: {
          contactId: String(conversation.contact.id),
          contactName: conversation.contact.username,
          roomId: String(room.id),
        },
      });
    } catch (openError) {
      setError(getErrorMessageFromUnknown(openError, 'Impossible d’ouvrir cette conversation.'));
    } finally {
      setOpeningContactId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar accent label={user.username} size={52} />
            <View style={styles.headerCopy}>
              <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
                Messages
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
                Connecté en tant que @{user.username}
              </ThemedText>
            </View>
          </View>

          <Pressable
            disabled={logoutLoading}
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed || logoutLoading ? 0.82 : 1,
              },
            ]}>
            {logoutLoading ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <MaterialIcons name="logout" size={20} color={colors.text} />
            )}
          </Pressable>
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
            },
          ]}>
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            onChangeText={setSearch}
            placeholder="Rechercher un contact"
            placeholderTextColor={colors.muted}
            selectionColor={colors.accent}
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
          />
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: isConnected ? colors.accentSoft : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? colors.success : colors.danger },
              ]}
            />
            <ThemedText style={[styles.statusLabel, { color: colors.text }]}>
              {isConnected ? 'Temps réel actif' : 'Temps réel déconnecté'}
            </ThemedText>
          </View>
        </View>

        {connectionError ? <NoticeBanner message={connectionError} tone="error" /> : null}
        {error ? <NoticeBanner message={error} tone="error" /> : null}

        {loading ? (
          <FullScreenLoader label="Chargement des contacts..." />
        ) : (
          <FlatList
            contentContainerStyle={[
              styles.listContent,
              filteredConversations.length === 0 && styles.emptyListContent,
            ]}
            data={filteredConversations}
            keyExtractor={(item) => String(item.contact.id)}
            refreshControl={
              <RefreshControl
                onRefresh={() => {
                  void loadConversations(true);
                }}
                refreshing={refreshing}
                tintColor={colors.accent}
              />
            }
            renderItem={({ item }) => (
              <ConversationListItem
                busy={openingContactId === item.contact.id}
                contact={item.contact}
                lastMessage={item.lastMessage}
                onPress={() => {
                  void handleOpenConversation(item);
                }}
                updatedAt={item.updatedAt}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <MaterialIcons name="forum" size={28} color={colors.accent} />
                <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucun contact trouvé
                </ThemedText>
                <ThemedText style={[styles.emptyCopy, { color: colors.muted }]}>
                  Essaie un autre nom ou ajoute un utilisateur côté backend.
                </ThemedText>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  logoutButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  statusChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  statusLabel: {
    fontSize: 13,
    lineHeight: 16,
  },
  listContent: {
    gap: 12,
    paddingBottom: 32,
    paddingTop: 18,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyCopy: {
    lineHeight: 22,
    textAlign: 'center',
  },
});
