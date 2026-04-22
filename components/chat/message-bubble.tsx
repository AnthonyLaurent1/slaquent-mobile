import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { formatMessageTime } from '@/lib/date';
import { Message } from '@/types/chat';

type MessageBubbleProps = {
  isMine: boolean;
  message: Message;
};

export function MessageBubble({ isMine, message }: MessageBubbleProps) {
  const colors = useAppColors();

  return (
    <View style={[styles.wrapper, isMine ? styles.mine : styles.theirs]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isMine ? colors.bubbleMine : colors.bubbleOther,
            borderColor: isMine ? colors.bubbleMine : colors.border,
          },
        ]}>
        <ThemedText style={[styles.content, { color: isMine ? '#ffffff' : colors.text }]}>
          {message.content}
        </ThemedText>
        <ThemedText
          style={[
            styles.time,
            { color: isMine ? 'rgba(255,255,255,0.78)' : colors.muted },
          ]}>
          {formatMessageTime(message.createdAt)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  mine: {
    justifyContent: 'flex-end',
  },
  theirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
  },
});
