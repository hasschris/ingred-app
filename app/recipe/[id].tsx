import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { IngredAI } from '../../lib/ai-integration';

// Import our components
import RecipeDetailView from '../../components/recipe/RecipeDetailView';
import SafetyWarnings from '../../components/recipe/SafetyWarnings';
import AIDisclaimers from '../../components/recipe/AIDisclaimers';
import RecipeActions from '../../components/recipe/RecipeActions';
import FamilyReasoningCard from '../../components/recipe/FamilyReasoningCard';
import LoadingStates from '../../components/ui/LoadingStates';

// Types for recipe management
interface DetectedAllergen {
  name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  icon: string;
  warning_text: string;
}

interface SavedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  total_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  family_reasoning: string;
  allergen_considerations: string;
  dietary_compliance: string[];
  nutrition_highlights: string;
  safety_notes: string;
  ai_generated: boolean;
  detected_allergens: DetectedAllergen[];
  safety_warnings: string[];
  safety_score: number;
  generation_cost: number;
  estimated_cost?: number;
  user_rating?: number;
  user_notes?: string;
  created_at: string;
  updated_at: string;
}

interface FamilyMember {
  id: string;
  name: string;
  age_group: 'child' | 'teen' | 'adult' | 'senior';
  dietary_restrictions: string[];
  allergies: string[];
  allergy_severity: string[];
}

interface UserPreferences {
  household_size: number;
  cooking_skill: 'beginner' | 'intermediate' | 'advanced';
  budget_level: 'budget' | 'moderate' | 'premium';
  cooking_time_minutes: number;
  dietary_restrictions: string[];
  allergies: string[];
  disliked_ingredients: string[];
  meals_per_week: number;
  family_members?: FamilyMember[];
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  // Load recipe data
  const loadRecipeData = useCallback(async () => {
    if (!user?.id || !id) return;

    try {
      setLoading(true);

      // Load recipe details
      const { data: recipeData, error: recipeError } = await supabase
        .from('generated_recipes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (recipeError) {
        console.error('Recipe loading error:', recipeError);
        throw recipeError;
      }

      // Load user preferences for family context
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefError) {
        console.warn('Preferences loading error (non-blocking):', prefError);
      }

      // Load family members
      const { data: familyMembers, error: familyError } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id);

      if (familyError) {
        console.warn('Family members loading error (non-blocking):', familyError);
      }

      setRecipe(recipeData);
      setUserPreferences(preferences ? {
        ...preferences,
        family_members: familyMembers || []
      } : null);

    } catch (error) {
      console.error('Error loading recipe data:', error);
      Alert.alert(
        'Error Loading Recipe',
        'We couldn\'t load this recipe. It may have been deleted or you may not have permission to view it.',
        [
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, id]);

  // Handle recipe regeneration
  const handleRegenerate = async () => {
    if (!recipe || !userPreferences) return;

    Alert.alert(
      'Regenerate Recipe',
      'This will create a completely new recipe for this meal. The current recipe will be replaced. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Regenerate', 
          style: 'destructive',
          onPress: async () => {
            setRegenerating(true);
            
            try {
              // Use AI to generate new recipe with same constraints
              const generationResult = await IngredAI.generateRecipe({
                userId: user!.id,
                preferences: userPreferences,
                mealType: 'dinner', // We'd need to store this in the recipe
                pantryItems: [],
              });

              if (!generationResult.success) {
                throw new Error(generationResult.error || 'Generation failed');
              }

              // Delete old recipe and refresh with new one
              const { error: deleteError } = await supabase
                .from('generated_recipes')
                .delete()
                .eq('id', recipe.id);

              if (deleteError) {
                console.warn('Old recipe deletion warning:', deleteError);
              }

              // Navigate to new recipe
              if (generationResult.recipe?.id) {
                router.replace(`/recipe/${generationResult.recipe.id}`);
              }

              Alert.alert(
                '✨ New Recipe Generated!',
                'A fresh recipe has been created for your family with the same preferences.',
                [{ text: 'Explore Recipe', style: 'default' }]
              );

            } catch (error) {
              console.error('Regeneration error:', error);
              Alert.alert(
                'Regeneration Failed',
                'We couldn\'t create a new recipe right now. Please try again later.',
                [{ text: 'OK', style: 'default' }]
              );
            } finally {
              setRegenerating(false);
            }
          }
        }
      ]
    );
  };

  // Handle recipe rating
  const handleRating = async (rating: number) => {
    if (!recipe) return;

    try {
      const { error } = await supabase
        .from('generated_recipes')
        .update({ 
          user_rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id);

      if (error) throw error;

      setRecipe(prev => prev ? { ...prev, user_rating: rating } : null);

      // Show appreciation message
      const messages = {
        1: 'Thanks for the feedback! We\'ll work on better recipes.',
        2: 'Thanks for rating! We\'ll improve our suggestions.',
        3: 'Good to know! We\'ll keep refining our recipes.',
        4: 'Great! Glad this recipe worked for your family.',
        5: 'Wonderful! We\'ll create more recipes like this one.'
      };

      setTimeout(() => {
        Alert.alert('Rating Saved', messages[rating as keyof typeof messages]);
      }, 300);

    } catch (error) {
      console.error('Rating save error:', error);
      Alert.alert('Rating Error', 'We couldn\'t save your rating. Please try again.');
    }
  };

  // Handle recipe sharing
  const handleShare = async () => {
    if (!recipe) return;

    try {
      const shareContent = `🍽️ ${recipe.title}

${recipe.description}

📝 Ingredients:
${(recipe.ingredients || []).map(ing => `• ${ing}`).join('\n')}

👩‍🍳 Instructions:
${(recipe.instructions || []).map((inst, index) => `${index + 1}. ${inst}`).join('\n')}

⏱️ ${recipe.total_time} minutes | 👥 Serves ${recipe.servings} | 📊 ${recipe.difficulty}

🧠 Generated by Ingred AI for family meal planning
⚠️ Always verify ingredients for allergies and dietary restrictions

Created with Ingred - AI Family Meal Planning`;

      await Share.share({
        message: shareContent,
        title: recipe.title,
      });

    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Format recipe timing for header
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Initial load
  useEffect(() => {
    loadRecipeData();
  }, [loadRecipeData]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <LoadingStates
          type="loading"
          title="Loading your recipe..."
          subtitle="Preparing ingredients and instructions"
          showProgress={false}
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🍽️</Text>
          <Text style={styles.errorTitle}>Recipe Not Found</Text>
          <Text style={styles.errorText}>
            This recipe may have been deleted or you may not have permission to view it.
          </Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back to meal plan"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            Recipe Details • {formatTime(recipe.total_time)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
          accessible={true}
          accessibilityLabel="Share this recipe"
          accessibilityRole="button"
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* AI Content Notice */}
        <AIDisclaimers
          aiGenerated={recipe.ai_generated}
          generationCost={recipe.generation_cost}
          generationTime={0} // We don't store this currently
          safetyScore={recipe.safety_score}
          displayMode="full"
          showCostTransparency={true}
        />

        {/* Critical Safety Warnings */}
        <SafetyWarnings
          detectedAllergens={recipe.detected_allergens || []}
          safetyWarnings={recipe.safety_warnings || []}
          safetyScore={recipe.safety_score}
          familyMembers={userPreferences?.family_members || []}
          displayMode="full"
        />

        {/* Family Reasoning */}
        {recipe.family_reasoning && userPreferences && (
          <FamilyReasoningCard
            familyReasoning={recipe.family_reasoning}
            allergenConsiderations={recipe.allergen_considerations}
            userPreferences={userPreferences}
            detectedAllergens={recipe.detected_allergens || []}
            dietaryCompliance={recipe.dietary_compliance || []}
            safetyScore={recipe.safety_score}
            showDetailedBreakdown={true}
          />
        )}

        {/* Recipe Details */}
        <RecipeDetailView recipe={recipe} />

        {/* Recipe Actions */}
        <RecipeActions
          recipe={recipe}
          currentRating={recipe.user_rating || 0}
          onRate={handleRating}
          onRegenerate={handleRegenerate}
          onShare={handleShare}
          canRegenerate={true}
          showAdvancedActions={true}
        />

        {/* Return to meal plan button */}
        <View style={styles.navigationSection}>
          <TouchableOpacity 
            style={styles.backToMealPlanButton}
            onPress={() => router.back()}
            accessible={true}
            accessibilityLabel="Return to meal plan"
            accessibilityRole="button"
          >
            <Text style={styles.backToMealPlanText}>📅 Back to Meal Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Footer */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            📋 Recipe generated by Ingred AI based on your family's preferences. Always verify ingredients 
            for allergies and dietary restrictions. This is not medical advice - consult healthcare providers 
            for specific dietary requirements. Recipe rating helps improve our AI recommendations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '300',
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  shareButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  
  // Main content
  scrollView: {
    flex: 1,
  },

  // Navigation section
  navigationSection: {
    padding: 16,
  },
  backToMealPlanButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backToMealPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Legal footer
  legalFooter: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginTop: 8,
  },
  legalText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
  },
});