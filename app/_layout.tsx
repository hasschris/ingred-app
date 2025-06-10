import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../lib/auth'

/**
 * Root Layout Component
 * 
 * This wraps the entire app with:
 * - AuthProvider for authentication state management
 * - Stack navigation for screen transitions
 * - Proper status bar configuration
 */

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false, // We'll handle headers in individual screens
          animation: 'slide_from_right', // Smooth transitions
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Welcome to Ingred',
            gestureEnabled: false // Prevent gesture back on welcome screen
          }} 
        />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            title: 'Sign In',
            presentation: 'modal' // Modal presentation for auth screens
          }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            title: 'Create Account',
            presentation: 'modal' // Modal presentation for auth screens
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  )
}