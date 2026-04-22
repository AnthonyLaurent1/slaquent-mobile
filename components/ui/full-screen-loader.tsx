import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';

type FullScreenLoaderProps = {
  label?: string;
};

export function FullScreenLoader({ label = 'Chargement...' }: FullScreenLoaderProps) {
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.accent} size="large" />
      <ThemedText style={[styles.label, { color: colors.muted }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
