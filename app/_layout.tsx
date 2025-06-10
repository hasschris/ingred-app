import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from '../lib/auth';

/**
 * Root layout component for Ingred app
 * 
 * This is the main app structure that handles:
 * - Navigation setup with expo-router
 * - Global app providers (auth, theme, etc.)
 * - Status bar configuration
 * - Global error boundaries
 * 
 * Based on the implementation plan, this will eventually include:
 * - AuthProvider for user authentication
 * - Legal compliance providers
 * - AI safety context
 * - Global error handling
 */

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Configure status bar for iOS/Android */}
      <StatusBar style="auto" backgroundColor="#8B5CF6" />
      
      {/* Main app container */}
      <View style={styles.container}>
        {/* 
          Stack navigator setup for the app
          This will handle all screen transitions and navigation
          
          Now enhanced with AuthProvider for:
          - User authentication state management
          - Legal compliance and GDPR features
          - AI content safety awareness
          - Secure session management
          
          Future screens to add:
          - auth/login
          - auth/register  
          - onboarding flow
          - main app tabs with family features
        */}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            // Hide header by default - screens can override
            headerShown: false,
          }}
        >
          {/* 
            Main app screens will be defined here
            For now, this will show our welcome screen
            
            AuthProvider now provides:
            - user authentication state
            - legal compliance methods
            - GDPR data rights (export, deletion)
            - AI content safety integration
            
            Next screens to add:
            - auth/login with legal compliance
            - auth/register with age verification
            - onboarding flow with family setup
            - main app tabs with AI meal planning
          */}
        </Stack>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});