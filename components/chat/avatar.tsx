import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';

type AvatarProps = {
  accent?: boolean;
  label: string;
  size?: number;
};

export function Avatar({ accent = false, label, size = 44 }: AvatarProps) {
  const colors = useAppColors();
  const initial = label.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: accent ? colors.accent : colors.surface,
          borderColor: colors.border,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}>
      <ThemedText
        style={[
          styles.label,
          {
            color: accent ? '#ffffff' : colors.text,
            fontSize: Math.max(16, size * 0.35),
          },
        ]}>
        {initial}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    lineHeight: 20,
  },
});
