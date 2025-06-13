import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

// Types for the meal slot component
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
}

interface PlannedMeal {
  id: string;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  recipe?: SavedRecipe;
  special_occasion: boolean;
  loading?: boolean;
}

interface MealSlotProps {
  meal: PlannedMeal;
  isGenerating: boolean;
  onGenerateRecipe: (meal: PlannedMeal) => void;
  onViewRecipe: (meal: PlannedMeal) => void;
  onRegenerateRecipe?: (meal: PlannedMeal) => void;
  style?: any;
}

export default function MealSlot({
  meal,
  isGenerating,
  onGenerateRecipe,
  onViewRecipe,
  onRegenerateRecipe,
  style,
}: MealSlotProps) {
  
  // Get meal type emoji and info
  const getMealTypeInfo = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return { emoji: '🌅', label: 'Breakfast', timeHint: 'Morning' };
      case 'lunch':
        return { emoji: '☀️', label: 'Lunch', timeHint: 'Midday' };
      case 'dinner':
        return { emoji: '🌙', label: 'Dinner', timeHint: 'Evening' };
      default:
        return { emoji: '🍽️', label: 'Meal', timeHint: 'Anytime' };
    }
  };

  const mealInfo = getMealTypeInfo(meal.meal_type);

  // Get safety score styling
  const getSafetyScoreStyle = (score: number) => {
    if (score >= 90) return styles.safetyScoreHigh;
    if (score >= 70) return styles.safetyScoreMedium;
    return styles.safetyScoreLow;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#059669';
      case 'medium': return '#D97706';
      case 'hard': return '#DC2626';
      default: return '#6B7280';
    }
  };

  // Handle tap action
  const handlePress = () => {
    if (isGenerating) return;
    
    if (meal.recipe) {
      onViewRecipe(meal);
    } else {
      onGenerateRecipe(meal);
    }
  };

  // Handle long press for regeneration (if recipe exists)
  const handleLongPress = () => {
    if (meal.recipe && onRegenerateRecipe && !isGenerating) {
      onRegenerateRecipe(meal);
    }
  };

  if (isGenerating) {
    return (
      <View style={[styles.mealSlot, styles.mealSlotGenerating, style]}>
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={styles.generatingText}>Creating...</Text>
          <Text style={styles.generatingSubtext}>AI is working</Text>
        </View>
        
        {/* Meal Type Badge */}
        <View style={styles.mealTypeBadge}>
          <Text style={styles.mealTypeEmoji}>{mealInfo.emoji}</Text>
        </View>

        {/* AI Working Indicator */}
        <View style={styles.aiWorkingIndicator}>
          <Text style={styles.aiWorkingText}>🧠</Text>
        </View>
      </View>
    );
  }

  if (!meal.recipe) {
    return (
      <TouchableOpacity
        style={[styles.mealSlot, styles.emptyMealSlot, style]}
        onPress={handlePress}
        accessible={true}
        accessibilityLabel={`Generate ${meal.meal_type} recipe for ${meal.meal_date}`}
        accessibilityHint="Tap to create an AI-generated recipe for this meal"
        accessibilityRole="button"
      >
        <View style={styles.emptyMealContent}>
          {/* Meal Type Display */}
          <Text style={styles.mealTypeEmojiLarge}>{mealInfo.emoji}</Text>
          <Text style={styles.emptyMealTitle}>{mealInfo.label}</Text>
          <Text style={styles.emptyMealSubtitle}>{mealInfo.timeHint}</Text>
          
          {/* Generate Prompt */}
          <View style={styles.generatePrompt}>
            <Text style={styles.generatePromptText}>Tap to generate</Text>
            <Text style={styles.generatePromptSubtext}>AI will create a recipe</Text>
          </View>
        </View>

        {/* AI Notice for Empty Slots */}
        <View style={styles.aiNoticeSmall}>
          <Text style={styles.aiNoticeSmallText}>🧠 AI</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Recipe exists - show recipe card
  const recipe = meal.recipe;
  
  return (
    <TouchableOpacity
      style={[styles.mealSlot, styles.mealSlotFilled, style]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessible={true}
      accessibilityLabel={`${meal.meal_type}: ${recipe.title}, ${recipe.total_time} minutes, ${recipe.difficulty} difficulty`}
      accessibilityHint={`Tap to view recipe details${onRegenerateRecipe ? ', long press to regenerate' : ''}`}
      accessibilityRole="button"
    >
      {/* Meal Type Badge */}
      <View style={styles.mealTypeBadge}>
        <Text style={styles.mealTypeEmoji}>{mealInfo.emoji}</Text>
      </View>

      {/* Recipe Content */}
      <View style={styles.recipeContent}>
        {/* Recipe Title */}
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>

        {/* Recipe Meta Info */}
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⏱️</Text>
            <Text style={styles.metaText}>{recipe.total_time}m</Text>
          </View>
          <View style={styles.metaItem}>
            <Text 
              style={[styles.metaText, { color: getDifficultyColor(recipe.difficulty) }]}
            >
              {recipe.difficulty}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>{recipe.servings}</Text>
          </View>
        </View>

        {/* Family Reasoning Preview */}
        {recipe.family_reasoning && (
          <Text style={styles.familyReasoning} numberOfLines={2}>
            💭 {recipe.family_reasoning}
          </Text>
        )}
      </View>

      {/* Safety Indicators */}
      <View style={styles.safetyIndicators}>
        {/* Allergen Warnings */}
        {recipe.detected_allergens && recipe.detected_allergens.length > 0 && (
          <View style={styles.allergenWarning}>
            <View style={styles.allergenIcons}>
              {recipe.detected_allergens.slice(0, 3).map((allergen, index) => (
                <Text key={index} style={styles.allergenIcon}>
                  {allergen.icon}
                </Text>
              ))}
              {recipe.detected_allergens.length > 3 && (
                <Text style={styles.allergenMore}>+{recipe.detected_allergens.length - 3}</Text>
              )}
            </View>
          </View>
        )}

        {/* Safety Score */}
        <View style={[styles.safetyScore, getSafetyScoreStyle(recipe.safety_score)]}>
          <Text style={styles.safetyScoreText}>{recipe.safety_score}%</Text>
        </View>
      </View>

      {/* AI Generated Indicator */}
      {recipe.ai_generated && (
        <View style={styles.aiIndicator}>
          <Text style={styles.aiIndicatorText}>🧠 AI</Text>
        </View>
      )}

      {/* Special Occasion Indicator */}
      {meal.special_occasion && (
        <View style={styles.specialOccasionIndicator}>
          <Text style={styles.specialOccasionText}>✨</Text>
        </View>
      )}

      {/* Cost Indicator */}
      {recipe.estimated_cost && (
        <View style={styles.costIndicator}>
          <Text style={styles.costText}>£{recipe.estimated_cost.toFixed(2)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mealSlot: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  
  // Empty meal slot styles
  emptyMealSlot: {
    backgroundColor: '#FAFAFA',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMealContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  mealTypeEmojiLarge: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyMealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptyMealSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  generatePrompt: {
    alignItems: 'center',
  },
  generatePromptText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  generatePromptSubtext: {
    fontSize: 10,
    color: '#6B7280',
  },
  
  // Filled meal slot styles
  mealSlotFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    shadowOpacity: 0.1,
  },
  
  // Generating state styles
  mealSlotGenerating: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderStyle: 'solid',
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
  },
  generatingSubtext: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },
  
  // Recipe content styles
  recipeContent: {
    flex: 1,
    marginTop: 6,
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 18,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaIcon: {
    fontSize: 10,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  familyReasoning: {
    fontSize: 10,
    color: '#7C3AED',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  
  // Badge styles
  mealTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  mealTypeEmoji: {
    fontSize: 12,
  },
  
  // AI indicators
  aiIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EBE9FE',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
  },
  aiIndicatorText: {
    fontSize: 9,
    color: '#7C3AED',
    fontWeight: '600',
  },
  aiNoticeSmall: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  aiNoticeSmallText: {
    fontSize: 8,
    color: '#7C3AED',
    fontWeight: '600',
  },
  aiWorkingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
  },
  aiWorkingText: {
    fontSize: 12,
  },
  
  // Safety indicators
  safetyIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  allergenWarning: {
    flex: 1,
  },
  allergenIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  allergenIcon: {
    fontSize: 12,
  },
  allergenMore: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 2,
  },
  
  // Safety score
  safetyScore: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 32,
    alignItems: 'center',
  },
  safetyScoreHigh: {
    backgroundColor: '#D1FAE5',
  },
  safetyScoreMedium: {
    backgroundColor: '#FEF3C7',
  },
  safetyScoreLow: {
    backgroundColor: '#FEE2E2',
  },
  safetyScoreText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Special indicators
  specialOccasionIndicator: {
    position: 'absolute',
    top: 36,
    right: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialOccasionText: {
    fontSize: 10,
  },
  costIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  costText: {
    fontSize: 8,
    color: '#166534',
    fontWeight: '600',
  },
});