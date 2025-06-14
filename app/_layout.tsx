import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from '../lib/auth';

/**
 * Root App Layout - Main application structure and providers
 * 
 * Features:
 * - Root navigation structure using Expo Router
 * - Safe area context for proper device handling
 * - Status bar configuration for premium appearance
 * - Global providers for authentication and state management
 * - Consistent styling and theme setup
 * - Accessibility configuration
 * 
 * Navigation Structure:
 * - app/index.tsx - Main routing logic (onboarding vs tabs)
 * - app/(tabs)/ - Main app interface after onboarding
 * - app/auth/ - Authentication screens (login, register)
 * - app/onboarding/ - User setup flow
 * - Modal screens and other overlays
 */

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
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
              Login and registration only
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
            
            {/* 
              Onboarding Flow
              User setup, family configuration, legal consent
            */}
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
              name="onboarding/family-member-setup" 
              options={{
                title: 'Family Member Setup',
                headerShown: false,
                gestureEnabled: false,
                animation: 'slide_from_right',
              }}
            />
            
            {/* 
              Test Recipe Screen
              For development and testing
            */}
            <Stack.Screen 
              name="test-recipe" 
              options={{
                title: 'Test Recipe',
                headerShown: true,
                headerStyle: styles.authHeader,
                headerTitleStyle: styles.authHeaderTitle,
                headerBackTitle: 'Back',
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
      </AuthProvider>
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
 *    auth/register → onboarding/legal-consent → 
 *    onboarding/basic-setup → onboarding/family-setup → 
 *    onboarding/family-member-setup → (tabs)/index
 * 
 * 3. Returning User Flow:
 *    app/index → (tabs)/index (if onboarding complete)
 * 
 * 4. Logged Out Flow:
 *    app/index → auth/login → (tabs)/index
 * 
 * Screen Hierarchy:
 * - Root screens: index, (tabs), auth/*, onboarding/*
 * - Test screens: test-recipe
 * - Error screens: +not-found
 * 
 * Removed Routes (were causing warnings):
 * - auth/forgot-password (not implemented)
 * - auth/terms-privacy (not implemented)
 * - onboarding/welcome (not implemented)
 * - onboarding/first-meal-plan (not implemented)
 * - recipe/[id] (not implemented)
 * - meal/generate (not implemented)
 * - shopping/list (not implemented)
 */