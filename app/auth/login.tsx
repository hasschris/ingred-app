import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

/**
 * Login Screen with Enhanced User Experience
 * 
 * Features beautiful, user-friendly login with:
 * - Clean, professional design matching HelloFresh quality
 * - Helpful error messages and user guidance
 * - Password reset functionality
 * - Legal compliance awareness
 * - Accessibility features throughout
 * - Loading states and feedback
 */

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, resetPassword } = useAuth();

  // Form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);

  // Form validation
  const validateForm = (): { valid: boolean; message?: string } => {
    if (!email.trim()) {
      return { valid: false, message: 'Please enter your email address' };
    }

    if (!email.includes('@') || !email.includes('.')) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    if (!password) {
      return { valid: false, message: 'Please enter your password' };
    }

    return { valid: true };
  };

  // Handle login
const handleLogin = async () => {
  const validation = validateForm();
  if (!validation.valid) {
    Alert.alert('Login Error', validation.message);
    return;
  }

  setLoading(true);

  try {
    console.log('🔐 Attempting login...');
    
    const result = await signIn(email.trim().toLowerCase(), password);

    if (result.success) {
      console.log('✅ Login successful!');
      // DO NOT NAVIGATE HERE - let AuthProvider/index.tsx handle routing
      // The auth state change will automatically trigger navigation
    } else {
      Alert.alert(
        'Login Failed',
        result.message || 'Please check your email and password and try again.'
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert(
      'Login Failed', 
      'An unexpected error occurred. Please try again.'
    );
  } finally {
    setLoading(false); // This will now always be called
  }
};

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Email Required',
        'Please enter your email address first, then tap "Forgot Password" again.'
      );
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address for password reset.'
      );
      return;
    }

    setResetLoading(true);

    try {
      console.log('🔄 Sending password reset email...');
      
      const result = await resetPassword(email.trim().toLowerCase());

      if (result.success) {
        Alert.alert(
          'Password Reset Sent! 📧',
          'Check your email for password reset instructions. If you don\'t see it, check your spam folder.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Password Reset Failed',
          result.message || 'Please check your email address and try again.'
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        'Password Reset Failed',
        'An unexpected error occurred. Please try again or contact support.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back to welcome screen"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue planning delicious meals for your family
        </Text>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessible={true}
            accessibilityLabel="Email address input"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            accessible={true}
            accessibilityLabel="Password input"
          />
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={handlePasswordReset}
          disabled={resetLoading}
          accessible={true}
          accessibilityLabel="Reset password"
        >
          <Text style={styles.forgotPasswordText}>
            {resetLoading ? 'Sending reset email...' : 'Forgot Password?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.signInButton, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
        accessible={true}
        accessibilityLabel="Sign in to account"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* AI Content Notice */}
      <View style={styles.aiNotice}>
        <Text style={styles.aiNoticeTitle}>🧠 AI-Powered Meal Planning</Text>
        <Text style={styles.aiNoticeText}>
          Ingred uses artificial intelligence to create personalised weekly meal plans. 
          All AI-generated recipes include safety disclaimers and allergen warnings for your family's protection.
        </Text>
      </View>

      {/* Create Account Link */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('/auth/register')}
        accessible={true}
        accessibilityLabel="Create new account"
      >
        <Text style={styles.linkButtonText}>
          Don't have an account? <Text style={styles.linkTextBold}>Create Account</Text>
        </Text>
      </TouchableOpacity>

      {/* Legal Notice */}
      <View style={styles.legalNotice}>
        <Text style={styles.legalNoticeText}>
          By signing in, you agree to Ingred's Terms of Service and Privacy Policy. 
          Your family's meal planning data is protected with enterprise-grade security and GDPR compliance.
        </Text>
      </View>

      {/* Bottom spacing for scroll */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header Section
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },

  // Form Section
  form: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },

  // Action Buttons
  signInButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  // AI Notice Section
  aiNotice: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    marginBottom: 30,
  },
  aiNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  aiNoticeText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Links and Legal
  linkButton: {
    marginHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  linkButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  linkTextBold: {
    color: '#8B5CF6',
    fontWeight: '600',
  },

  legalNotice: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 20,
  },
  legalNoticeText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
  },

  // Bottom spacing
  bottomSpacing: {
    height: 40,
  },
});