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
import { supabase } from '../../lib/supabase';

export default function PlanScreen() {
  const { user, signOut } = useAuth();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<any>(null);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };

  // Check detailed auth state
  const checkAuthState = async () => {
    addDebugLog('🚀 Checking detailed auth state...');

    // Check user from context
    addDebugLog(`Auth Context User: ${user ? '✅ Present' : '❌ Null'}`);
    if (user) {
      addDebugLog(`User ID: ${user.id}`);
      addDebugLog(`User Email: ${user.email || 'No email'}`);
    }

    // Check session directly from Supabase
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addDebugLog(`❌ Session check error: ${error.message}`);
      } else if (session) {
        addDebugLog(`✅ Valid session found`);
        addDebugLog(`Session expires: ${new Date(session.expires_at! * 1000).toLocaleString()}`);
        addDebugLog(`Access token length: ${session.access_token.length}`);
        setAuthState(session);
      } else {
        addDebugLog(`❌ No session found`);
        setAuthState(null);
      }
    } catch (error) {
      addDebugLog(`❌ Session check failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Check user directly from Supabase
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        addDebugLog(`❌ User check error: ${error.message}`);
      } else if (supabaseUser) {
        addDebugLog(`✅ Valid user from Supabase`);
        addDebugLog(`Supabase User ID: ${supabaseUser.id}`);
      } else {
        addDebugLog(`❌ No user from Supabase`);
      }
    } catch (error) {
      addDebugLog(`❌ User check failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Check what's in AsyncStorage now
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const keys = await AsyncStorage.getAllKeys();
      addDebugLog(`AsyncStorage keys: ${keys.length} items`);
      
      // Look for Supabase-related keys
      const supabaseKeys = keys.filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      addDebugLog(`Supabase-related keys: ${supabaseKeys.join(', ') || 'None'}`);
      
    } catch (error) {
      addDebugLog(`❌ AsyncStorage check failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    addDebugLog('🎉 Auth state check completed!');
    setLoading(false);
  };

  // Force proper logout
  const forceLogout = async () => {
    addDebugLog('🚪 Starting force logout...');
    
    try {
      // Try context signOut if available
      if (signOut) {
        addDebugLog('Calling context signOut...');
        await signOut();
        addDebugLog('✅ Context signOut completed');
      } else {
        addDebugLog('⚠️ No signOut function in context');
      }

      // Try direct Supabase signOut
      addDebugLog('Calling direct Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addDebugLog(`❌ Supabase signOut error: ${error.message}`);
      } else {
        addDebugLog('✅ Supabase signOut completed');
      }

      // Clear AsyncStorage again
      addDebugLog('Clearing AsyncStorage again...');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.clear();
      addDebugLog('✅ AsyncStorage cleared');

      addDebugLog('🔄 Restart the app now - should go to login screen');
      
    } catch (error) {
      addDebugLog(`❌ Force logout error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  // Test a simple database call to see if it works now
  const testDatabaseCall = async () => {
    addDebugLog('🔍 Testing database call...');
    
    try {
      const { data, error } = await Promise.race([
        supabase.from('user_preferences').select('count', { count: 'exact', head: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 3000)
        )
      ]) as any;
      
      if (error) {
        addDebugLog(`❌ Database call error: ${error.message}`);
      } else {
        addDebugLog(`✅ Database call successful!`);
        addDebugLog('🎉 The database issue is FIXED!');
      }
    } catch (error) {
      addDebugLog(`❌ Database call failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Checking auth state...</Text>
          <Text style={styles.loadingSubtext}>Diagnosing authentication issue</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔐 Auth State Debug</Text>
          <Text style={styles.headerSubtitle}>
            Checking why you're still logged in after clearing data
          </Text>
        </View>

        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Log:</Text>
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

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={forceLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Force Proper Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testDatabaseCall}
        >
          <Text style={styles.testButtonText}>🔍 Test Database Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            setDebugLog([]);
            setLoading(true);
            checkAuthState();
          }}
        >
          <Text style={styles.refreshButtonText}>🔄 Check Auth Again</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>🎯 What We're Looking For:</Text>
          <Text style={styles.instructionsText}>
            • Session should be null after clearing data{'\n'}
            • User should be null after proper logout{'\n'}
            • Database calls should work after fresh login{'\n'}
            • App should go to login screen after restart
          </Text>
          
          <Text style={styles.instructionsTitle}>📋 Expected Fix:</Text>
          <Text style={styles.instructionsText}>
            1. Force logout should clear everything{'\n'}
            2. Restart app → should go to login screen{'\n'}
            3. Login again → fresh session{'\n'}
            4. Database calls should work normally
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
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
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
  debugContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  logoutButton: {
    backgroundColor: '#DC2626',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#059669',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#8B5CF6',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#F3F4F6',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 12,
  },
  instructionsText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});