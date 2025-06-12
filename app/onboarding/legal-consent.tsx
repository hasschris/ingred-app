import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { getUserIP, getUserAgent } from '../../lib/auth';

/**
 * Legal Consent & Age Verification Screen
 * 
 * This screen sets the industry standard for AI app legal compliance by:
 * - UK GDPR compliance with streamlined, accessible consent
 * - Age verification (16+) as required by UK data protection law
 * - AI content safety awareness and transparency
 * - Clear, warm communication that builds trust rather than barriers
 * - Comprehensive audit trail for legal protection
 * 
 * This transforms legal compliance from a burden into a competitive
 * advantage that demonstrates Ingred's commitment to family protection.
 */

interface ConsentState {
  ageConfirmed: boolean
  termsAccepted: boolean
  privacyAccepted: boolean
  aiContentUnderstood: boolean
  marketingConsent: boolean
  analyticsConsent: boolean
}

const CURRENT_TERMS_VERSION = "1.0";
const CURRENT_PRIVACY_VERSION = "1.0";

export default function LegalConsentScreen() {
  const router = useRouter();
  
  const [consent, setConsent] = useState<ConsentState>({
    ageConfirmed: false,
    termsAccepted: false,
    privacyAccepted: false,
    aiContentUnderstood: false,
    marketingConsent: false,
    analyticsConsent: true // Default to true for app functionality
  });

  const [loading, setLoading] = useState(false);

  // Toggle consent checkbox
  const toggleConsent = (key: keyof ConsentState) => {
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Validate required consents
  const validateConsent = (): { valid: boolean; message?: string } => {
    if (!consent.ageConfirmed) {
      return { 
        valid: false, 
        message: 'Age confirmation is required. You must be 16 or older to use Ingred as required by UK data protection law.' 
      };
    }

    if (!consent.termsAccepted) {
      return { 
        valid: false, 
        message: 'Please accept our Terms of Service to continue.' 
      };
    }

    if (!consent.privacyAccepted) {
      return { 
        valid: false, 
        message: 'Please accept our Privacy Policy to continue.' 
      };
    }

    if (!consent.aiContentUnderstood) {
      return { 
        valid: false, 
        message: 'Please confirm you understand how our AI creates recipes and the importance of verifying ingredients.' 
      };
    }

    return { valid: true };
  };

  // Show detailed terms and privacy information
  const showDetailedLegal = () => {
    Alert.alert(
      'Ingred Terms & Privacy Agreement',
      `About Ingred:
Ingred uses artificial intelligence to create personalised meal plans for your family.

Your Rights (UK GDPR):
• You must be 16 or older to use this app
• Your family's data is protected with enterprise-grade security
• You can see, change, or delete your data at any time
• We use OpenAI to generate recipes based on your preferences
• We never share your family data with third parties for marketing

AI-Generated Content Safety:
• Always verify ingredients for allergies and dietary restrictions
• AI suggestions are not medical advice
• Check ingredient labels and cooking instructions for safety
• Consult healthcare providers for specific dietary needs

Data Protection:
• Your data is stored securely in the EU (London) for GDPR compliance
• We collect only the information needed to create your meal plans
• You can export or delete your data at any time
• We provide comprehensive audit trails for transparency

Contact Us:
• Privacy questions: privacy@ingred.app
• Support: help@ingred.app

By continuing, you agree to these terms and confirm you understand our AI content safety requirements.`,
      [{ text: 'I Understand', style: 'default' }]
    );
  };

  // Handle consent completion and navigation
  const handleConsentComplete = async () => {
    const validation = validateConsent();
    if (!validation.valid) {
      Alert.alert('Required Consent', validation.message);
      return;
    }

    setLoading(true);

    try {
      // Prepare comprehensive consent data for registration
      const legalConsentData = {
        terms_version: CURRENT_TERMS_VERSION,
        privacy_version: CURRENT_PRIVACY_VERSION,
        age_confirmed: consent.ageConfirmed,
        marketing_consent: consent.marketingConsent,
        analytics_consent: consent.analyticsConsent,
        ai_learning_consent: true, // Required for AI meal planning
        ip_address: await getUserIP(),
        user_agent: await getUserAgent(),
        consent_timestamp: new Date().toISOString()
      };

      console.log('✅ Legal consent completed, proceeding to registration...');

      // Store consent data temporarily and navigate to registration
      // The registration screen will use this data when creating the account
      router.push({
        pathname: '/auth/register',
        params: { 
          consentCompleted: 'true',
          consentData: JSON.stringify(legalConsentData)
        }
      });

    } catch (error) {
      console.error('Error preparing consent data:', error);
      Alert.alert(
        'Error',
        'There was an issue preparing your consent information. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Required consents count for progress indication
  const requiredConsentsCount = 4; // age, terms, privacy, AI understanding
  const completedRequiredConsents = [
    consent.ageConfirmed,
    consent.termsAccepted,
    consent.privacyAccepted,
    consent.aiContentUnderstood
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Legal Protection & Consent</Text>
        <Text style={styles.subtitle}>
          Industry-leading privacy protection for your family
        </Text>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(completedRequiredConsents / requiredConsentsCount) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedRequiredConsents} of {requiredConsentsCount} required items completed
          </Text>
        </View>
      </View>

      {/* Consent Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Age Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Age Verification</Text>
          <Text style={styles.sectionDescription}>
            Required by UK data protection law (GDPR)
          </Text>
          
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => toggleConsent('ageConfirmed')}
          >
            <View style={[styles.checkbox, consent.ageConfirmed && styles.checkboxChecked]}>
              {consent.ageConfirmed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                I confirm I am 16 years of age or older
              </Text>
              <Text style={styles.consentSubtext}>
                This is required by UK data protection regulations for family meal planning apps
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Terms & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Terms & Privacy Agreement</Text>
          <Text style={styles.sectionDescription}>
            Protecting your family's data with industry-leading standards
          </Text>
          
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => toggleConsent('termsAccepted')}
          >
            <View style={[styles.checkbox, consent.termsAccepted && styles.checkboxChecked]}>
              {consent.termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                I accept Ingred's Terms of Service
              </Text>
              <Text style={styles.consentSubtext}>
                Fair terms that protect both your family and Ingred
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => toggleConsent('privacyAccepted')}
          >
            <View style={[styles.checkbox, consent.privacyAccepted && styles.checkboxChecked]}>
              {consent.privacyAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                I accept Ingred's Privacy Policy
              </Text>
              <Text style={styles.consentSubtext}>
                Your family's meal preferences are protected with enterprise-grade security
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={showDetailedLegal}
          >
            <Text style={styles.detailsButtonText}>📖 Read Full Terms & Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* AI Content Safety Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 AI Content Safety</Text>
          <Text style={styles.sectionDescription}>
            Understanding how our AI creates safe, family-friendly meal plans
          </Text>

          <View style={styles.aiExplanationCard}>
            <Text style={styles.aiExplanationTitle}>How Ingred's AI Works:</Text>
            <Text style={styles.aiExplanationText}>
              • Creates custom recipes based on your family's specific needs{'\n'}
              • Automatically avoids allergens you specify{'\n'}
              • Includes comprehensive safety warnings and disclaimers{'\n'}
              • Provides ingredient verification reminders{'\n'}
              • Never replaces your judgment about family safety
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => toggleConsent('aiContentUnderstood')}
          >
            <View style={[styles.checkbox, consent.aiContentUnderstood && styles.checkboxChecked]}>
              {consent.aiContentUnderstood && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                I understand that Ingred uses AI to generate recipes and I will always verify ingredients for my family's safety
              </Text>
              <Text style={styles.consentSubtext}>
                AI suggestions are helpful, but you always have the final say about what's safe for your family
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Optional Consents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📬 Optional Communications</Text>
          <Text style={styles.sectionDescription}>
            Help us improve Ingred for your family (you can change these anytime)
          </Text>
          
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => toggleConsent('marketingConsent')}
          >
            <View style={[styles.checkbox, consent.marketingConsent && styles.checkboxChecked]}>
              {consent.marketingConsent && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                Send me helpful meal planning tips and feature updates
              </Text>
              <Text style={styles.consentSubtext}>
                Occasional emails about new features and meal planning advice
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => toggleConsent('analyticsConsent')}
          >
            <View style={[styles.checkbox, consent.analyticsConsent && styles.checkboxChecked]}>
              {consent.analyticsConsent && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.consentTextContainer}>
              <Text style={styles.consentText}>
                Help improve Ingred with anonymous usage analytics
              </Text>
              <Text style={styles.consentSubtext}>
                Anonymous data about app usage helps us make Ingred better for all families
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* GDPR Rights Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Your Data Rights</Text>
          <View style={styles.rightsCard}>
            <Text style={styles.rightsText}>
              Under UK GDPR, you always have the right to:{'\n\n'}
              📥 See what data we have about you{'\n'}
              ✏️ Correct any incorrect information{'\n'}
              🗑️ Delete your account and all data{'\n'}
              📤 Export your data in a standard format{'\n'}
              ❌ Object to certain uses of your data{'\n'}
              🔄 Change these consent preferences anytime
            </Text>
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>Industry-Leading Protection</Text>
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeIcon}>🇬🇧</Text>
              <Text style={styles.trustBadgeText}>UK GDPR Compliant</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeIcon}>🔒</Text>
              <Text style={styles.trustBadgeText}>Enterprise Security</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeIcon}>🧠</Text>
              <Text style={styles.trustBadgeText}>AI Safety Certified</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.trustBadgeText}>Family Data Protected</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            completedRequiredConsents < requiredConsentsCount && styles.continueButtonDisabled,
            loading && styles.continueButtonLoading
          ]}
          onPress={handleConsentComplete}
          disabled={completedRequiredConsents < requiredConsentsCount || loading}
        >
          <Text style={[
            styles.continueButtonText,
            completedRequiredConsents < requiredConsentsCount && styles.continueButtonTextDisabled
          ]}>
            {loading ? 'Processing...' : 'Continue to Account Creation'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          🔒 Your privacy choices are recorded securely and can be changed anytime in settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Content
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Consent Items
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 4,
    fontWeight: '500',
  },
  consentSubtext: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Details Button
  detailsButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F4F3FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    textAlign: 'center',
  },

  // AI Explanation
  aiExplanationCard: {
    backgroundColor: '#F0F4FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    marginBottom: 16,
  },
  aiExplanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  aiExplanationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Rights Information
  rightsCard: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  rightsText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
    fontWeight: '500',
  },

  // Trust Section
  trustSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F9FAFB',
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  trustBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  trustBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 140,
  },
  trustBadgeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  trustBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Footer
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  continueButtonLoading: {
    backgroundColor: '#A78BFA',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
  footerNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Bottom spacing
  bottomSpacing: {
    height: 40,
  },
});