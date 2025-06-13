import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

/**
 * Enhanced Index Screen - Intelligent Onboarding Router
 * 
 * This is the smart entry point for Ingred that:
 * - Routes new users through comprehensive onboarding
 * - Returns existing users to their appropriate dashboard state
 * - Handles incomplete onboarding gracefully
 * - Provides premium welcome experience for first-time visitors
 * - Demonstrates working AI integration for authenticated users
 * 
 * This creates a seamless experience that adapts to each user's
 * current state and guides them to the appropriate next step.
 */

interface UserOnboardingState {
  hasProfile: boolean
  hasPreferences: boolean
  hasFamilyMembers: boolean
  onboardingCompleted: boolean
  legalConsentRecorded: boolean
}

interface UserStats {
  recipesGenerated: number
  mealPlansCreated: number
  lastActiveDate?: string
}

export default function IndexScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [onboardingState, setOnboardingState] = useState<UserOnboardingState | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [checkingState, setCheckingState] = useState(true);

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('🔍 INDEX RENDER STATE:', {
      user: !!user,
      userId: user?.id,
      isLoading,
      checkingState,
      onboardingState,
      userStats
    });
  }, [user, isLoading, checkingState, onboardingState, userStats]);

  // Check user's onboarding state when authenticated
  useEffect(() => {
    if (user) {
      checkUserOnboardingState();
    } else {
      setCheckingState(false);
    }
  }, [user]);

  // Check comprehensive onboarding state
  const checkUserOnboardingState = async () => {
    if (!user) return;

    try {
      console.log('🔍 Checking user onboarding state...');

      // Get user profile and onboarding status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, legal_consent_recorded')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('❌ Error loading profile:', profileError);
        // If no profile exists, user needs complete onboarding
        setOnboardingState({
          hasProfile: false,
          hasPreferences: false,
          hasFamilyMembers: false,
          onboardingCompleted: false,
          legalConsentRecorded: false
        });
        setCheckingState(false);
        return;
      }

      // Get user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Get family members
      const { data: familyMembers, error: familyError } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', user.id);

      // Get user stats for dashboard
      const { data: recipes } = await supabase
        .from('generated_recipes')
        .select('id, created_at')
        .eq('user_id', user.id);

      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', user.id);

      // Determine onboarding state
      const state: UserOnboardingState = {
        hasProfile: !!profile,
        hasPreferences: !preferencesError && !!preferences,
        hasFamilyMembers: !familyError && !!familyMembers && familyMembers.length > 0,
        onboardingCompleted: profile?.onboarding_completed || false,
        legalConsentRecorded: profile?.legal_consent_recorded || false
      };

      const stats: UserStats = {
        recipesGenerated: recipes?.length || 0,
        mealPlansCreated: mealPlans?.length || 0,
        lastActiveDate: recipes?.[0]?.created_at
      };

      setOnboardingState(state);
      setUserStats(stats);

      console.log('✅ Onboarding state:', state);
      console.log('📊 User stats:', stats);

    } catch (error) {
      console.error('❌ Error checking onboarding state:', error);
      // Default to requiring onboarding on error
      setOnboardingState({
        hasProfile: false,
        hasPreferences: false,
        hasFamilyMembers: false,
        onboardingCompleted: false,
        legalConsentRecorded: false
      });
    } finally {
      setCheckingState(false);
    }
  };

  // Handle routing based on onboarding state
  const handleSmartNavigation = () => {
    if (!user || !onboardingState) {
      // New user - start with welcome
      console.log('🚀 New user - starting onboarding');
      router.push('/onboarding/welcome');
      return;
    }

    // Authenticated user - route based on completion state
    if (!onboardingState.hasPreferences) {
      console.log('📋 User needs basic preferences setup');
      router.push('/onboarding/basic-setup');
    } else if (!onboardingState.onboardingCompleted) {
      console.log('👨‍👩‍👧‍👦 User can add family members');
      router.push('/onboarding/family-setup');
    } else {
      console.log('✅ User setup complete - showing dashboard');
      // For now, show test recipe until we build the full dashboard
      router.push('/test-recipe');
    }
  };

  // Complete missing onboarding steps
  const completeOnboarding = () => {
    if (!onboardingState?.hasPreferences) {
      router.push('/onboarding/basic-setup');
    } else {
      router.push('/onboarding/family-setup');
    }
  };

  // Show loading state
  if (isLoading || checkingState) {
    console.log('🔄 SHOWING LOADING STATE - isLoading:', isLoading, 'checkingState:', checkingState);
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>🍽️</Text>
        <Text style={styles.loadingTitle}>Ingred</Text>
        <Text style={styles.loadingText}>Loading your family meal planning...</Text>
      </View>
    );
  }

  // New user welcome experience
  if (!user) {
    console.log('🆕 SHOWING NEW USER WELCOME - user is null/undefined');
    return (
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.logo}>🍽️</Text>
            <Text style={styles.brandName}>Ingred</Text>
            <Text style={styles.tagline}>AI-Powered Weekly Meal Planning</Text>
            <Text style={styles.heroSubtitle}>
              The world's first AI that creates custom meal plans for your exact family needs
            </Text>
          </View>
        </View>

        {/* Value Propositions */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🧠</Text>
            <Text style={styles.featureTitle}>Smart AI Generation</Text>
            <Text style={styles.featureDescription}>
              Custom recipes created just for your family's preferences, dietary needs, and cooking skill level.
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.featureTitle}>Family-First Design</Text>
            <Text style={styles.featureDescription}>
              Handle complex family needs - individual preferences, allergies, and special occasions all coordinated safely.
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureTitle}>Safety & Legal Excellence</Text>
            <Text style={styles.featureDescription}>
              Industry-leading allergen warnings, AI disclaimers, and UK GDPR compliance for complete peace of mind.
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureTitle}>Save 60-70% vs Meal Kits</Text>
            <Text style={styles.featureDescription}>
              Get HelloFresh-quality meal planning at grocery store prices with superior family intelligence.
            </Text>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.cta}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSmartNavigation}
          >
            <Text style={styles.buttonText}>Start Your Free Family Setup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Notice */}
        <View style={styles.legalNotice}>
          <Text style={styles.legalText}>
            🔒 Your family's data is protected with enterprise-grade security and UK GDPR compliance.
            {'\n\n'}
            🧠 All AI-generated recipes include comprehensive safety disclaimers and allergen warnings.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Authenticated user with incomplete onboarding
  if (onboardingState !== null && !onboardingState?.onboardingCompleted) {
    console.log('❌ SHOWING INCOMPLETE ONBOARDING SCREEN');
    console.log('❌ onboardingCompleted value:', onboardingState?.onboardingCompleted);
    console.log('❌ Full onboarding state:', onboardingState);
    return (
      <View style={styles.incompleteContainer}>
        <View style={styles.incompleteHeader}>
          <Text style={styles.welcomeBackTitle}>Welcome back! 👋</Text>
          <Text style={styles.incompleteSubtitle}>
            Let's finish setting up your family meal planning
          </Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Setup Progress</Text>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressIcon}>
              {onboardingState?.hasProfile ? '✅' : '🔄'}
            </Text>
            <View style={styles.progressContent}>
              <Text style={styles.progressItemTitle}>Account Created</Text>
              <Text style={styles.progressItemDesc}>Your secure account is ready</Text>
            </View>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressIcon}>
              {onboardingState?.hasPreferences ? '✅' : '📝'}
            </Text>
            <View style={styles.progressContent}>
              <Text style={styles.progressItemTitle}>Family Preferences</Text>
              <Text style={styles.progressItemDesc}>
                {onboardingState?.hasPreferences 
                  ? 'Basic preferences completed' 
                  : 'Tell us about your household needs'}
              </Text>
            </View>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressIcon}>
              {onboardingState?.hasFamilyMembers ? '✅' : '👨‍👩‍👧‍👦'}
            </Text>
            <View style={styles.progressContent}>
              <Text style={styles.progressItemTitle}>Family Members</Text>
              <Text style={styles.progressItemDesc}>
                {onboardingState?.hasFamilyMembers 
                  ? 'Individual family members added' 
                  : 'Add family members for personalized planning (optional)'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.incompleteActions}>
          <TouchableOpacity
            style={styles.continueSetupButton}
            onPress={completeOnboarding}
          >
            <Text style={styles.continueSetupText}>Continue Setup</Text>
          </TouchableOpacity>

          {onboardingState?.hasPreferences && (
            <TouchableOpacity
              style={styles.skipToAppButton}
              onPress={() => {
                Alert.alert(
                  'Start Using Ingred?',
                  'You can always add family members later in settings. Would you like to start generating meal plans now?',
                  [
                    { text: 'Continue Setup', style: 'cancel' },
                    { 
                      text: 'Start Meal Planning', 
                      onPress: () => router.push('/test-recipe')
                    }
                  ]
                );
              }}
            >
              <Text style={styles.skipToAppText}>Start Meal Planning</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Authenticated user with completed onboarding - Dashboard
  console.log('✅ SHOWING COMPLETED DASHBOARD');
  console.log('✅ onboardingCompleted is TRUE, user should see dashboard');
  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.dashboardWelcome}>Welcome back! 🍽️</Text>
        <Text style={styles.dashboardSubtitle}>
          Your AI-powered meal planning is ready
        </Text>
      </View>

      {/* User Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Your Meal Planning Journey</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats?.recipesGenerated || 0}</Text>
            <Text style={styles.statLabel}>Recipes Generated</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats?.mealPlansCreated || 0}</Text>
            <Text style={styles.statLabel}>Meal Plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {onboardingState?.hasFamilyMembers ? '✅' : '➕'}
            </Text>
            <Text style={styles.statLabel}>Family Setup</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => router.push('/test-recipe')}
        >
          <Text style={styles.primaryActionText}>🧠 Generate New Recipe</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => console.log('📅 Navigate to meal planning (to be built)')}
          >
            <Text style={styles.secondaryActionText}>📅 View Meal Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => console.log('👨‍👩‍👧‍👦 Navigate to family settings (to be built)')}
          >
            <Text style={styles.secondaryActionText}>👨‍👩‍👧‍👦 Family Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Compliance Status */}
      <View style={styles.complianceSection}>
        <Text style={styles.complianceTitle}>Privacy & Safety Status</Text>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceIcon}>✅</Text>
          <Text style={styles.complianceText}>UK GDPR compliant data protection</Text>
        </View>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceIcon}>🛡️</Text>
          <Text style={styles.complianceText}>AI safety disclaimers active</Text>
        </View>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceIcon}>🔒</Text>
          <Text style={styles.complianceText}>Family data secured with enterprise-grade protection</Text>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.accountActions}>
        <TouchableOpacity
          style={styles.accountButton}
          onPress={() => console.log('⚙️ Navigate to account settings (to be built)')}
        >
          <Text style={styles.accountButtonText}>Account Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // New User Welcome (copied from previous welcome screen)
  hero: {
    backgroundColor: '#8B5CF6',
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  features: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
  },
  feature: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  cta: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  legalNotice: {
    backgroundColor: '#F0F4FF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    marginBottom: 40,
  },
  legalText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },

  // Incomplete Onboarding State
  incompleteContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  incompleteHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeBackTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  incompleteSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  progressContent: {
    flex: 1,
  },
  progressItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  progressItemDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  incompleteActions: {
    gap: 12,
  },
  continueSetupButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueSetupText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipToAppButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  skipToAppText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Completed Dashboard State
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  dashboardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dashboardWelcome: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  dashboardSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  primaryActionButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryActionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  complianceSection: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  complianceText: {
    fontSize: 14,
    color: '#059669',
    flex: 1,
  },
  accountActions: {
    alignItems: 'center',
  },
  accountButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  accountButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});