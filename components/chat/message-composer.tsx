import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useAppColors } from '@/hooks/use-app-colors';

type MessageComposerProps = {
  disabled?: boolean;
  onChangeText: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  value: string;
};

export function MessageComposer({
  disabled = false,
  onChangeText,
  onSend,
  sending = false,
  value,
}: MessageComposerProps) {
  const colors = useAppColors();
  const canSend = Boolean(value.trim()) && !disabled && !sending;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}>
      <TextInput
        editable={!disabled}
        multiline
        onChangeText={onChangeText}
        placeholder="Écrire un message..."
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.input, { color: colors.text }]}
        value={value}
      />

      <Pressable
        disabled={!canSend}
        onPress={onSend}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: canSend ? colors.accent : colors.surface,
            opacity: pressed ? 0.84 : 1,
          },
        ]}>
        {sending ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <MaterialIcons
            color={canSend ? '#ffffff' : colors.muted}
            name="send"
            size={20}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    minHeight: 22,
    paddingVertical: 4,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
