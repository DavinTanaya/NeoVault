import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Banknote, Lock, Mail, ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useAuth } from "@/context/auth";
import Button from "@/components/Button";
import { registerUser } from "@/services/firebase";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const displayName = email.split("@")[0];
      await registerUser(email, password, displayName);
      router.replace("/(tabs)");
    } catch (error: any) {
      const code = error.code as string;
      const errorMap: Record<string, string> = {
        "auth/email-already-in-use": "That email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Your password is too weak (min 6 characters).",
        "auth/network-request-failed": "Network error. Check your connection.",
      };

      setError(errorMap[code] || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.neutral[700]} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Banknote size={48} color={Colors.primary[600]} />
          </View>
          <Text style={styles.logoText}>NeoVault</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start saving with NeoVault today</Text>

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

        <View style={styles.inputContainer}>
          <Lock size={20} color={Colors.neutral[500]} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Button
          title="Sign Up"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.button}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Log in</Text>
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
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    ...Typography.h2,
    color: Colors.primary[600],
  },
  title: {
    ...Typography.h3,
    marginBottom: 8,
    textAlign: "center",
    color: Colors.neutral[800],
  },
  subtitle: {
    ...Typography.body1,
    marginBottom: 32,
    textAlign: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    ...Typography.body2,
    color: Colors.neutral[600],
  },
  loginLink: {
    ...Typography.body2,
    color: Colors.primary[600],
    fontFamily: "Poppins-Medium",
  },
});
