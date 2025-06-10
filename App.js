import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const handleGetStarted = () => {
    console.log('🚀 User wants to get started with Ingred!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Ingred</Text>
      <Text style={styles.tagline}>
        AI-powered weekly meal planning for your family
      </Text>
      <Text style={styles.description}>
        Stop spending hours planning meals. Get custom recipes created just for your family's needs.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started Free</Text>
      </TouchableOpacity>
      
      <Text style={styles.legal}>
        🧠 AI-generated recipes - Always verify ingredients for allergies
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  legal: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});