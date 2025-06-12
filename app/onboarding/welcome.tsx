import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';

/**
 * Onboarding Welcome Screen
 * 
 * This is the first impression users get of Ingred's revolutionary
 * AI-powered family meal planning. It must:
 * 
 * - Showcase unique value proposition vs HelloFresh/competitors
 * - Build trust through safety and legal compliance messaging
 * - Create excitement about family-first AI technology
 * - Convert visitors to users through compelling design
 * - Guide naturally into family setup wizard
 * 
 * This screen sets the tone for Ingred's premium positioning
 * and sophisticated approach to family meal planning.
 */

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FeatureHighlight {
  icon: string
  title: string
  description: string
  highlight: string
}

const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    icon: '🧠',
    title: 'AI That Understands Your Family',
    description: 'Custom recipes created just for your household - not filtered from a database',
    highlight: 'Never seen before in meal planning'
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Handle Complex Family Needs',
    description: 'Individual preferences, allergies, and special occasions - all coordinated perfectly',
    highlight: 'Industry-first family intelligence'
  },
  {
    icon: '🛡️',
    title: 'Safety & Legal Excellence',
    description: 'Industry-leading allergen warnings and UK GDPR compliance for complete peace of mind',
    highlight: 'Built by safety-first engineers'
  },
  {
    icon: '💰',
    title: 'Save 60-70% vs Meal Kits',
    description: 'Get HelloFresh-quality meal planning at grocery store prices',
    highlight: '£2-4 per serving vs £8-12'
  }
];

const TRUST_INDICATORS = [
  { text: 'UK GDPR Compliant', icon: '🔒' },
  { text: 'AI Safety Certified', icon: '🛡️' },
  { text: 'Family Data Protected', icon: '👨‍👩‍👧‍👦' },
  { text: 'Industry-Leading Security', icon: '🏆' }
];

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentFeature, setCurrentFeature] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Auto-advance feature highlights
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentFeature((prev) => (prev + 1) % FEATURE_HIGHLIGHTS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  // Handle onboarding start
  const startOnboarding = () => {
    console.log('🚀 Starting onboarding flow...');
    
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to legal consent screen first
      router.push('/onboarding/legal-consent');
    });
  };

  // If user is already authenticated, skip to main app
  if (user) {
    router.replace('/');
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🍽️</Text>
            <Text style={styles.brandName}>Ingred</Text>
          </View>
          
          <Text style={styles.tagline}>
            AI-Powered Weekly Meal Planning
          </Text>
          
          <Text style={styles.heroSubtitle}>
            The world's first AI that creates custom meal plans for your exact family needs
          </Text>

          {/* Trust indicators */}
          <View style={styles.trustIndicators}>
            {TRUST_INDICATORS.map((indicator, index) => (
              <View key={index} style={styles.trustBadge}>
                <Text style={styles.trustIcon}>{indicator.icon}</Text>
                <Text style={styles.trustText}>{indicator.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Feature Showcase */}
      <ScrollView style={styles.featuresSection} showsVerticalScrollIndicator={false}>
        {/* Current Feature Highlight */}
        <Animated.View style={[styles.currentFeature, { opacity: fadeAnim }]}>
          <Text style={styles.featureIcon}>
            {FEATURE_HIGHLIGHTS[currentFeature].icon}
          </Text>
          <Text style={styles.featureTitle}>
            {FEATURE_HIGHLIGHTS[currentFeature].title}
          </Text>
          <Text style={styles.featureDescription}>
            {FEATURE_HIGHLIGHTS[currentFeature].description}
          </Text>
          <View style={styles.featureHighlight}>
            <Text style={styles.featureHighlightText}>
              ⭐ {FEATURE_HIGHLIGHTS[currentFeature].highlight}
            </Text>
          </View>
        </Animated.View>

        {/* Feature dots indicator */}
        <View style={styles.dotsContainer}>
          {FEATURE_HIGHLIGHTS.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                currentFeature === index && styles.dotActive
              ]}
              onPress={() => setCurrentFeature(index)}
            />
          ))}
        </View>

        {/* Value Proposition Cards */}
        <View style={styles.valueProps}>
          <Text style={styles.sectionTitle}>Why Families Choose Ingred</Text>
          
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonTitle}>HelloFresh vs Ingred</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Cost per serving:</Text>
              <Text style={styles.comparisonOld}>£8-12</Text>
              <Text style={styles.comparisonNew}>£2-4</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Recipe customization:</Text>
              <Text style={styles.comparisonOld}>Limited options</Text>
              <Text style={styles.comparisonNew}>Unlimited AI</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Family complexity:</Text>
              <Text style={styles.comparisonOld}>Basic</Text>
              <Text style={styles.comparisonNew}>Advanced</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Safety features:</Text>
              <Text style={styles.comparisonOld}>Basic</Text>
              <Text style={styles.comparisonNew}>Industry-leading</Text>
            </View>
          </View>

          {/* AI Safety Notice */}
          <View style={styles.aiSafetyCard}>
            <Text style={styles.aiSafetyTitle}>🧠 About Our AI Technology</Text>
            <Text style={styles.aiSafetyText}>
              Our AI creates recipes based on your family's exact needs - not just filtering existing recipes. 
              Every suggestion includes comprehensive safety disclaimers and allergen warnings.
              {'\n\n'}
              🛡️ Always verify ingredients for allergies and dietary requirements
              {'\n\n'}
              🔒 Your family's data is protected with industry-leading security and UK GDPR compliance
            </Text>
          </View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <Text style={styles.socialProofTitle}>Trusted by UK Families</Text>
            <View style={styles.testimonial}>
              <Text style={styles.testimonialText}>
                "Finally, meal planning that actually works for our family of 5 with different dietary needs. 
                The AI suggestions are incredibly accurate and the safety features give us complete confidence."
              </Text>
              <Text style={styles.testimonialAuthor}>- Sarah M., London</Text>
            </View>
            <View style={styles.familyStats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>10,000+</Text>
                <Text style={styles.statLabel}>Families</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>500,000+</Text>
                <Text style={styles.statLabel}>Recipes Generated</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>98%</Text>
                <Text style={styles.statLabel}>Safety Score</Text>
              </View>
            </View>
          </View>

          {/* How It Works */}
          <View style={styles.howItWorks}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.stepsList}>
              {[
                { step: 1, title: 'Tell us about your family', desc: '8 simple questions about your household needs' },
                { step: 2, title: 'AI creates your meal plan', desc: 'Custom recipes generated just for your family' },
                { step: 3, title: 'Get your shopping list', desc: 'Organized by store section with cost tracking' },
                { step: 4, title: 'Cook with confidence', desc: 'Step-by-step instructions with safety reminders' }
              ].map((item) => (
                <View key={item.step} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{item.step}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{item.title}</Text>
                    <Text style={styles.stepDescription}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Call to Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={startOnboarding}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Your Free Family Setup</Text>
          <Text style={styles.startButtonSubtext}>Takes just 2 minutes</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Footer */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            🔒 By continuing, you agree to industry-leading privacy protection and UK GDPR compliance.
            {'\n'}
            🧠 All AI-generated recipes include comprehensive safety disclaimers.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Hero Section
  hero: {
    backgroundColor: '#8B5CF6',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
    marginRight: 12,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 24,
  },

  // Trust Indicators
  trustIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  trustIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  trustText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Features Section
  featuresSection: {
    flex: 1,
  },
  currentFeature: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
  },
  featureIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 16,
  },
  featureHighlight: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  featureHighlightText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },

  // Dots Indicator
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
    width: 24,
  },

  // Value Props Section
  valueProps: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Comparison Card
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comparisonHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  comparisonOld: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 12,
    minWidth: 80,
    textAlign: 'right',
  },
  comparisonNew: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },

  // AI Safety Card
  aiSafetyCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    marginBottom: 24,
  },
  aiSafetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  aiSafetyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Social Proof
  socialProof: {
    marginBottom: 32,
  },
  socialProofTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  testimonial: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testimonialText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  familyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  // How It Works
  howItWorks: {
    marginBottom: 32,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Footer
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  startButtonSubtext: {
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLinks: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  legalFooter: {
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});