import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { 
  testDatabaseConnection, 
  debugAuthState, 
  getCurrentUser, 
  getCurrentSession,
  clearAllAuthData 
} from '../../lib/supabase';

export default function PlanScreen() {
  const { user, session, isLoading, isInitialized, signOut, debugAuth, clearAuth } = useAuth();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    const logEntry = `${timestamp} - ${message}`;
    console.log(logEntry);
    setDebugLog(prev => [...prev, logEntry]);
  };

  // Comprehensive system test
  const runSystemDiagnostics = async () => {
    setTesting(true);
    setDebugLog([]);
    addDebugLog('🚀 Starting comprehensive system diagnostics...');

    try {
      // Test 1: Environment Variables
      addDebugLog('📋 Test 1: Environment Variables');
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      addDebugLog(`URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
      addDebugLog(`Key: ${supabaseKey ? `✅ Set (${supabaseKey.length} chars)` : '❌ Missing'}`);

      // Test 2: Auth Context State
      addDebugLog('📋 Test 2: Auth Context State');
      addDebugLog(`Loading: ${isLoading ? '⏳ Yes' : '✅ No'}`);
      addDebugLog(`Initialized: ${isInitialized ? '✅ Yes' : '❌ No'}`);
      addDebugLog(`User: ${user ? '✅ Present' : '❌ Null'}`);
      addDebugLog(`Session: ${session ? '✅ Present' : '❌ Null'}`);
      
      if (user) {
        addDebugLog(`User ID: ${user.id}`);
        addDebugLog(`User Email: ${user.email}`);
      }
      
      if (session) {
        addDebugLog(`Session expires: ${new Date(session.expires_at! * 1000).toLocaleString()}`);
      }

      // Test 3: Direct Supabase Client Calls
      addDebugLog('📋 Test 3: Direct Supabase Client Calls');
      
      // Test session retrieval
      addDebugLog('Testing getCurrentSession...');
      const directSession = await getCurrentSession(3000);
      addDebugLog(`Direct session: ${directSession ? '✅ Retrieved' : '❌ Failed'}`);

      // Test user retrieval
      addDebugLog('Testing getCurrentUser...');
      const directUser = await getCurrentUser(3000);
      addDebugLog(`Direct user: ${directUser ? '✅ Retrieved' : '❌ Failed'}`);

      // Test 4: Database Connectivity
      addDebugLog('📋 Test 4: Database Connectivity');
      const dbConnected = await testDatabaseConnection(3000);
      addDebugLog(`Database: ${dbConnected ? '✅ Connected' : '❌ Failed'}`);

      // Test 5: Auth State Debug
      addDebugLog('📋 Test 5: Enhanced Auth Debug');
      const authDebugResult = await debugAuth();
      addDebugLog(`DB Connected: ${authDebugResult.dbConnected ? '✅' : '❌'}`);
      addDebugLog(`Has Session: ${authDebugResult.hasSession ? '✅' : '❌'}`);
      addDebugLog(`Has User: ${authDebugResult.hasUser ? '✅' : '❌'}`);
      if (authDebugResult.sessionExpiry) {
        addDebugLog(`Session Expiry: ${authDebugResult.sessionExpiry.toLocaleString()}`);
      }

      // Test 6: AsyncStorage State
      addDebugLog('📋 Test 6: AsyncStorage State');
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const keys = await AsyncStorage.getAllKeys();
        const authKeys = keys.filter(key => 
          key.includes('supabase') || key.includes('sb-') || key.includes('auth')
        );
        addDebugLog(`Total storage keys: ${keys.length}`);
        addDebugLog(`Auth-related keys: ${authKeys.length}`);
        authKeys.forEach(key => addDebugLog(`  - ${key}`));
      } catch (error) {
        addDebugLog(`❌ AsyncStorage check failed: ${error}`);
      }

      // Test 7: Simple Database Query
      addDebugLog('📋 Test 7: Simple Database Query');
      try {
        const { supabase } = require('../../lib/supabase');
        
        const queryPromise = supabase
          .from('user_preferences')
          .select('count', { count: 'exact', head: true });
          
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
        );

        await Promise.race([queryPromise, timeoutPromise]);
        addDebugLog('✅ Simple query successful!');
      } catch (error) {
        addDebugLog(`❌ Simple query failed: ${error}`);
      }

      addDebugLog('🎉 System diagnostics completed!');

      // Summary
      addDebugLog('📊 DIAGNOSTIC SUMMARY:');
      addDebugLog(`Environment: ${supabaseUrl && supabaseKey ? '✅ OK' : '❌ FAIL'}`);
      addDebugLog(`Auth Context: ${isInitialized ? '✅ OK' : '❌ FAIL'}`);
      addDebugLog(`Supabase Client: ${directSession !== null || directUser !== null ? '✅ OK' : '❌ FAIL'}`);
      addDebugLog(`Database: ${dbConnected ? '✅ OK' : '❌ FAIL'}`);

    } catch (error) {
      addDebugLog(`❌ Diagnostics failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  // Force complete logout and clear everything
  const forceCompleteLogout = async () => {
    addDebugLog('🚪 Starting force complete logout...');
    
    try {
      // Use context signOut
      addDebugLog('Calling context signOut...');
      await signOut();
      
      // Use enhanced clear auth
      addDebugLog('Clearing all auth data...');
      const cleared = await clearAuth();
      addDebugLog(`Auth data cleared: ${cleared ? '✅' : '❌'}`);
      
      // Additional manual clearing
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.clear();
        addDebugLog('✅ AsyncStorage completely cleared');
      } catch (error) {
        addDebugLog(`❌ AsyncStorage clear failed: ${error}`);
      }

      addDebugLog('✅ Complete logout finished');
      addDebugLog('🔄 Please restart the app now');
      
    } catch (error) {
      addDebugLog(`❌ Force logout error: ${error}`);
    }
  };

  // Test a specific user query to see if RLS is working
  const testUserQuery = async () => {
    addDebugLog('🔍 Testing user-specific query...');
    
    if (!user) {
      addDebugLog('❌ No user - cannot test user query');
      return;
    }

    try {
      const { supabase } = require('../../lib/supabase');
      
      addDebugLog(`Testing query for user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        addDebugLog(`❌ User query error: ${error.message}`);
        if (error.message.includes('JWT')) {
          addDebugLog('🔍 This looks like an auth token issue');
        }
        if (error.message.includes('RLS')) {
          addDebugLog('🔍 This looks like a Row Level Security issue');
        }
      } else {
        addDebugLog('✅ User query successful!');
        addDebugLog(`Data received: ${data ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      addDebugLog(`❌ User query failed: ${error}`);
    }
  };

  useEffect(() => {
    // Auto-run diagnostics on load
    if (isInitialized && !testing) {
      runSystemDiagnostics();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Initializing auth system...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔧 Enhanced System Diagnostics</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive testing of Supabase client and auth system
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Current Status:</Text>
          <Text style={[styles.statusText, user ? styles.statusSuccess : styles.statusError]}>
            {user ? `✅ Logged in as ${user.email}` : '❌ Not logged in'}
          </Text>
          <Text style={[styles.statusText, session ? styles.statusSuccess : styles.statusError]}>
            {session ? '✅ Valid session' : '❌ No session'}
          </Text>
          <Text style={[styles.statusText, isInitialized ? styles.statusSuccess : styles.statusWarning]}>
            {isInitialized ? '✅ Auth initialized' : '⏳ Initializing...'}
          </Text>
        </View>

        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Diagnostic Log:</Text>
          {debugLog.length === 0 && (
            <Text style={styles.debugLog}>Running initial diagnostics...</Text>
          )}
          {debugLog.map((log, index) => (
            <Text key={index} style={[
              styles.debugLog,
              log.includes('❌') && styles.debugError,
              log.includes('✅') && styles.debugSuccess,
              log.includes('⚠️') && styles.debugWarning,
              log.includes('🎉') && styles.debugCritical,
            ]}>
              {log}
            </Text>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={runSystemDiagnostics}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? '🔄 Running...' : '🔍 Run Full Diagnostics'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={testUserQuery}
            disabled={!user}
          >
            <Text style={styles.buttonText}>
              🔍 Test User Query
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={forceCompleteLogout}
          >
            <Text style={styles.buttonText}>
              🚪 Force Complete Logout
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>🎯 Next Steps:</Text>
          <Text style={styles.instructionsText}>
            1. Check if all diagnostics pass ✅{'\n'}
            2. If database connects but user queries fail → RLS issue{'\n'}
            3. If client calls timeout → Configuration issue{'\n'}
            4. If auth state inconsistent → Context issue{'\n'}
            5. Test complete logout → restart → login cycle
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusSuccess: {
    color: '#059669',
  },
  statusError: {
    color: '#DC2626',
  },
  statusWarning: {
    color: '#D97706',
  },
  debugContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 400,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  debugLog: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  debugError: {
    color: '#DC2626',
    fontWeight: '500',
  },
  debugSuccess: {
    color: '#059669',
    fontWeight: '500',
  },
  debugWarning: {
    color: '#D97706',
    fontWeight: '500',
  },
  debugCritical: {
    color: '#059669',
    fontWeight: '700',
    backgroundColor: '#F0FDF4',
  },
  buttonContainer: {
    margin: 16,
    marginTop: 0,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
  },
  secondaryButton: {
    backgroundColor: '#059669',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#F3F4F6',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});