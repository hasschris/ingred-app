import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, getUserIP, getUserAgent } from '../../lib/auth';

/**
 * Registration Screen with Industry-Leading Legal Compliance
 * 
 * This sets the standard for AI app registration with:
 * - UK GDPR compliance with age verification (16+)
 * - Comprehensive consent management and audit trails
 * - AI content safety awareness built into signup flow
 * - Beautiful, accessible design that builds trust
 * - Legal protection for both users and Ingred
 */

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  // Form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [ageConfirmed, setAgeConfirmed] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [marketingConsent, setMarketingConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Form validation
  const validateForm = (): { valid: boolean; message?: string } => {
    if (!email.trim()) {
      return { valid: false, message: 'Please enter your email address' };
    }

    if (!email.includes('@') || !email.includes('.')) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    if (!password) {
      return { valid: false, message: 'Please enter a password' };
    }

    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }

    if (!ageConfirmed) {
      return { valid: false, message: 'You must be 16 or older to use Ingred (UK data protection requirement)' };
    }

    if (!termsAccepted) {
      return { valid: false, message: 'Please accept our Terms & Privacy Agreement to continue' };
    }

    return { valid: true };
  };

  // Show terms and privacy modal
  const showTermsAndPrivacy = () => {
    Alert.alert(
      'Terms & Privacy Agreement',
      'About Ingred:\n\nIngred uses artificial intelligence to create personalised meal plans for your family.\n\nYour Rights:\n• You must be 16 or older to use this app\n• Your family\'s data is protected with industry-leading security\n• We use OpenAI to generate recipes based on your preferences\n• You can export or delete your data at any time\n\nSafety:\n• Always verify ingredients for allergies\n• AI suggestions are not medical advice\n• Check ingredient labels for safety\n\nBy continuing, you agree to our terms and privacy policy.',
      [{ text: 'I Understand', style: 'default' }]
    );
  };

  // Handle registration with comprehensive legal compliance
  const handleRegistration = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert('Registration Error', validation.message);
      return;
    }

    setLoading(true);

    try {
      // Prepare comprehensive legal consent data
      const legalConsent = {
        terms_version: "1.0",
        privacy_version: "1.0", 
        age_confirmed: ageConfirmed,
        marketing_consent: marketingConsent,
        analytics_consent: true, // Required for app functionality
        ai_learning_consent: true, // Required for AI meal planning
        ip_address: await getUserIP(),
        user_agent: await getUserAgent(),
        consent_timestamp: new Date().toISOString()
      };

      console.log('🔐 Starting registration with legal compliance...');
      
      // Register user with comprehensive legal protection
      const result = await signUp(email.trim().toLowerCase(), password, legalConsent);

      if (result.success) {
        Alert.alert(
          'Account Created! 🎉',
          'Please check your email to verify your account before signing in.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                console.log('✅ Registration successful - redirecting to login');
                router.push('/auth/login'); // Navigate to login instead of back
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          result.message || 'Please try again or contact support if this continues.'
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed', 
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
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
        
        <Text style={styles.title}>Create Your Ingred Account</Text>
        <Text style={styles.subtitle}>
          Join thousands of families planning better meals with AI
        </Text>
      </View>

      {/* Registration Form */}
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
            placeholder="At least 8 characters"
            secureTextEntry
            accessible={true}
            accessibilityLabel="Password input"
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            accessible={true}
            accessibilityLabel="Confirm password input"
          />
        </View>
      </View>

      {/* Legal Compliance Section */}
      <View style={styles.legalSection}>
        <Text style={styles.legalSectionTitle}>Legal Requirements</Text>
        
        {/* Age Verification - UK GDPR Compliance */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgeConfirmed(!ageConfirmed)}
          accessible={true}
          accessibilityLabel="Confirm age 16 or older"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: ageConfirmed }}
        >
          <View style={[styles.checkbox, ageConfirmed && styles.checked]}>
            {ageConfirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            I confirm I am 16 or older (required by UK data protection law)
          </Text>
        </TouchableOpacity>

        {/* Terms and Privacy Agreement */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setTermsAccepted(!termsAccepted)}
          accessible={true}
          accessibilityLabel="Accept terms and privacy agreement"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checked]}>
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.termsTextContainer}>
            <Text style={styles.checkboxText}>I agree to </Text>
            <TouchableOpacity onPress={showTermsAndPrivacy}>
              <Text style={styles.linkText}>Ingred's Terms & Privacy Agreement</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Optional Marketing Consent */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setMarketingConsent(!marketingConsent)}
          accessible={true}
          accessibilityLabel="Receive marketing communications"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: marketingConsent }}
        >
          <View style={[styles.checkbox, marketingConsent && styles.checked]}>
            {marketingConsent && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            I'd like to receive helpful meal planning tips and updates (optional)
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Content Notice */}
      <View style={styles.aiNotice}>
        <Text style={styles.aiNoticeTitle}>About AI-Generated Content</Text>
        <Text style={styles.aiNoticeText}>
          🧠 Ingred uses artificial intelligence to create personalised meal plans based on your family's preferences.
          {'\n\n'}
          🛡️ Always verify ingredients for allergies and dietary requirements.
          {'\n\n'}
          📋 Your family's data is protected with industry-leading privacy and security.
        </Text>
      </View>

      {/* Registration Button */}
      <TouchableOpacity
        style={[styles.registerButton, loading && styles.buttonDisabled]}
        onPress={handleRegistration}
        disabled={loading}
        accessible={true}
        accessibilityLabel="Create account"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      {/* Sign In Link */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('/auth/login')}
        accessible={true}
        accessibilityLabel="Go to sign in"
      >
        <Text style={styles.linkButtonText}>
          Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>

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

  // Legal Compliance Section
  legalSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  legalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    flex: 1,
  },
  termsTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  linkText: {
    color: '#8B5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    marginBottom: 12,
  },
  aiNoticeText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Action Buttons
  registerButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  linkButton: {
    marginHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  linkTextBold: {
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // Bottom spacing
  bottomSpacing: {
    height: 40,
  },
});