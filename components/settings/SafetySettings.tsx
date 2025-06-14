import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

/**
 * SafetySettings Component - Family Safety & AI Disclaimer Management
 * 
 * Features:
 * - Family safety overview and management
 * - AI disclaimer preference controls
 * - Allergen warning customisation
 * - Emergency contact information
 * - Safety verification preferences
 * - Educational safety resources
 */

interface SafetyPreferences {
  show_ai_disclaimers: boolean;
  allergen_warning_level: 'minimal' | 'standard' | 'comprehensive';
  require_ingredient_verification: boolean;
  show_safety_reminders: boolean;
  emergency_mode: boolean;
  detailed_allergen_info: boolean;
}

interface SafetySettingsProps {
  userPreferences: any; // From user_preferences table
  onNavigateToFamily: () => void;
}

interface SafetyEducationModalProps {
  visible: boolean;
  onClose: () => void;
}

const SafetyEducationModal: React.FC<SafetyEducationModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>AI Safety & Verification</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.safetyHero}>
            <Text style={styles.safetyHeroIcon}>🛡️</Text>
            <Text style={styles.safetyHeroTitle}>Your Family's Safety Comes First</Text>
            <Text style={styles.safetyHeroText}>
              Ingred's AI creates meal suggestions, but your judgement and verification 
              are essential for your family's safety.
            </Text>
          </View>

          <View style={styles.safetySection}>
            <Text style={styles.sectionTitle}>🧠 How Our AI Works</Text>
            
            <View style={styles.safetyPoint}>
              <Text style={styles.pointIcon}>✨</Text>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>Recipe Generation</Text>
                <Text style={styles.pointText}>
                  Our AI creates personalised recipes based on your family's preferences, 
                  dietary restrictions, and cooking skills.
                </Text>
              </View>
            </View>

            <View style={styles.safetyPoint}>
              <Text style={styles.pointIcon}>🔍</Text>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>Allergen Detection</Text>
                <Text style={styles.pointText}>
                  The AI identifies potential allergens and flags them based on your 
                  family's allergy profiles, but may not catch every variation.
                </Text>
              </View>
            </View>

            <View style={styles.safetyPoint}>
              <Text style={styles.pointIcon}>⚖️</Text>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>Ingredient Substitutions</Text>
                <Text style={styles.pointText}>
                  AI suggests alternatives for restricted ingredients, but nutritional 
                  and safety verification is your responsibility.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.verificationSection}>
            <Text style={styles.sectionTitle}>✅ Essential Verification Steps</Text>
            
            <View style={styles.verificationStep}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Check Every Ingredient</Text>
                <Text style={styles.stepText}>
                  Review all ingredients against your family's allergies and dietary restrictions. 
                  Look for hidden allergens in processed foods.
                </Text>
              </View>
            </View>

            <View style={styles.verificationStep}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Verify Portion Sizes</Text>
                <Text style={styles.stepText}>
                  Ensure portion sizes are appropriate for your family members, 
                  especially children and those with specific dietary needs.
                </Text>
              </View>
            </View>

            <View style={styles.verificationStep}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Review Cooking Instructions</Text>
                <Text style={styles.stepText}>
                  Check cooking times and temperatures, especially for meat, seafood, 
                  and foods that require specific preparation for safety.
                </Text>
              </View>
            </View>

            <View style={styles.verificationStep}>
              <Text style={styles.stepNumber}>4</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Cross-Contamination Prevention</Text>
                <Text style={styles.stepText}>
                  Be aware of cross-contamination risks in your kitchen, especially 
                  when preparing meals for family members with severe allergies.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.emergencySection}>
            <Text style={styles.emergencyTitle}>🚨 In Case of Emergency</Text>
            <Text style={styles.emergencyText}>
              If someone in your family has a severe allergic reaction:
            </Text>
            
            <View style={styles.emergencySteps}>
              <Text style={styles.emergencyStep}>• Call 999 immediately for severe reactions</Text>
              <Text style={styles.emergencyStep}>• Administer EpiPen if prescribed and trained</Text>
              <Text style={styles.emergencyStep}>• Keep emergency contacts readily available</Text>
              <Text style={styles.emergencyStep}>• Have allergy action plans visible in your kitchen</Text>
            </View>
          </View>

          <View style={styles.disclaimerSection}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Ingred's AI-generated recipes are suggestions only. We strongly recommend 
              consulting with healthcare professionals for specific dietary and allergy 
              advice. The app is not a substitute for professional medical guidance.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const SafetySettings: React.FC<SafetySettingsProps> = ({
  userPreferences,
  onNavigateToFamily,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [showSafetyEducation, setShowSafetyEducation] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Mock safety preferences - would be stored in database in production
  const [safetyPreferences, setSafetyPreferences] = useState<SafetyPreferences>({
    show_ai_disclaimers: true,
    allergen_warning_level: 'standard',
    require_ingredient_verification: true,
    show_safety_reminders: true,
    emergency_mode: false,
    detailed_allergen_info: true,
  });

  const updateSafetyPreference = async (key: keyof SafetyPreferences, value: any) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      // In production, this would update the database
      // For now, just update local state
      setSafetyPreferences(prev => ({ ...prev, [key]: value }));
      
      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`✅ Updated ${key} to ${value}`);
      
    } catch (error) {
      console.error(`❌ Error updating ${key}:`, error);
      Alert.alert('Error', `Failed to update ${key}. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleFamilySafetyOverview = () => {
    if (!userPreferences) {
      Alert.alert('Loading', 'Please wait while we load your family information...');
      return;
    }

    const allergyCount = userPreferences.allergies?.length || 0;
    const restrictionCount = userPreferences.dietary_restrictions?.length || 0;
    const householdSize = userPreferences.household_size || 1;

    Alert.alert(
      '🛡️ Family Safety Overview',
      `👨‍👩‍👧‍👦 Household size: ${householdSize} people\n\n🚨 Tracked allergies: ${allergyCount}\n\n🥗 Dietary restrictions: ${restrictionCount}\n\n⚙️ Safety level: ${safetyPreferences.allergen_warning_level}\n\n✅ AI disclaimers: ${safetyPreferences.show_ai_disclaimers ? 'Enabled' : 'Disabled'}\n\nTo update your family's allergy and dietary information, visit the Family tab.`,
      [
        { text: 'Close' },
        { text: 'Manage Family', onPress: onNavigateToFamily }
      ]
    );
  };

  const handleAllergenWarningLevel = () => {
    const levels = [
      { key: 'minimal', name: 'Minimal', description: 'Basic allergen identification only' },
      { key: 'standard', name: 'Standard', description: 'Clear warnings with context' },
      { key: 'comprehensive', name: 'Comprehensive', description: 'Detailed warnings and alternatives' }
    ];

    const currentLevel = levels.find(l => l.key === safetyPreferences.allergen_warning_level);

    Alert.alert(
      '⚠️ Allergen Warning Level',
      `Current setting: ${currentLevel?.name}\n${currentLevel?.description}\n\nChoose how detailed you want allergen warnings to be in recipes and meal plans.`,
      [
        { text: 'Keep Current' },
        ...levels.map(level => ({
          text: level.name,
          onPress: () => updateSafetyPreference('allergen_warning_level', level.key)
        }))
      ]
    );
  };

  const handleEmergencyContacts = () => {
    Alert.alert(
      '🚨 Emergency Information',
      '📞 Important Numbers:\n\n• Emergency Services: 999\n• NHS 111: 111\n• Poison Control: 0870 600 6266\n\n💡 Consider adding these to your phone\'s emergency contacts and keeping allergy action plans visible in your kitchen.\n\n📱 You can also add family emergency contacts in your device settings.',
      [
        { text: 'Got it!' },
        { 
          text: 'Add to Contacts', 
          onPress: () => {
            Alert.alert(
              'Emergency Contacts',
              'Remember to add these important numbers to your phone:\n\n• 999 - Emergency Services\n• 111 - NHS Non-Emergency\n• Your family doctor\n• Children\'s allergy specialist (if applicable)\n\nConsider setting up emergency contacts in your phone\'s settings for quick access.'
            );
          }
        }
      ]
    );
  };

  const handleIngredientSafety = () => {
    Alert.alert(
      '🔍 Ingredient Safety Tips',
      '📋 Always check:\n\n• Ingredient labels for allergens\n• "May contain" warnings\n• Cross-contamination risks\n• Expiration dates\n• Storage requirements\n\n🏪 When shopping:\n\n• Buy from trusted sources\n• Check packaging for damage\n• Read labels carefully\n• Ask about ingredients when eating out\n\n👨‍🍳 In the kitchen:\n\n• Use separate utensils for allergen-free cooking\n• Clean surfaces thoroughly\n• Store allergen-free foods separately',
      [{ text: 'Understood' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Family Safety Overview */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleFamilySafetyOverview}
        accessible={true}
        accessibilityLabel="Family safety overview"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>🛡️</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Family Safety Overview</Text>
            <Text style={styles.settingsSubtitle}>
              {userPreferences ? 
                `${userPreferences.allergies?.length || 0} allergies • ${userPreferences.dietary_restrictions?.length || 0} dietary restrictions tracked` : 
                'Loading family information...'
              }
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* AI Content & Safety */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={() => setShowSafetyEducation(true)}
        accessible={true}
        accessibilityLabel="AI content and safety information"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>🧠</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>AI Content & Safety</Text>
            <Text style={styles.settingsSubtitle}>
              Learn about AI-generated recipes and safety verification
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* AI Disclaimers Toggle */}
      <View style={styles.settingsRow}>
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>💬</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Show AI Disclaimers</Text>
            <Text style={styles.settingsSubtitle}>
              Display safety reminders with AI-generated content
            </Text>
          </View>
        </View>
        
        <View style={styles.settingsRowRight}>
          {loading.show_ai_disclaimers ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Switch
              value={safetyPreferences.show_ai_disclaimers}
              onValueChange={(value) => updateSafetyPreference('show_ai_disclaimers', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={safetyPreferences.show_ai_disclaimers ? '#8B5CF6' : '#F3F4F6'}
              accessibilityLabel="Show AI disclaimers toggle"
              accessibilityRole="switch"
            />
          )}
        </View>
      </View>

      {/* Allergen Warning Level */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleAllergenWarningLevel}
        accessible={true}
        accessibilityLabel="Allergen warning level settings"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>⚠️</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Allergen Warning Level</Text>
            <Text style={styles.settingsSubtitle}>
              {safetyPreferences.allergen_warning_level === 'minimal' ? 'Minimal warnings' :
               safetyPreferences.allergen_warning_level === 'standard' ? 'Standard warnings' :
               'Comprehensive warnings'} • Tap to change
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Ingredient Verification Requirement */}
      <View style={styles.settingsRow}>
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>✅</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Require Ingredient Verification</Text>
            <Text style={styles.settingsSubtitle}>
              Show verification reminders before cooking
            </Text>
          </View>
        </View>
        
        <View style={styles.settingsRowRight}>
          {loading.require_ingredient_verification ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Switch
              value={safetyPreferences.require_ingredient_verification}
              onValueChange={(value) => updateSafetyPreference('require_ingredient_verification', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={safetyPreferences.require_ingredient_verification ? '#8B5CF6' : '#F3F4F6'}
              accessibilityLabel="Require ingredient verification toggle"
              accessibilityRole="switch"
            />
          )}
        </View>
      </View>

      {/* Emergency Information */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleEmergencyContacts}
        accessible={true}
        accessibilityLabel="Emergency information and contacts"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>🚨</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Emergency Information</Text>
            <Text style={styles.settingsSubtitle}>
              Important numbers and emergency procedures
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Ingredient Safety Tips */}
      <TouchableOpacity
        style={[styles.settingsRow, styles.lastRow]}
        onPress={handleIngredientSafety}
        accessible={true}
        accessibilityLabel="Ingredient safety tips"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>🔍</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Ingredient Safety Tips</Text>
            <Text style={styles.settingsSubtitle}>
              Best practices for safe ingredient handling
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Safety Education Modal */}
      <SafetyEducationModal
        visible={showSafetyEducation}
        onClose={() => setShowSafetyEducation(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Settings Rows
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 56,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  settingsRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingsIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },

  settingsTextContainer: {
    flex: 1,
  },

  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  settingsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  settingsRowRight: {
    marginLeft: 12,
  },

  settingsArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    marginLeft: 12,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter',
  },

  headerSpacer: {
    width: 60,
  },

  modalContent: {
    flex: 1,
    padding: 16,
  },

  // Safety Hero Section
  safetyHero: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginBottom: 24,
  },

  safetyHeroIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  safetyHeroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  safetyHeroText: {
    fontSize: 16,
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter',
  },

  // Safety Sections
  safetySection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Inter',
  },

  safetyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },

  pointIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },

  pointContent: {
    flex: 1,
  },

  pointTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  pointText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  // Verification Section
  verificationSection: {
    marginBottom: 24,
  },

  verificationStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  stepNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 16,
    marginRight: 12,
    fontFamily: 'Inter',
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  stepText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  // Emergency Section
  emergencySection: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 24,
  },

  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  emergencyText: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  emergencySteps: {
    gap: 4,
  },

  emergencyStep: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  // Disclaimer Section
  disclaimerSection: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  disclaimerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
});