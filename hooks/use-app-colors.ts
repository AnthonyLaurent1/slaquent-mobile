import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppColors() {
  const colorScheme = useColorScheme() ?? 'dark';

  return Colors[colorScheme];
}
