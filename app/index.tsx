import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';

/**
 * Main Welcome Screen for Ingred
 * 
 * This is the first screen users see when opening the app.
 * Preserves the beautiful design from App.js but enhanced with:
 * - expo-router navigation
 * - Scroll view for smaller screens
 * - Enhanced accessibility
 * - Foundation for authentication flow
 * 
 * Will navigate to authentication/onboarding when ready
 */

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.appName}>Ingred</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is authenticated, show different content
  if (user) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.brandingSection}>
            <Text style={styles.appName}>Welcome to Ingred!</Text>
            <Text style={styles.tagline}>
              You're signed in as {user.email}
            </Text>
            <Text style={styles.description}>
              Ready to start planning amazing meals for your family?
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>Complete family setup</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧠</Text>
              <Text style={styles.featureText}>Generate AI meal plans</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛒</Text>
              <Text style={styles.featureText}>Smart shopping lists</Text>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => console.log('🚀 Start family setup!')}
              accessible={true}
              accessibilityLabel="Start setting up your family preferences"
            >
              <Text style={styles.primaryButtonText}>Start Family Setup</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={signOut}
              accessible={true}
              accessibilityLabel="Sign out of your account"
            >
              <Text style={styles.secondaryButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalSection}>
            <Text style={styles.legalText}>
              🛡️ Your family's data is protected with industry-leading privacy
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Default welcome screen for non-authenticated users
  const handleGetStarted = () => {
    console.log('🚀 User wants to get started with Ingred!');
    console.log('🔐 Authentication system is ready - navigating to registration!');
    console.log('📊 Current auth state:', { user: !!user, isLoading });
    
    // Navigate to registration screen with legal compliance
    router.push('/auth/register');
  };

  const handleLearnMore = () => {
    console.log('📖 User wants to learn more about Ingred');
    // TODO: Navigate to about/features screen
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Main Branding Section */}
        <View style={styles.brandingSection}>
          <Text style={styles.appName}>Ingred</Text>
          <Text style={styles.tagline}>
            AI-powered weekly meal planning for your family
          </Text>
          <Text style={styles.description}>
            Stop spending hours planning meals. Get custom recipes created just for your family's needs.
          </Text>
        </View>

        {/* Features Preview Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🧠</Text>
            <Text style={styles.featureText}>Smart AI creates recipes for your family</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureText}>Safety-first with allergen warnings</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>60% cheaper than HelloFresh</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleGetStarted}
            accessible={true}
            accessibilityLabel="Get started with Ingred for free"
            accessibilityHint="Opens the registration process"
          >
            <Text style={styles.primaryButtonText}>Get Started Free</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleLearnMore}
            accessible={true}
            accessibilityLabel="Learn more about Ingred features"
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        {/* Legal/AI Disclaimer */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            🧠 AI-generated recipes - Always verify ingredients for allergies
          </Text>
          <Text style={styles.legalSubtext}>
            Designed for UK families • GDPR compliant • Age 16+
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    minHeight: '100%',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Loading state
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  
  // Branding Section
  brandingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  // Features Section
  featuresSection: {
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },

  // Actions Section
  actionsSection: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Legal Section
  legalSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  legalText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  legalSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});