import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/chat/avatar';
import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { formatConversationTimestamp } from '@/lib/date';
import { Message, User } from '@/types/chat';

type ConversationListItemProps = {
  busy?: boolean;
  contact: User;
  lastMessage: Message | null;
  onPress: () => void;
  updatedAt: string | null;
};

export function ConversationListItem({
  busy = false,
  contact,
  lastMessage,
  onPress,
  updatedAt,
}: ConversationListItemProps) {
  const colors = useAppColors();
  const preview = lastMessage?.content ?? 'Touchez pour commencer une conversation.';

  return (
    <Pressable
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed || busy ? 0.88 : 1,
        },
      ]}>
      <Avatar label={contact.username} size={50} />

      <View style={styles.content}>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold" style={[styles.name, { color: colors.text }]}>
            {contact.username}
          </ThemedText>
          {updatedAt ? (
            <ThemedText style={[styles.timestamp, { color: colors.muted }]}>
              {formatConversationTimestamp(updatedAt)}
            </ThemedText>
          ) : null}
        </View>

        <ThemedText numberOfLines={2} style={[styles.preview, { color: colors.muted }]}>
          {preview}
        </ThemedText>
      </View>

      {busy ? (
        <ActivityIndicator color={colors.accent} size="small" />
      ) : (
        <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    lineHeight: 16,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
});
