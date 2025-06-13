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
import { useAuth } from '../lib/auth';

/**
 * FIXED: Main App Index with Enhanced Routing Responsiveness
 * 
 * This now properly responds to auth state changes immediately,
 * including logout events, ensuring users are routed correctly
 * in real-time based on their authentication status.
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
  const { user, session, isLoading, isInitialized } = useAuth();
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ENHANCED: More responsive auth state monitoring
  useEffect(() => {
    console.log('🔄 Auth state changed, re-evaluating routing...')
    console.log('isInitialized:', isInitialized, 'isLoading:', isLoading, 'user:', !!user, 'session:', !!session, 'isRouting:', isRouting)
    
    // Only route when auth is fully initialized and not currently routing
    if (isInitialized && !isLoading && !isRouting) {
      console.log('✅ Conditions met, checking user status and routing...')
      checkUserStatusAndRoute()
    } else {
      console.log('⏳ Waiting for auth initialization or routing in progress...')
    }
  }, [isInitialized, isLoading, user, session, isRouting]) // Enhanced dependency array

  const checkUserStatusAndRoute = async () => {
    try {
      setIsRouting(true);
      setError(null);

      console.log('🔍 Checking real auth state for routing...');
      console.log('User:', user ? '✅ Present' : '❌ Null');
      console.log('Session:', session ? '✅ Present' : '❌ Null');

      // Build real user status from auth context
      const realUserStatus: UserStatus = {
        isAuthenticated: !!(user && session),
        onboardingCompleted: false, // We'll check this from database later
        legalConsentRecorded: false, // We'll check this from database later
        userId: user?.id,
        email: user?.email,
      };

      console.log('📊 Real user status:', realUserStatus);
      
      // If we have a user and session, check onboarding status
      if (realUserStatus.isAuthenticated && user) {
        console.log('🔍 Checking onboarding status...');
        
        try {
          // Import supabase here to avoid circular dependencies
          const { supabase } = await import('../lib/supabase');
          
          // Check if user has completed onboarding
          const { data: preferences, error: prefError } = await supabase
            .from('user_preferences')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!prefError && preferences) {
            realUserStatus.onboardingCompleted = true;
            console.log('✅ Onboarding completed');
          } else {
            console.log('ℹ️ Onboarding not completed');
          }

          // Check legal consent
          const { data: consent, error: consentError } = await supabase
            .from('user_consent')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!consentError && consent) {
            realUserStatus.legalConsentRecorded = true;
            console.log('✅ Legal consent recorded');
          } else {
            console.log('ℹ️ Legal consent not recorded');
          }
        } catch (dbError) {
          console.warn('⚠️ Could not check onboarding status:', dbError);
          // Continue with basic auth check
        }
      }

      routeUser(realUserStatus);

    } catch (err) {
      console.error('❌ Error checking user status:', err);
      setError('Failed to load app. Please try again.');
      
      // Show error alert and retry option
      Alert.alert(
        'Connection Error',
        'We\'re having trouble loading your account. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => {
            setError(null);
            setIsRouting(false);
            checkUserStatusAndRoute();
          }},
          { text: 'Continue to Login', onPress: () => {
            console.log('🔑 Forcing navigation to login');
            router.replace('/auth/login');
          }}
        ]
      );
    } finally {
      setIsRouting(false);
    }
  };

  // ENHANCED: More responsive routing with better logging
  const routeUser = (status: UserStatus) => {
    console.log('🚦 Enhanced routing user based on status:', status);

    if (!status.isAuthenticated) {
      // User not authenticated - redirect to login
      console.log('🔑 Routing to authentication (user logged out or session invalid)');
      router.replace('/auth/login');
      return;
    }

    // TEMPORARILY BYPASS LEGAL CONSENT FOR TESTING
    // TODO: Re-enable this in future conversation
    /*
    if (!status.legalConsentRecorded) {
      // User authenticated but no legal consent - redirect to legal flow
      console.log('📋 Routing to legal consent');
      router.replace('/onboarding/legal-consent');
      return;
    }
    */

    if (!status.onboardingCompleted) {
      // User authenticated with consent but onboarding incomplete
      console.log('👋 Routing to onboarding');
      router.replace('/onboarding/basic-setup');
      return;
    }

    // User is fully set up - redirect to main app (tabs)
    console.log('🏠 Routing to main app tabs');
    router.replace('/(tabs)');
  };

  // Show loading screen while determining route
  if (isLoading || !isInitialized || isRouting) {
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
              {!isInitialized 
                ? 'Initializing authentication...'
                : user 
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
  },

  brandTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  },

  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  errorActions: {
    alignItems: 'center',
  },

  retryText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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
  },
});