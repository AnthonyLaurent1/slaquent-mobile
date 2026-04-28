import { Redirect } from 'expo-router';

import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { useAuth } from '@/context/auth-context';

export default function IndexScreen() {
  const { isHydrated, user } = useAuth();

  if (!isHydrated) {
    return <FullScreenLoader label="Ouverture de SLAquent..." />;
  }

  return <Redirect href={user ? '/feed' : '/login'} />;
}
