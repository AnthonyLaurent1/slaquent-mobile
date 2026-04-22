import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';

type NoticeBannerProps = {
  message: string;
  tone?: 'error' | 'info' | 'success';
};

export function NoticeBanner({ message, tone = 'info' }: NoticeBannerProps) {
  const colors = useAppColors();

  const toneStyles = {
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.24)',
      color: colors.text,
    },
    info: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.border,
      color: colors.text,
    },
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.22)',
      color: colors.text,
    },
  }[tone];

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: toneStyles.backgroundColor,
          borderColor: toneStyles.borderColor,
        },
      ]}>
      <ThemedText style={[styles.message, { color: toneStyles.color }]}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
