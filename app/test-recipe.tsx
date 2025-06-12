// app/test-recipe.tsx
// Test screen for AI recipe generation

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../lib/auth';
import IngredAI, { RecipeGenerationRequest, UserPreferences } from '../lib/ai-integration';

/**
 * Test Recipe Generation Screen
 * 
 * This is a simple test screen to verify your AI integration works.
 * Once working, this functionality will be integrated into the main app.
 */

export default function TestRecipeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  // Simple test preferences
  const testPreferences: UserPreferences = {
    household_size: 4,
    cooking_skill: 'intermediate',
    budget_level: 'moderate',
    cooking_time_minutes: 30,
    dietary_restrictions: ['vegetarian'],
    allergies: ['nuts'],
    disliked_ingredients: ['mushrooms'],
    meals_per_week: 7,
    family_members: [
      {
        name: 'Test Adult',
        age_group: 'adult',
        dietary_restrictions: ['vegetarian'],
        allergies: ['nuts'],
        allergy_severity: ['severe']
      },
      {
        name: 'Test Child',
        age_group: 'child',
        dietary_restrictions: [],
        allergies: [],
        allergy_severity: []
      }
    ]
  };

  const generateTestRecipe = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to generate recipes');
      return;
    }

    setLoading(true);
    setGeneratedRecipe(null);

    try {
      console.log(`🧠 Testing AI recipe generation for ${mealType}...`);

      const request: RecipeGenerationRequest = {
        userId: user.id,
        preferences: testPreferences,
        mealType: mealType,
        pantryItems: ['onions', 'garlic', 'olive oil', 'tomatoes']
      };

      const result = await IngredAI.generateRecipe(request);

      if (result.success && result.recipe) {
        console.log('✅ Recipe generated successfully!');
        setGeneratedRecipe(result.recipe);
        
        Alert.alert(
          'Recipe Generated! 🎉',
          `Created "${result.recipe.title}" with ${result.recipe.detected_allergens?.length || 0} allergen warnings.`
        );
      } else {
        console.error('Recipe generation failed:', result.error);
        Alert.alert(
          'Generation Failed',
          result.user_message || result.error || 'Unknown error occurred'
        );
      }
    } catch (error) {
      console.error('Test recipe generation error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred during recipe generation.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please sign in to test recipe generation</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Test AI Recipe Generation</Text>
        <Text style={styles.subtitle}>
          Test your AI integration with sample family preferences
        </Text>
      </View>

      {/* Test Configuration Display */}
      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Test Family Configuration:</Text>
        <Text style={styles.configText}>
          • Household: 4 people (2 adults, 2 children){'\n'}
          • Skill: Intermediate cooking{'\n'}
          • Budget: Moderate{'\n'}
          • Time: 30 minutes{'\n'}
          • Diet: Vegetarian{'\n'}
          • Allergies: Nuts (severe){'\n'}
          • Dislikes: Mushrooms
        </Text>
      </View>

      {/* Test Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.testButton, loading && styles.buttonDisabled]}
          onPress={() => generateTestRecipe('breakfast')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Generating...' : 'Test Breakfast Recipe'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, loading && styles.buttonDisabled]}
          onPress={() => generateTestRecipe('lunch')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Generating...' : 'Test Lunch Recipe'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, loading && styles.buttonDisabled]}
          onPress={() => generateTestRecipe('dinner')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Generating...' : 'Test Dinner Recipe'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generated Recipe Display */}
      {generatedRecipe && (
        <View style={styles.recipeSection}>
          <Text style={styles.recipeTitle}>{generatedRecipe.title}</Text>
          
          {/* AI and Safety Indicators */}
          <View style={styles.indicatorsRow}>
            <View style={styles.aiIndicator}>
              <Text style={styles.indicatorText}>🧠 AI Generated</Text>
            </View>
            <View style={styles.safetyIndicator}>
              <Text style={styles.indicatorText}>
                🛡️ Safety Score: {generatedRecipe.safety_score}%
              </Text>
            </View>
          </View>

          {/* Recipe Details */}
          <Text style={styles.recipeDescription}>{generatedRecipe.description}</Text>

          {/* Allergen Warnings */}
          {generatedRecipe.detected_allergens?.length > 0 && (
            <View style={styles.allergenSection}>
              <Text style={styles.warningTitle}>⚠️ Allergen Warnings:</Text>
              {generatedRecipe.detected_allergens.map((allergen: any, index: number) => (
                <Text key={index} style={styles.allergenWarning}>
                  {allergen.icon} {allergen.name} - {allergen.warning_text}
                </Text>
              ))}
            </View>
          )}

          {/* Safety Warnings */}
          {generatedRecipe.safety_warnings?.length > 0 && (
            <View style={styles.safetySection}>
              <Text style={styles.warningTitle}>🛡️ Safety Notes:</Text>
              {generatedRecipe.safety_warnings.map((warning: string, index: number) => (
                <Text key={index} style={styles.safetyWarning}>• {warning}</Text>
              ))}
            </View>
          )}

          {/* Recipe Content */}
          <View style={styles.recipeContent}>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            {generatedRecipe.ingredients?.map((ingredient: string, index: number) => (
              <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
            ))}

            <Text style={styles.sectionTitle}>Instructions:</Text>
            {generatedRecipe.instructions?.map((instruction: string, index: number) => (
              <Text key={index} style={styles.instructionText}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </View>

          {/* Cost Information */}
          <View style={styles.costSection}>
            <Text style={styles.costText}>
              Generation Cost: £{generatedRecipe.generation_cost?.toFixed(6) || '0.000000'}
            </Text>
            <Text style={styles.costText}>
              Generation Time: {generatedRecipe.generation_time_ms || 0}ms
            </Text>
          </View>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingSection}>
          <Text style={styles.loadingText}>
            🧠 Generating your custom recipe...{'\n'}
            This usually takes 8-12 seconds
          </Text>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },

  // Configuration display
  configSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  configText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Buttons
  buttonSection: {
    paddingHorizontal: 20,
  },
  testButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Recipe display
  recipeSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  indicatorsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  aiIndicator: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  safetyIndicator: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  recipeDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Warnings
  allergenSection: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  safetySection: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  allergenWarning: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 4,
  },
  safetyWarning: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 18,
    marginBottom: 4,
  },

  // Recipe content
  recipeContent: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },

  // Cost information
  costSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  costText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },

  // Loading
  loadingSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Error
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 100,
  },

  // Spacing
  bottomSpacing: {
    height: 40,
  },
});