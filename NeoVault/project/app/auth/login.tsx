import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Banknote, Lock, Mail } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAuth } from '@/context/auth';
import Button from '@/components/Button';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      const code = error.code as string;
      const errorMap: Record<string, string> = {
        'auth/invalid-email':         'Please enter a valid email address.',
        'auth/user-disabled':         'This account has been disabled.',
        'auth/user-not-found':        'No account found with that email.',
        'auth/wrong-password':        'Incorrect password. Please try again.',
        'auth/network-request-failed':'Network error. Check your connection.',
      };
      setError(errorMap[code] || 'Invalid login credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Banknote size={48} color={Colors.primary[600]} />
          </View>
          <Text style={styles.logoText}>NeoVault</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to access your savings</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Mail size={20} color={Colors.neutral[500]} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color={Colors.neutral[500]} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Button
          title="Log In"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
        />

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    ...Typography.h2,
    color: Colors.primary[600],
  },
  title: {
    ...Typography.h3,
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.neutral[800],
  },
  subtitle: {
    ...Typography.body1,
    marginBottom: 32,
    textAlign: 'center',
    color: Colors.neutral[600],
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    ...Typography.body1,
    flex: 1,
    marginLeft: 12,
    color: Colors.neutral[800],
  },
  button: {
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    ...Typography.body2,
    color: Colors.neutral[600],
  },
  registerLink: {
    ...Typography.body2,
    color: Colors.primary[600],
    fontFamily: 'Poppins-Medium',
  },
});