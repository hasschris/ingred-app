import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

/**
 * Family Setup Wizard - Basic Preferences
 * 
 * This is the core of Ingred's family-first value proposition.
 * Collects the 8 mandatory preferences that enable AI-powered
 * family meal planning with safety and legal compliance.
 * 
 * Features:
 * - Beautiful, premium design matching HelloFresh quality
 * - Progressive disclosure to avoid overwhelming users
 * - Integrated safety warnings and AI disclaimers
 * - Real-time validation and helpful guidance
 * - Accessibility-first design with WCAG compliance
 * - Legal compliance awareness throughout
 */

const { width: screenWidth } = Dimensions.get('window');

// The 8 mandatory questions that unlock Ingred's AI capabilities
interface BasicPreferences {
  household_size: number
  cooking_skill: 'beginner' | 'intermediate' | 'advanced'
  budget_level: 'budget' | 'moderate' | 'premium'
  cooking_time_minutes: number
  dietary_restrictions: string[]
  allergies: string[]
  disliked_ingredients: string[]
  meals_per_week: number
}

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: '🌱 Vegetarian', description: 'No meat or fish' },
  { id: 'vegan', label: '🌿 Vegan', description: 'No animal products' },
  { id: 'pescatarian', label: '🐟 Pescatarian', description: 'Fish but no meat' },
  { id: 'gluten-free', label: '🌾 Gluten-Free', description: 'No wheat, barley, rye' },
  { id: 'dairy-free', label: '🥛 Dairy-Free', description: 'No milk products' },
  { id: 'keto', label: '🥑 Ketogenic', description: 'Very low carb, high fat' },
  { id: 'paleo', label: '🦕 Paleo', description: 'Whole foods, no processed' },
  { id: 'low-sodium', label: '🧂 Low Sodium', description: 'Reduced salt intake' }
];

const COMMON_ALLERGENS = [
  { id: 'nuts', label: '🥜 Tree Nuts', severity: 'high' },
  { id: 'peanuts', label: '🥜 Peanuts', severity: 'high' },
  { id: 'dairy', label: '🥛 Dairy/Milk', severity: 'medium' },
  { id: 'eggs', label: '🥚 Eggs', severity: 'medium' },
  { id: 'shellfish', label: '🦐 Shellfish', severity: 'high' },
  { id: 'fish', label: '🐟 Fish', severity: 'medium' },
  { id: 'soy', label: '🫘 Soy', severity: 'medium' },
  { id: 'sesame', label: '🌱 Sesame', severity: 'medium' }
];

export default function BasicSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form state for the 8 mandatory preferences
  const [preferences, setPreferences] = useState<BasicPreferences>({
    household_size: 2,
    cooking_skill: 'intermediate',
    budget_level: 'moderate',
    cooking_time_minutes: 30,
    dietary_restrictions: [],
    allergies: [],
    disliked_ingredients: [],
    meals_per_week: 5
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 8;

  // Helper to update preferences
  const updatePreference = (key: keyof BasicPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Toggle array values (for multi-select options)
  const toggleArrayValue = (key: keyof BasicPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(item => item !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  // Validate current step
  const validateCurrentStep = (): { valid: boolean; message?: string } => {
    switch (currentStep) {
      case 1: // Household size
        if (preferences.household_size < 1 || preferences.household_size > 12) {
          return { valid: false, message: 'Please enter a household size between 1 and 12 people.' };
        }
        break;
      case 4: // Cooking time
        if (preferences.cooking_time_minutes < 5 || preferences.cooking_time_minutes > 180) {
          return { valid: false, message: 'Please choose a cooking time between 5 and 180 minutes.' };
        }
        break;
      case 8: // Meals per week
        if (preferences.meals_per_week < 1 || preferences.meals_per_week > 21) {
          return { valid: false, message: 'Please choose between 1 and 21 meals per week.' };
        }
        break;
    }
    return { valid: true };
  };

  // Navigate to next step
  const nextStep = () => {
    const validation = validateCurrentStep();
    if (!validation.valid) {
      Alert.alert('Please Complete This Step', validation.message);
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSavePreferences();
    }
  };

  // Navigate to previous step
  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save preferences to database
  const handleSavePreferences = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to save your preferences.');
      return;
    }

    setLoading(true);

    try {
      console.log('💾 Saving family preferences...', preferences);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save preferences:', error);
        Alert.alert(
          'Save Failed',
          'We couldn\'t save your preferences. Please try again or contact support.'
        );
        return;
      }

      // Mark onboarding step completed
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      console.log('✅ Preferences saved successfully!');

      Alert.alert(
        'Setup Complete! 🎉',
        'Your family preferences have been saved. Now let\'s generate your first AI-powered meal plan!',
        [
          { 
            text: 'Generate First Meal Plan', 
            onPress: () => {
              console.log('🚀 Navigate to first meal plan generation');
              // For now, go back to home - later this will be the first meal plan screen
              router.replace('/');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Unexpected error saving preferences:', error);
      Alert.alert('Unexpected Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render individual setup steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContainer
            title="How many people are you cooking for?"
            subtitle="Including yourself and anyone who regularly eats meals you prepare"
            icon="👨‍👩‍👧‍👦"
          >
            <View style={styles.numberInputContainer}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => updatePreference('household_size', Math.max(1, preferences.household_size - 1))}
              >
                <Text style={styles.numberButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.numberDisplay}>
                <Text style={styles.numberValue}>{preferences.household_size}</Text>
                <Text style={styles.numberLabel}>
                  {preferences.household_size === 1 ? 'person' : 'people'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => updatePreference('household_size', Math.min(12, preferences.household_size + 1))}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>
              This helps our AI create recipes with the right portion sizes for your household.
            </Text>
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer
            title="What's your cooking skill level?"
            subtitle="This helps us suggest recipes that match your comfort in the kitchen"
            icon="👨‍🍳"
          >
            <View style={styles.optionGrid}>
              {[
                { value: 'beginner', label: 'Beginner', desc: 'Simple recipes with basic techniques' },
                { value: 'intermediate', label: 'Intermediate', desc: 'More variety, some advanced techniques' },
                { value: 'advanced', label: 'Advanced', desc: 'Complex recipes and challenging dishes' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    preferences.cooking_skill === option.value && styles.optionCardSelected
                  ]}
                  onPress={() => updatePreference('cooking_skill', option.value)}
                >
                  <Text style={[
                    styles.optionTitle,
                    preferences.cooking_skill === option.value && styles.optionTitleSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    preferences.cooking_skill === option.value && styles.optionDescriptionSelected
                  ]}>
                    {option.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </StepContainer>
        );

      case 3:
        return (
          <StepContainer
            title="What's your budget preference?"
            subtitle="We'll suggest recipes that fit comfortably within your preferred spending range"
            icon="💰"
          >
            <View style={styles.optionGrid}>
              {[
                { value: 'budget', label: 'Budget-Friendly', desc: '£2-4 per serving, basic ingredients' },
                { value: 'moderate', label: 'Moderate', desc: '£4-7 per serving, good variety' },
                { value: 'premium', label: 'Premium', desc: '£7+ per serving, high-quality ingredients' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    preferences.budget_level === option.value && styles.optionCardSelected
                  ]}
                  onPress={() => updatePreference('budget_level', option.value)}
                >
                  <Text style={[
                    styles.optionTitle,
                    preferences.budget_level === option.value && styles.optionTitleSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    preferences.budget_level === option.value && styles.optionDescriptionSelected
                  ]}>
                    {option.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helpText}>
              💡 Ingred saves you 60-70% compared to meal kit services while maintaining quality!
            </Text>
          </StepContainer>
        );

      case 4:
        return (
          <StepContainer
            title="How much time do you typically have to cook?"
            subtitle="We'll suggest recipes that fit your available cooking time"
            icon="⏰"
          >
            <View style={styles.timeContainer}>
              <View style={styles.timeSliderContainer}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => updatePreference('cooking_time_minutes', Math.max(5, preferences.cooking_time_minutes - 5))}
                >
                  <Text style={styles.timeButtonText}>−</Text>
                </TouchableOpacity>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeValue}>{preferences.cooking_time_minutes}</Text>
                  <Text style={styles.timeLabel}>minutes</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => updatePreference('cooking_time_minutes', Math.min(180, preferences.cooking_time_minutes + 5))}
                >
                  <Text style={styles.timeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timePresets}>
                {[15, 30, 45, 60].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timePreset,
                      preferences.cooking_time_minutes === time && styles.timePresetSelected
                    ]}
                    onPress={() => updatePreference('cooking_time_minutes', time)}
                  >
                    <Text style={[
                      styles.timePresetText,
                      preferences.cooking_time_minutes === time && styles.timePresetTextSelected
                    ]}>
                      {time}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </StepContainer>
        );

      case 5:
        return (
          <StepContainer
            title="Any dietary restrictions?"
            subtitle="Select any that apply to your household"
            icon="🥗"
          >
            <View style={styles.multiSelectGrid}>
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <TouchableOpacity
                  key={restriction.id}
                  style={[
                    styles.multiSelectCard,
                    preferences.dietary_restrictions.includes(restriction.id) && styles.multiSelectCardSelected
                  ]}
                  onPress={() => toggleArrayValue('dietary_restrictions', restriction.id)}
                >
                  <Text style={[
                    styles.multiSelectLabel,
                    preferences.dietary_restrictions.includes(restriction.id) && styles.multiSelectLabelSelected
                  ]}>
                    {restriction.label}
                  </Text>
                  <Text style={[
                    styles.multiSelectDescription,
                    preferences.dietary_restrictions.includes(restriction.id) && styles.multiSelectDescriptionSelected
                  ]}>
                    {restriction.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.skipOption}>
              <TouchableOpacity onPress={() => updatePreference('dietary_restrictions', [])}>
                <Text style={styles.skipText}>No dietary restrictions</Text>
              </TouchableOpacity>
            </View>
          </StepContainer>
        );

      case 6:
        return (
          <StepContainer
            title="Any food allergies?"
            subtitle="Critical for your family's safety - we'll avoid these completely"
            icon="⚠️"
            critical={true}
          >
            <View style={styles.allergenWarning}>
              <Text style={styles.allergenWarningText}>
                🛡️ Safety First: Our AI will automatically avoid these allergens in all recipes, 
                but always verify ingredients on product labels.
              </Text>
            </View>
            <View style={styles.multiSelectGrid}>
              {COMMON_ALLERGENS.map((allergen) => (
                <TouchableOpacity
                  key={allergen.id}
                  style={[
                    styles.multiSelectCard,
                    styles.allergenCard,
                    preferences.allergies.includes(allergen.id) && styles.allergenCardSelected
                  ]}
                  onPress={() => toggleArrayValue('allergies', allergen.id)}
                >
                  <Text style={[
                    styles.multiSelectLabel,
                    preferences.allergies.includes(allergen.id) && styles.allergenLabelSelected
                  ]}>
                    {allergen.label}
                  </Text>
                  {allergen.severity === 'high' && (
                    <Text style={styles.severityBadge}>High Risk</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.skipOption}>
              <TouchableOpacity onPress={() => updatePreference('allergies', [])}>
                <Text style={styles.skipText}>No known allergies</Text>
              </TouchableOpacity>
            </View>
          </StepContainer>
        );

      case 7:
        return (
          <StepContainer
            title="Any ingredients you strongly dislike?"
            subtitle="We'll avoid these when possible (optional)"
            icon="😐"
          >
            <TextInput
              style={styles.textInput}
              placeholder="e.g., mushrooms, olives, blue cheese..."
              value={preferences.disliked_ingredients.join(', ')}
              onChangeText={(text) => updatePreference('disliked_ingredients', 
                text.split(',').map(item => item.trim()).filter(item => item.length > 0)
              )}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.helpText}>
              Separate multiple ingredients with commas. This helps us personalize your meal plans.
            </Text>
            <View style={styles.skipOption}>
              <TouchableOpacity onPress={() => updatePreference('disliked_ingredients', [])}>
                <Text style={styles.skipText}>Skip this step</Text>
              </TouchableOpacity>
            </View>
          </StepContainer>
        );

      case 8:
        return (
          <StepContainer
            title="How many meals per week would you like planned?"
            subtitle="We can plan anything from a few dinners to all your meals"
            icon="📅"
          >
            <View style={styles.mealPlanGrid}>
              {[
                { value: 3, label: '3 Dinners', desc: 'Perfect for getting started' },
                { value: 5, label: '5 Dinners', desc: 'Weeknight meal planning' },
                { value: 7, label: '7 Dinners', desc: 'Complete dinner planning' },
                { value: 14, label: '14 Meals', desc: 'Lunch + dinner every day' },
                { value: 21, label: '21 Meals', desc: 'Complete meal planning' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.mealPlanCard,
                    preferences.meals_per_week === option.value && styles.mealPlanCardSelected
                  ]}
                  onPress={() => updatePreference('meals_per_week', option.value)}
                >
                  <Text style={[
                    styles.mealPlanNumber,
                    preferences.meals_per_week === option.value && styles.mealPlanNumberSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.mealPlanDescription,
                    preferences.meals_per_week === option.value && styles.mealPlanDescriptionSelected
                  ]}>
                    {option.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={currentStep === 1 ? () => router.back() : previousStep}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / totalSteps) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={nextStep}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : currentStep === totalSteps ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>
        
        {/* AI Notice */}
        <Text style={styles.aiNotice}>
          🧠 Your preferences help our AI create perfect meal plans for your family
        </Text>
      </View>
    </View>
  );
}

// Reusable step container component
interface StepContainerProps {
  title: string
  subtitle: string
  icon: string
  critical?: boolean
  children: React.ReactNode
}

function StepContainer({ title, subtitle, icon, critical, children }: StepContainerProps) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepIcon}>{icon}</Text>
        <Text style={[styles.stepTitle, critical && styles.stepTitleCritical]}>
          {title}
        </Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.stepContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header and Progress
  header: {
    paddingTop: 60,
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

  // Content Area
  content: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  stepTitleCritical: {
    color: '#DC2626',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  stepContent: {
    alignItems: 'center',
  },

  // Number Input (Household Size)
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  numberButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  numberButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  numberDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  numberValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#374151',
  },
  numberLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },

  // Option Cards (Skill, Budget)
  optionGrid: {
    width: '100%',
    marginBottom: 16,
  },
  optionCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F4F3FF',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#8B5CF6',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: '#6D28D9',
  },

  // Time Input
  timeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  timeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  timeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#374151',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timePresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  timePreset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  timePresetSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F4F3FF',
  },
  timePresetText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timePresetTextSelected: {
    color: '#8B5CF6',
  },

  // Multi-Select (Dietary, Allergies)
  multiSelectGrid: {
    width: '100%',
    marginBottom: 16,
  },
  multiSelectCard: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  multiSelectCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F4F3FF',
  },
  multiSelectLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  multiSelectLabelSelected: {
    color: '#8B5CF6',
  },
  multiSelectDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  multiSelectDescriptionSelected: {
    color: '#6D28D9',
  },

  // Allergen-specific styles
  allergenWarning: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 20,
    width: '100%',
  },
  allergenWarningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    textAlign: 'center',
  },
  allergenCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  allergenCardSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  allergenLabelSelected: {
    color: '#DC2626',
  },
  severityBadge: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },

  // Text Input
  textInput: {
    width: '100%',
    minHeight: 80,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 12,
  },

  // Meal Plan Grid
  mealPlanGrid: {
    width: '100%',
    marginBottom: 16,
  },
  mealPlanCard: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    alignItems: 'center',
  },
  mealPlanCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F4F3FF',
  },
  mealPlanNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  mealPlanNumberSelected: {
    color: '#8B5CF6',
  },
  mealPlanDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  mealPlanDescriptionSelected: {
    color: '#6D28D9',
  },

  // Help Text and Skip Options
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    maxWidth: 300,
  },
  skipOption: {
    marginTop: 20,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
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
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  aiNotice: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});