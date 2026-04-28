import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import { listFeed } from '@/api/feed';
import { Avatar } from '@/components/chat/avatar';
import { ThemedText } from '@/components/themed-text';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { NoticeBanner } from '@/components/ui/notice-banner';
import { useAuth } from '@/context/auth-context';
import { useSocket } from '@/context/socket-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { formatFeedTimestamp } from '@/lib/date';
import { getErrorMessageFromUnknown } from '@/lib/errors';
import { Message } from '@/types/chat';

export default function FeedScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { isHydrated, logout, user } = useAuth();
  const { connectionError, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const loadFeed = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const feedMessages = await listFeed();
      setMessages(feedMessages ?? []);
    } catch (loadError) {
      setError(getErrorMessageFromUnknown(loadError, 'Impossible de charger le feed.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !isFocused) {
      return;
    }

    void loadFeed();
  }, [isFocused, loadFeed, user]);

  if (!isHydrated) {
    return <FullScreenLoader label="Chargement du feed..." />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await logout();
      router.replace('/login');
    } finally {
      setLogoutLoading(false);
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
                Feed
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

        <View style={[styles.switcher, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [
              styles.switchButton,
              styles.switchButtonActive,
              { backgroundColor: colors.accent, opacity: pressed ? 0.88 : 1 },
            ]}>
            <MaterialIcons name="article" size={17} color="#ffffff" />
            <ThemedText style={styles.switchButtonActiveLabel}>Feed</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              router.replace('/conversations');
            }}
            style={({ pressed }) => [
              styles.switchButton,
              { backgroundColor: pressed ? colors.accentSoft : 'transparent' },
            ]}>
            <MaterialIcons name="forum" size={17} color={colors.muted} />
            <ThemedText style={[styles.switchButtonLabel, { color: colors.muted }]}>
              Messages
            </ThemedText>
          </Pressable>
        </View>

        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.heroCopy}>
            <ThemedText style={[styles.eyebrow, { color: colors.accentStrong }]}>
              Vue publique
            </ThemedText>
            <ThemedText type="subtitle" style={[styles.heroTitle, { color: colors.text }]}>
              Feed communautaire
            </ThemedText>
            <ThemedText style={[styles.heroSubtitle, { color: colors.muted }]}>
              Retrouve les messages récents sans quitter l’espace de discussion.
            </ThemedText>
          </View>

          <View style={[styles.countCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText style={[styles.countValue, { color: colors.text }]}>{messages.length}</ThemedText>
            <ThemedText style={[styles.countLabel, { color: colors.muted }]}>messages</ThemedText>
          </View>
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
          <FullScreenLoader label="Chargement des messages publics..." />
        ) : (
          <FlatList
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.emptyListContent,
            ]}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                onRefresh={() => {
                  void loadFeed(true);
                }}
                refreshing={refreshing}
                tintColor={colors.accent}
              />
            }
            renderItem={({ item }) => {
              const isMine = item.senderId === user.id;
              const username = isMine ? 'Vous' : item.sender?.username || 'Anonyme';

              return (
                <View
                  style={[
                    styles.feedCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={styles.feedCardHeader}>
                    <View style={styles.author}>
                      <Avatar accent={isMine} label={username} size={48} />
                      <View style={styles.authorCopy}>
                        <ThemedText style={[styles.authorName, { color: colors.text }]}>
                          {username}
                        </ThemedText>
                        <ThemedText style={[styles.authorMeta, { color: colors.muted }]}>
                          {isMine ? 'Votre publication' : 'Membre de la communauté'}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[styles.timestamp, { color: colors.muted }]}>
                      {formatFeedTimestamp(item.createdAt)}
                    </ThemedText>
                  </View>

                  <ThemedText style={[styles.feedContent, { color: colors.text }]}>
                    {item.content}
                  </ThemedText>
                </View>
              );
            }}
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
                <MaterialIcons name="article" size={28} color={colors.accent} />
                <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucun message public
                </ThemedText>
                <ThemedText style={[styles.emptyCopy, { color: colors.muted }]}>
                  Le feed apparaîtra ici dès qu’un utilisateur publiera un message.
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
  switcher: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    padding: 6,
  },
  switchButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 42,
  },
  switchButtonActive: {
    shadowColor: '#2563EB',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  switchButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  switchButtonActiveLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 20,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  countCard: {
    alignItems: 'flex-end',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'space-between',
    minWidth: 92,
    padding: 14,
  },
  countValue: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 36,
  },
  countLabel: {
    fontSize: 13,
    lineHeight: 16,
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
    gap: 14,
    paddingBottom: 32,
    paddingTop: 18,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  feedCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  feedCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  author: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  authorCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  authorMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 12,
    lineHeight: 18,
  },
  feedContent: {
    fontSize: 16,
    lineHeight: 25,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 22,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 10,
    marginHorizontal: 6,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyCopy: {
    lineHeight: 22,
    textAlign: 'center',
  },
});
