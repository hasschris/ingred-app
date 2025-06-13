import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Root App Layout - Main application structure and providers
 * 
 * Features:
 * - Root navigation structure using Expo Router
 * - Safe area context for proper device handling
 * - Status bar configuration for premium appearance
 * - Global providers for authentication, legal compliance, and state management
 * - Consistent styling and theme setup
 * - Accessibility configuration
 * 
 * Navigation Structure:
 * - app/index.tsx - Main routing logic (onboarding vs tabs)
 * - app/(tabs)/ - Main app interface after onboarding
 * - app/auth/ - Authentication screens (login, register)
 * - app/onboarding/ - User setup flow
 * - Modal screens and other overlays
 * 
 * Future Integration Points:
 * - Authentication context provider
 * - Legal compliance context
 * - AI safety management
 * - Error boundary and monitoring
 * - Deep linking configuration
 */

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* 
        StatusBar Configuration:
        - Auto style adapts to light/dark mode
        - Translucent for modern iOS/Android appearance
        - Background color matches app theme
      */}
      <StatusBar style="auto" translucent backgroundColor="#FFFFFF" />
      
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false, // Individual screens control their own headers
            contentStyle: styles.screenContent,
            animation: 'slide_from_right', // Smooth screen transitions
            gestureEnabled: true, // Enable swipe-back gestures on iOS
            gestureDirection: 'horizontal',
          }}
        >
          {/* 
            Main App Index - Routing Logic
            Determines whether user sees onboarding or main tabs
          */}
          <Stack.Screen 
            name="index" 
            options={{
              title: 'Ingred',
              headerShown: false,
            }}
          />
          
          {/* 
            Tab Navigation - Main App Interface
            Only accessible after onboarding completion
          */}
          <Stack.Screen 
            name="(tabs)" 
            options={{
              title: 'Meal Planning',
              headerShown: false,
              gestureEnabled: false, // Prevent accidental back navigation from main app
            }}
          />
          
          {/* 
            Authentication Screens
            Login, registration, password reset
          */}
          <Stack.Screen 
            name="auth/login" 
            options={{
              title: 'Sign In',
              headerShown: true,
              headerStyle: styles.authHeader,
              headerTitleStyle: styles.authHeaderTitle,
              headerBackTitle: 'Back',
              presentation: 'card',
            }}
          />
          
          <Stack.Screen 
            name="auth/register" 
            options={{
              title: 'Create Account',
              headerShown: true,
              headerStyle: styles.authHeader,
              headerTitleStyle: styles.authHeaderTitle,
              headerBackTitle: 'Back',
              presentation: 'card',
            }}
          />
          
          <Stack.Screen 
            name="auth/forgot-password" 
            options={{
              title: 'Reset Password',
              headerShown: true,
              headerStyle: styles.authHeader,
              headerTitleStyle: styles.authHeaderTitle,
              headerBackTitle: 'Sign In',
              presentation: 'card',
            }}
          />
          
          {/* 
            Legal & Privacy Screens
            Terms, privacy policy, AI safety information
          */}
          <Stack.Screen 
            name="auth/terms-privacy" 
            options={{
              title: 'Legal Information',
              headerShown: true,
              headerStyle: styles.authHeader,
              headerTitleStyle: styles.authHeaderTitle,
              headerBackTitle: 'Back',
              presentation: 'modal',
            }}
          />
          
          {/* 
            Onboarding Flow
            User setup, family configuration, preferences
          */}
          <Stack.Screen 
            name="onboarding/welcome" 
            options={{
              title: 'Welcome',
              headerShown: false,
              gestureEnabled: false, // Prevent skipping onboarding steps
              animation: 'fade',
            }}
          />
          
          <Stack.Screen 
            name="onboarding/legal-consent" 
            options={{
              title: 'Legal Consent',
              headerShown: false,
              gestureEnabled: false,
              animation: 'slide_from_right',
            }}
          />
          
          <Stack.Screen 
            name="onboarding/basic-setup" 
            options={{
              title: 'Basic Setup',
              headerShown: false,
              gestureEnabled: false,
              animation: 'slide_from_right',
            }}
          />
          
          <Stack.Screen 
            name="onboarding/family-setup" 
            options={{
              title: 'Family Setup',
              headerShown: false,
              gestureEnabled: false,
              animation: 'slide_from_right',
            }}
          />
          
          <Stack.Screen 
            name="onboarding/first-meal-plan" 
            options={{
              title: 'First Meal Plan',
              headerShown: false,
              gestureEnabled: false,
              animation: 'slide_from_right',
            }}
          />
          
          {/* 
            Recipe and Meal Screens
            Individual recipe views, detailed meal planning
          */}
          <Stack.Screen 
            name="recipe/[id]" 
            options={{
              title: 'Recipe Details',
              headerShown: true,
              headerStyle: styles.recipeHeader,
              headerTitleStyle: styles.recipeHeaderTitle,
              headerBackTitle: 'Back',
              presentation: 'card',
            }}
          />
          
          <Stack.Screen 
            name="meal/generate" 
            options={{
              title: 'Generate Recipe',
              headerShown: true,
              headerStyle: styles.recipeHeader,
              headerTitleStyle: styles.recipeHeaderTitle,
              headerBackTitle: 'Cancel',
              presentation: 'modal',
            }}
          />
          
          {/* 
            Shopping and Planning
            Shopping lists, cost tracking, meal prep
          */}
          <Stack.Screen 
            name="shopping/list" 
            options={{
              title: 'Shopping List',
              headerShown: true,
              headerStyle: styles.recipeHeader,
              headerTitleStyle: styles.recipeHeaderTitle,
              headerBackTitle: 'Plan',
              presentation: 'card',
            }}
          />
          
          {/* 
            404 Error Screen
            Handles unknown routes gracefully
          */}
          <Stack.Screen 
            name="+not-found" 
            options={{
              title: 'Page Not Found',
              headerShown: true,
              headerStyle: styles.authHeader,
              headerTitleStyle: styles.authHeaderTitle,
              presentation: 'card',
            }}
          />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screenContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Authentication Header Styling
  authHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 0,
    shadowOpacity: 0,
  },

  authHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  // Recipe/Content Header Styling
  recipeHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  recipeHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
  },
});

/**
 * Navigation Flow Documentation:
 * 
 * 1. User opens app → app/index.tsx
 *    - Check authentication status
 *    - Check onboarding completion
 *    - Route to appropriate screen
 * 
 * 2. New User Flow:
 *    auth/register → onboarding/welcome → onboarding/legal-consent → 
 *    onboarding/basic-setup → onboarding/family-setup → 
 *    onboarding/first-meal-plan → (tabs)/index
 * 
 * 3. Returning User Flow:
 *    app/index → (tabs)/index (if onboarding complete)
 * 
 * 4. Logged Out Flow:
 *    app/index → auth/login → (tabs)/index
 * 
 * Screen Hierarchy:
 * - Root screens: index, (tabs), auth/*, onboarding/*
 * - Modal screens: meal/generate, auth/terms-privacy
 * - Card screens: recipe/[id], shopping/list
 * - Error screens: +not-found
 * 
 * Future Provider Integration:
 * This layout will be enhanced with:
 * - AuthProvider for user authentication state
 * - LegalComplianceProvider for GDPR management
 * - AISafetyProvider for content safety
 * - ErrorBoundary for crash protection
 * - ThemeProvider for design system
 * 
 * Accessibility Features:
 * - Screen reader friendly navigation structure
 * - Proper screen titles for context
 * - Gesture support where appropriate
 * - Focus management between screens
 * 
 * Performance Considerations:
 * - Lazy loading of heavy screens
 * - Optimised navigation transitions
 * - Memory management for background screens
 * - Image and asset optimisation
 * 
 * Legal & Safety Integration:
 * - Legal consent screens properly isolated
 * - AI content screens with safety context
 * - Privacy-compliant navigation tracking
 * - Secure routing for sensitive information
 */