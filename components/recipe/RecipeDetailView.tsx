import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface DetectedAllergen {
  name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  icon: string;
  warning_text: string;
}

interface Recipe {
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

interface RecipeDetailViewProps {
  recipe: Recipe;
}

export default function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Format recipe timing
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get difficulty styling
  const getDifficultyStyle = () => {
    switch (recipe.difficulty) {
      case 'easy':
        return { color: '#059669', backgroundColor: '#D1FAE5' };
      case 'hard':
        return { color: '#DC2626', backgroundColor: '#FEE2E2' };
      default:
        return { color: '#D97706', backgroundColor: '#FEF3C7' };
    }
  };

  // Get safety score styling
  const getSafetyScoreStyle = () => {
    if (recipe.safety_score >= 90) return { color: '#059669', backgroundColor: '#D1FAE5' };
    if (recipe.safety_score >= 70) return { color: '#D97706', backgroundColor: '#FEF3C7' };
    return { color: '#DC2626', backgroundColor: '#FEE2E2' };
  };

  return (
    <View style={styles.container}>
      {/* Recipe Title & Overview */}
      <View style={styles.titleSection}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <Text style={styles.recipeDescription}>{recipe.description}</Text>

        {/* Meta information grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>⏱️ {formatTime(recipe.total_time)}</Text>
            <Text style={styles.metaLabel}>Total Time</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>👥 {recipe.servings}</Text>
            <Text style={styles.metaLabel}>Servings</Text>
          </View>
          <View style={styles.metaItem}>
            <View style={[styles.difficultyBadge, getDifficultyStyle()]}>
              <Text style={[styles.metaValue, { color: getDifficultyStyle().color }]}>
                {recipe.difficulty}
              </Text>
            </View>
            <Text style={styles.metaLabel}>Difficulty</Text>
          </View>
          <View style={styles.metaItem}>
            <View style={[styles.safetyBadge, getSafetyScoreStyle()]}>
              <Text style={[styles.metaValue, { color: getSafetyScoreStyle().color }]}>
                {recipe.safety_score}%
              </Text>
            </View>
            <Text style={styles.metaLabel}>Safety Score</Text>
          </View>
        </View>
      </View>

      {/* Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 Ingredients ({(recipe.ingredients || []).length})</Text>
        <View style={styles.ingredientsList}>
          {(recipe.ingredients || []).map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Instructions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👩‍🍳 Instructions ({(recipe.instructions || []).length} steps)</Text>
        <View style={styles.instructionsList}>
          {(recipe.instructions || []).map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Nutrition & Dietary Info */}
      {(recipe.nutrition_highlights || (recipe.dietary_compliance && recipe.dietary_compliance.length > 0)) && (
        <TouchableOpacity 
          style={styles.section}
          onPress={() => toggleSection('nutrition')}
          accessible={true}
          accessibilityLabel="Nutrition and dietary information"
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🥗 Nutrition & Dietary Info</Text>
            <Text style={styles.expandIcon}>
              {expandedSections.has('nutrition') ? '−' : '+'}
            </Text>
          </View>
          {expandedSections.has('nutrition') && (
            <View style={styles.nutritionContent}>
              {recipe.nutrition_highlights && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Nutrition Highlights:</Text>
                  <Text style={styles.nutritionText}>{recipe.nutrition_highlights}</Text>
                </View>
              )}
              {recipe.dietary_compliance && recipe.dietary_compliance.length > 0 && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Dietary Compliance:</Text>
                  <View style={styles.complianceGrid}>
                    {recipe.dietary_compliance.map((item, index) => (
                      <View key={index} style={styles.complianceItem}>
                        <Text style={styles.complianceText}>✓ {item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Title section
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 36,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },

  // Sections
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  expandIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  
  // Ingredients
  ingredientsList: {
    gap: 8,
    marginTop: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  
  // Instructions
  instructionsList: {
    gap: 12,
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  
  // Nutrition
  nutritionContent: {
    gap: 12,
  },
  nutritionItem: {
    gap: 4,
  },
  nutritionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  nutritionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  complianceItem: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  complianceText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
});