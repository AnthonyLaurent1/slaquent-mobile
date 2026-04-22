import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listMessages } from '@/api/chat';
import { Avatar } from '@/components/chat/avatar';
import { MessageBubble } from '@/components/chat/message-bubble';
import { MessageComposer } from '@/components/chat/message-composer';
import { ThemedText } from '@/components/themed-text';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { NoticeBanner } from '@/components/ui/notice-banner';
import { useAuth } from '@/context/auth-context';
import { useSocket } from '@/context/socket-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { mergeMessageList } from '@/lib/chat';
import { AppError, getErrorMessageFromUnknown } from '@/lib/errors';
import { Message, MessageSentEvent } from '@/types/chat';

export default function ChatRoomScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { roomId, contactId, contactName } = useLocalSearchParams<{
    roomId: string;
    contactId?: string;
    contactName?: string;
  }>();
  const numericRoomId = Number(roomId);
  const numericContactId = Number(contactId);
  const resolvedContactName = typeof contactName === 'string' ? contactName : 'Conversation';
  const { isHydrated, user } = useAuth();
  const { connectionError, isConnected, sendMessage, socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const initialScrollDone = useRef(false);

  const loadHistory = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const history = await listMessages(numericRoomId, user.id);
      setMessages([...history].sort((first, second) => {
        return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
      }));
    } catch (historyError) {
      setLoadError(getErrorMessageFromUnknown(historyError, 'Impossible de charger les messages.'));
    } finally {
      setLoading(false);
    }
  }, [numericRoomId, user]);

  useEffect(() => {
    if (!user || !Number.isFinite(numericRoomId)) {
      return;
    }

    void loadHistory();
  }, [loadHistory, numericRoomId, user]);

  useEffect(() => {
    if (!socket || !Number.isFinite(numericRoomId)) {
      return;
    }

    const handleIncomingMessage = (message: Message) => {
      if (message.roomId !== numericRoomId) {
        return;
      }

      setMessages((currentMessages) => mergeMessageList(currentMessages, message));
    };

    const handleSentMessage = (payload: MessageSentEvent) => {
      if (payload.message.roomId !== numericRoomId) {
        return;
      }

      setMessages((currentMessages) => mergeMessageList(currentMessages, payload.message));
    };

    socket.on('message:received', handleIncomingMessage);
    socket.on('message:sent', handleSentMessage);

    return () => {
      socket.off('message:received', handleIncomingMessage);
      socket.off('message:sent', handleSentMessage);
    };
  }, [numericRoomId, socket]);

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: initialScrollDone.current });
      initialScrollDone.current = true;
    }, 40);

    return () => {
      clearTimeout(timeout);
    };
  }, [messages]);

  if (!isHydrated) {
    return <FullScreenLoader label="Chargement de la conversation..." />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!Number.isFinite(numericRoomId) || numericRoomId <= 0) {
    return <Redirect href="/conversations" />;
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/conversations');
  };

  const handleSend = async () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    if (!Number.isFinite(numericContactId) || numericContactId <= 0) {
      setSendError(new AppError('USER_NOT_FOUND').message);
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      await sendMessage(user.id, numericContactId, trimmedDraft);
      setDraft('');
    } catch (messageError) {
      setSendError(getErrorMessageFromUnknown(messageError, 'Envoi du message impossible.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}>
        <View style={styles.container}>
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.84 : 1,
                },
              ]}>
              <MaterialIcons name="arrow-back" size={20} color={colors.text} />
            </Pressable>

            <View style={styles.headerCenter}>
              <Avatar accent label={resolvedContactName} size={44} />
              <View style={styles.headerCopy}>
                <ThemedText type="subtitle" style={[styles.headerTitle, { color: colors.text }]}>
                  {resolvedContactName}
                </ThemedText>
                <ThemedText style={[styles.headerSubtitle, { color: colors.muted }]}>
                  {isConnected ? 'En ligne sur le socket' : 'Connexion temps réel instable'}
                </ThemedText>
              </View>
            </View>
          </View>

          {connectionError ? <NoticeBanner message={connectionError} tone="error" /> : null}
          {loadError ? <NoticeBanner message={loadError} tone="error" /> : null}
          {sendError ? <NoticeBanner message={sendError} tone="error" /> : null}

          {loading ? (
            <FullScreenLoader label="Chargement des messages..." />
          ) : (
            <FlatList
              ref={listRef}
              contentContainerStyle={[
                styles.messagesContent,
                messages.length === 0 && styles.emptyMessagesContent,
              ]}
              data={messages}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <MessageBubble isMine={item.senderId === user.id} message={item} />
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
                  <MaterialIcons name="sms" size={28} color={colors.accent} />
                  <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
                    Démarre la discussion
                  </ThemedText>
                  <ThemedText style={[styles.emptyCopy, { color: colors.muted }]}>
                    Ton premier message apparaîtra ici en temps réel.
                  </ThemedText>
                </View>
              }
            />
          )}

          <MessageComposer
            disabled={loading || sending}
            onChangeText={(value) => {
              setDraft(value);
              if (sendError) {
                setSendError(null);
              }
            }}
            onSend={() => {
              void handleSend();
            }}
            sending={sending}
            value={draft}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  messagesContent: {
    gap: 10,
    paddingBottom: 12,
  },
  emptyMessagesContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 22,
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
