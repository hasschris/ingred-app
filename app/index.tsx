import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Main App Index - Core routing logic that determines user experience
 * 
 * This is the first screen users see when opening Ingred. It:
 * - Checks authentication status
 * - Verifies onboarding completion 
 * - Routes to appropriate screen (tabs vs onboarding vs auth)
 * - Handles loading states and error conditions
 * - Provides premium loading experience
 * 
 * User Flow Decision Tree:
 * 1. App opens → Show loading screen
 * 2. Check authentication:
 *    - Not authenticated → Redirect to auth/login
 *    - Authenticated → Check onboarding status
 * 3. Check onboarding:
 *    - Not completed → Redirect to onboarding/welcome
 *    - Completed → Redirect to (tabs) - Main app interface
 * 
 * This replaces any "test recipe screen" and ensures users land
 * in the proper tab navigation after completing onboarding.
 */

interface UserStatus {
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  legalConsentRecorded: boolean;
  userId?: string;
  email?: string;
}

export default function AppIndex() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUserStatusAndRoute();
  }, []);

  const checkUserStatusAndRoute = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate checking authentication and onboarding status
      // In production, this would integrate with:
      // - Supabase Auth for authentication
      // - Database queries for onboarding completion
      // - Legal compliance verification
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      // Mock user status - In production, this would come from actual auth/database
      const mockUserStatus: UserStatus = {
        isAuthenticated: true, // Change to false to test auth flow
        onboardingCompleted: true, // Change to false to test onboarding flow
        legalConsentRecorded: true,
        userId: 'mock-user-123',
        email: 'family.smith@example.com',
      };

      setUserStatus(mockUserStatus);
      routeUser(mockUserStatus);

    } catch (err) {
      console.error('Error checking user status:', err);
      setError('Failed to load app. Please try again.');
      setIsLoading(false);
      
      // Show error alert and retry option
      Alert.alert(
        'Connection Error',
        'We\'re having trouble loading your account. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: checkUserStatusAndRoute },
          { text: 'Continue Offline', onPress: () => {
            // In production, would enable offline mode
            Alert.alert('Coming Soon!', 'Offline mode will be available in the next development phase.');
          }}
        ]
      );
    }
  };

  const routeUser = (status: UserStatus) => {
    setIsLoading(false);

    if (!status.isAuthenticated) {
      // User not authenticated - redirect to login
      console.log('🔑 Routing to authentication');
      router.replace('/auth/login');
      return;
    }

    if (!status.legalConsentRecorded) {
      // User authenticated but no legal consent - redirect to legal flow
      console.log('📋 Routing to legal consent');
      router.replace('/onboarding/legal-consent');
      return;
    }

    if (!status.onboardingCompleted) {
      // User authenticated with consent but onboarding incomplete
      console.log('👋 Routing to onboarding');
      router.replace('/onboarding/welcome');
      return;
    }

    // User is fully set up - redirect to main app (tabs)
    console.log('🏠 Routing to main app tabs');
    router.replace('/(tabs)');
  };

  // Show loading screen while determining route
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#8B5CF6" />
        
        {/* Premium Loading Screen */}
        <View style={styles.loadingContainer}>
          {/* Ingred Branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🍽️</Text>
            </View>
            <Text style={styles.brandName}>Ingred</Text>
            <Text style={styles.brandTagline}>
              AI-powered meal planning for families
            </Text>
          </View>

          {/* Loading Indicator */}
          <View style={styles.loadingIndicatorContainer}>
            <ActivityIndicator 
              size="large" 
              color="#FFFFFF" 
              accessibilityLabel="Loading your meal planning dashboard"
            />
            <Text style={styles.loadingText}>
              {userStatus?.isAuthenticated 
                ? 'Preparing your family meal plans...'
                : 'Loading Ingred...'
              }
            </Text>
          </View>

          {/* Safety Notice */}
          <View style={styles.safetyNotice}>
            <Text style={styles.safetyNoticeText}>
              🛡️ Your family's safety and privacy are our top priorities
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Connection Problem</Text>
            <Text style={styles.errorMessage}>
              We're having trouble connecting to our servers. Please check your internet connection and try again.
            </Text>
            
            <View style={styles.errorActions}>
              <Text style={styles.retryText}>
                Tap "Retry" above or contact support if the problem persists.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // This should never be reached due to routing, but provides fallback
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Redirecting...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6', // Brand purple background for loading
  },

  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },

  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  logoText: {
    fontSize: 40,
  },

  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  brandTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  loadingIndicatorContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },

  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  safetyNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  safetyNoticeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  // Error Screen Styles
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  errorContent: {
    alignItems: 'center',
    maxWidth: 320,
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: 24,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Inter',
  },

  errorActions: {
    alignItems: 'center',
  },

  retryText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  // Fallback Screen Styles
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fallbackText: {
    fontSize: 18,
    color: '#6B7280',
    fontFamily: 'Inter',
  },
});

/**
 * Integration Notes for Future Development:
 * 
 * Authentication Integration:
 * - Replace mock auth check with Supabase Auth
 * - Handle session refresh and token validation
 * - Implement secure token storage
 * 
 * Database Integration:
 * - Query user_profiles table for onboarding status
 * - Check user_consent table for legal compliance
 * - Verify family setup completion
 * 
 * Error Handling:
 * - Network connectivity checks
 * - Graceful offline mode
 * - Retry mechanisms with exponential backoff
 * 
 * Analytics Integration:
 * - Track routing decisions for user journey analysis
 * - Monitor onboarding completion rates
 * - Log authentication success/failure rates
 * 
 * Performance Optimisation:
 * - Preload critical data during loading screen
 * - Cache user status for faster subsequent launches
 * - Implement splash screen for instant app feel
 * 
 * Legal Compliance:
 * - GDPR consent verification
 * - Age verification (16+) status checking
 * - Privacy preference validation
 * 
 * Accessibility Features:
 * - VoiceOver announcements for loading states
 * - High contrast mode support
 * - Screen reader friendly error messages
 * - Focus management during navigation
 * 
 * Security Considerations:
 * - Secure credential storage
 * - Protection against route manipulation
 * - Session timeout handling
 * - Biometric authentication integration
 */