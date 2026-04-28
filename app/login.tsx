import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { registerUser } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { NoticeBanner } from '@/components/ui/notice-banner';
import { useAuth } from '@/context/auth-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { SERVER_CONFIG_ERROR } from '@/lib/env';
import { AppError, getErrorMessageFromUnknown } from '@/lib/errors';

export default function LoginScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { isHydrated, login, user } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(SERVER_CONFIG_ERROR);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/feed');
    }
  }, [router, user]);

  if (!isHydrated) {
    return <FullScreenLoader label="Préparation de l'application..." />;
  }

  if (user) {
    return <FullScreenLoader label="Connexion en cours..." />;
  }

  const handleSubmit = async () => {
    const nextUsername = username.trim();

    if (!nextUsername) {
      setError(new AppError('USERNAME_REQUIRED').message);
      return;
    }

    if (SERVER_CONFIG_ERROR) {
      setError(SERVER_CONFIG_ERROR);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const registeredUser = await registerUser(nextUsername);
      await login(registeredUser);
      router.replace('/feed');
    } catch (submitError) {
      setError(getErrorMessageFromUnknown(submitError, 'Connexion impossible.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.background} pointerEvents="none">
        <View style={[styles.orb, styles.orbPrimary, { backgroundColor: colors.accentStrong }]} />
        <View style={[styles.orb, styles.orbSecondary, { backgroundColor: colors.accent }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}>
        <View style={styles.content}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.background,
              },
            ]}>
            <View
              style={[
                styles.logo,
                {
                  backgroundColor: colors.accentSoft,
                  borderColor: colors.border,
                },
              ]}>
              <MaterialIcons name="forum" size={32} color={colors.accentStrong} />
            </View>

            <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
              SLAquent
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
              La messagerie directe, en version mobile.
            </ThemedText>

            {error ? <NoticeBanner message={error} tone="error" /> : null}

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: colors.muted }]}>
                Nom d&apos;utilisateur
              </ThemedText>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting && !SERVER_CONFIG_ERROR}
                onChangeText={(value) => {
                  setUsername(value);
                  if (error && error !== SERVER_CONFIG_ERROR) {
                    setError(SERVER_CONFIG_ERROR);
                  }
                }}
                onSubmitEditing={handleSubmit}
                placeholder="Exemple: anthony"
                placeholderTextColor={colors.muted}
                returnKeyType="go"
                selectionColor={colors.accent}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={username}
              />
            </View>

            <Pressable
              disabled={submitting || Boolean(SERVER_CONFIG_ERROR)}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed || submitting || SERVER_CONFIG_ERROR ? 0.88 : 1,
                },
              ]}>
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="lock-open" size={18} color="#ffffff" />
                  <ThemedText style={styles.buttonLabel}>Entrer dans SLAquent</ThemedText>
                </>
              )}
            </Pressable>

            <ThemedText style={[styles.footnote, { color: colors.muted }]}>
              Le compte est créé côté backend si le nom n&apos;existe pas encore.
            </ThemedText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    borderRadius: 999,
    opacity: 0.18,
    position: 'absolute',
  },
  orbPrimary: {
    height: 320,
    right: -80,
    top: -40,
    width: 320,
  },
  orbSecondary: {
    bottom: 40,
    height: 240,
    left: -60,
    width: 240,
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowOffset: {
      height: 18,
      width: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 32,
  },
  logo: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    marginBottom: 24,
    width: 64,
  },
  title: {
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  fieldGroup: {
    gap: 10,
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  button: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 56,
    paddingHorizontal: 20,
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
  },
});
