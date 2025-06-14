import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { IngredAI, GeneratedRecipe } from '../../lib/ai-integration';
import { DateUtils, MealPlanningService } from '../../lib/meal-planning';

// Import our enhanced loading component
import LoadingStates from '../../components/ui/LoadingStates';

// Types for our meal planning system
interface FamilyMember {
  id: string;
  name: string;
  age_group: 'child' | 'teen' | 'adult' | 'senior';
  dietary_restrictions: string[];
  allergies: string[];
  allergy_severity: string[];
}

interface UserPreferences {
  id: string;
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

interface DetectedAllergen {
  name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  icon: string;
  warning_text: string;
}

interface SavedRecipe extends GeneratedRecipe {
  id: string;
}

interface PlannedMeal {
  id: string;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  recipe?: SavedRecipe;
  special_occasion: boolean;
  loading?: boolean;
}

interface WeeklyPlan {
  id: string;
  week_start_date: string;
  meals: PlannedMeal[];
  total_cost: number;
  savings_vs_meal_kits: number;
}

const { width } = Dimensions.get('window');

export default function PlanScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState<WeeklyPlan | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingMeal, setGeneratingMeal] = useState<string | null>(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [currentGeneratingMeal, setCurrentGeneratingMeal] = useState<PlannedMeal | null>(null);

  // Get current week's Monday
  const getCurrentWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  // Load user preferences and current week plan
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Loading user preferences...');
      
      // Load user preferences (simplified query)
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefError) {
        console.error('❌ Preferences error:', prefError);
        throw prefError;
      }

      console.log('✅ User preferences loaded');

      // Load family members separately (this prevents hanging)
      const { data: familyMembers, error: familyError } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id);

      if (familyError) {
        console.error('❌ Family members error:', familyError);
        // Don't throw - empty family is OK
      }

      console.log(`✅ Family members loaded: ${familyMembers?.length || 0}`);

      // Combine preferences with family members
      const enhancedPreferences = {
        ...preferences,
        family_members: familyMembers || []
      };

      setUserPreferences(enhancedPreferences);

      // Load current week's meal plan
      const weekStart = getCurrentWeekStart();
      await loadWeeklyPlan(weekStart);

    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load your meal planning data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load weekly meal plan
  const loadWeeklyPlan = async (weekStartDate: string) => {
    if (!user?.id) return;

    try {
      console.log('🔄 Loading weekly meal plan...');
      
      // Get or create meal plan for the week
      let { data: mealPlan, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDate)
        .single();

      if (planError && planError.code === 'PGRST116') {
        console.log('📝 Creating new meal plan for this week...');
        // Create new meal plan for this week
        const { data: newPlan, error: createError } = await supabase
          .from('meal_plans')
          .insert({
            user_id: user.id,
            week_start_date: weekStartDate,
            auto_generated: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        mealPlan = newPlan;
        console.log('✅ New meal plan created');
      } else if (planError) {
        throw planError;
      }

      console.log('✅ Meal plan loaded');

      // Load planned meals for this week
      const { data: plannedMeals, error: mealsError } = await supabase
        .from('planned_meals')
        .select(`
          *,
          generated_recipes (*)
        `)
        .eq('meal_plan_id', mealPlan.id)
        .order('meal_date', { ascending: true })
        .order('meal_type', { ascending: true });

      if (mealsError) {
        console.error('❌ Planned meals error:', mealsError);
        // Don't throw - empty meals is OK
      }

      console.log(`✅ Planned meals loaded: ${plannedMeals?.length || 0}`);

      // Generate week structure
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStartDate);
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;
      const allMealSlots: PlannedMeal[] = [];

      weekDays.forEach(date => {
        mealTypes.forEach(mealType => {
          const existingMeal = plannedMeals?.find(
            m => m.meal_date === date && m.meal_type === mealType
          );

          allMealSlots.push({
            id: existingMeal?.id || `${date}-${mealType}`,
            meal_date: date,
            meal_type: mealType,
            recipe: existingMeal?.generated_recipes || undefined,
            special_occasion: existingMeal?.special_occasion || false,
          });
        });
      });

      // Calculate costs and savings
      const totalCost = allMealSlots
        .filter(meal => meal.recipe?.estimated_cost)
        .reduce((sum, meal) => sum + (meal.recipe?.estimated_cost || 0), 0);

      const mealKitEquivalentCost = allMealSlots.filter(meal => meal.recipe).length * 9; // £9 per HelloFresh meal
      const savings = mealKitEquivalentCost - totalCost;

      setCurrentWeek({
        id: mealPlan.id,
        week_start_date: weekStartDate,
        meals: allMealSlots,
        total_cost: totalCost,
        savings_vs_meal_kits: savings,
      });

      console.log('✅ Weekly plan loaded successfully');

    } catch (error) {
      console.error('Error loading weekly plan:', error);
      Alert.alert('Error', 'Failed to load your weekly meal plan. Please try again.');
    }
  };

  // Generate recipe for a specific meal slot
  const generateMealRecipe = async (mealSlot: PlannedMeal) => {
    if (!userPreferences || !user?.id) return;

    const mealKey = `${mealSlot.meal_date}-${mealSlot.meal_type}`;
    setGeneratingMeal(mealKey);
    setCurrentGeneratingMeal(mealSlot);
    setShowGenerationModal(true);

    try {
      // Generate recipe using AI
      const generationResult = await IngredAI.generateRecipe({
        userId: user.id,
        preferences: userPreferences,
        mealType: mealSlot.meal_type,
        pantryItems: [], // Could be loaded from pantry_items table
      });

      // Check if generation was successful
      if (!generationResult.success) {
        // Close the generation modal first
        setShowGenerationModal(false);
        
        // Use the specific user message from AI integration if available
        const userMessage = generationResult.user_message || generationResult.error || 'Recipe generation failed';
        
        if (generationResult.cost_protected) {
          Alert.alert(
            'Daily Limit Reached',
            userMessage,
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          Alert.alert(
            'Generation Unavailable',
            userMessage,
            [{ text: 'Try Again', style: 'default' }]
          );
        }
        return;
      }

      if (!generationResult.recipe) {
        setShowGenerationModal(false);
        throw new Error('No recipe data received');
      }

      const generatedRecipe = generationResult.recipe;
      const savedRecipe = generatedRecipe;

      // Create or update planned meal
      const { error: mealError } = await supabase
        .from('planned_meals')
        .upsert({
          meal_plan_id: currentWeek?.id,
          recipe_id: savedRecipe.id,
          meal_date: mealSlot.meal_date,
          meal_type: mealSlot.meal_type,
          special_occasion: false,
        });

      if (mealError) throw mealError;

      // Close the generation modal
      setShowGenerationModal(false);

      // Refresh the week view
      await loadWeeklyPlan(currentWeek?.week_start_date || getCurrentWeekStart());

      // Show success with safety reminder
      Alert.alert(
        '✨ Recipe Generated!',
        `${generatedRecipe.title} is ready for your family!\n\n🛡️ Remember to verify ingredients for allergies as always.`,
        [{ text: 'Got it!', style: 'default' }]
      );

    } catch (error) {
      console.error('Error generating recipe:', error);
      
      // Close the generation modal
      setShowGenerationModal(false);
      
      // Check if this was a controlled failure from AI integration
      if (error instanceof Error && error.message.includes('generation failed')) {
        Alert.alert(
          'Recipe Generation Unavailable',
          'Our AI chef is taking a quick break. Please try again in a moment.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Generation Failed',
          'Unable to generate recipe right now. Please try again in a moment.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setGeneratingMeal(null);
      setCurrentGeneratingMeal(null);
    }
  };

  // Handle viewing recipe details
  const handleViewRecipe = (meal: PlannedMeal) => {
    if (!meal.recipe?.id) return;
    
    console.log('🔗 Navigating to recipe:', meal.recipe.id);
    
    // Navigate to recipe detail screen
    router.push(`/recipe/${meal.recipe.id}`);
  };

  // Handle closing generation modal (user cancellation)
  const handleCancelGeneration = () => {
    setShowGenerationModal(false);
    setGeneratingMeal(null);
    setCurrentGeneratingMeal(null);
    // Note: We can't actually cancel the AI generation once it's started
    // But we can hide the UI and let it complete in the background
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, [loadUserData]);

  // Initial load
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      dayName: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-GB', { month: 'short' }),
    };
  };

  // Get meal slots for a specific day
  const getMealsForDay = (date: string) => {
    return currentWeek?.meals.filter(meal => meal.meal_date === date) || [];
  };

  // Enhanced loading state with LoadingStates component
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingStates
          type="loading"
          title="Loading your meal plan..."
          subtitle="Setting up your weekly calendar"
          showProgress={false}
          size="large"
          style={styles.mainLoadingContainer}
        />
      </SafeAreaView>
    );
  }

  if (!userPreferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>🍽️ Welcome to Ingred!</Text>
          <Text style={styles.setupText}>
            Complete your family setup to start generating personalised meal plans.
          </Text>
          <TouchableOpacity style={styles.setupButton}>
            <Text style={styles.setupButtonText}>Complete Setup</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with AI Notice */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>This Week's Meal Plan</Text>
          <Text style={styles.headerSubtitle}>
            {userPreferences.household_size} people • {userPreferences.cooking_skill} cooking
          </Text>
          
          {/* AI Content Notice */}
          <View style={styles.aiNotice}>
            <Text style={styles.aiNoticeIcon}>🧠</Text>
            <Text style={styles.aiNoticeText}>
              AI-generated meal plans - please verify ingredients for your family's safety
            </Text>
            <TouchableOpacity style={styles.aiInfoButton}>
              <Text style={styles.aiInfoText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cost Summary */}
        {currentWeek && (
          <View style={styles.costSummary}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>This Week</Text>
              <Text style={styles.costValue}>£{currentWeek.total_cost.toFixed(2)}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>vs HelloFresh</Text>
              <Text style={styles.savingsValue}>-£{currentWeek.savings_vs_meal_kits.toFixed(2)}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Savings</Text>
              <Text style={styles.percentageValue}>
                {Math.round((currentWeek.savings_vs_meal_kits / (currentWeek.total_cost + currentWeek.savings_vs_meal_kits)) * 100)}%
              </Text>
            </View>
          </View>
        )}

        {/* Weekly Calendar */}
        {currentWeek && (
          <View style={styles.weeklyCalendar}>
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date(currentWeek.week_start_date);
              date.setDate(date.getDate() + i);
              const dateString = date.toISOString().split('T')[0];
              const dayMeals = getMealsForDay(dateString);
              const formattedDate = formatDate(dateString);

              return (
                <View key={dateString} style={styles.dayColumn}>
                  {/* Day Header */}
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{formattedDate.dayName}</Text>
                    <Text style={styles.dayNumber}>{formattedDate.dayNumber}</Text>
                    <Text style={styles.monthName}>{formattedDate.monthName}</Text>
                  </View>

                  {/* Meal Slots */}
                  {dayMeals.map((meal) => {
                    const mealKey = `${meal.meal_date}-${meal.meal_type}`;
                    const isGenerating = generatingMeal === mealKey;

                    return (
                      <TouchableOpacity
                        key={mealKey}
                        style={[
                          styles.mealSlot,
                          meal.recipe && styles.mealSlotFilled,
                          isGenerating && styles.mealSlotGenerating,
                        ]}
                        onPress={() => meal.recipe ? handleViewRecipe(meal) : generateMealRecipe(meal)}
                        disabled={isGenerating}
                        accessible={true}
                        accessibilityLabel={
                          meal.recipe 
                            ? `${meal.meal_type}: ${meal.recipe.title}`
                            : `Generate ${meal.meal_type} recipe`
                        }
                      >
                        {isGenerating ? (
                          <LoadingStates
                            type="ai-thinking"
                            title="Creating..."
                            subtitle="AI is working"
                            size="small"
                            animated={true}
                            style={styles.mealSlotLoading}
                          />
                        ) : meal.recipe ? (
                          <>
                            {/* Meal Type Badge */}
                            <View style={styles.mealTypeBadge}>
                              <Text style={styles.mealTypeText}>
                                {meal.meal_type === 'breakfast' ? '🌅' : 
                                 meal.meal_type === 'lunch' ? '☀️' : '🌙'}
                              </Text>
                            </View>

                            {/* Recipe Title */}
                            <Text style={styles.recipeTitle} numberOfLines={2}>
                              {meal.recipe.title}
                            </Text>

                            {/* Recipe Meta */}
                            <View style={styles.recipeMeta}>
                              <Text style={styles.metaText}>⏱️ {meal.recipe.total_time}m</Text>
                              <Text style={styles.metaText}>📊 {meal.recipe.difficulty}</Text>
                            </View>

                            {/* Allergen Warnings */}
                            {meal.recipe.detected_allergens && meal.recipe.detected_allergens.length > 0 && (
                              <View style={styles.allergenWarning}>
                                {meal.recipe.detected_allergens.slice(0, 3).map((allergen, index) => (
                                  <Text key={index} style={styles.allergenIcon}>
                                    {allergen.icon}
                                  </Text>
                                ))}
                                {meal.recipe.detected_allergens.length > 3 && (
                                  <Text style={styles.allergenMore}>+{meal.recipe.detected_allergens.length - 3}</Text>
                                )}
                              </View>
                            )}

                            {/* AI Indicator */}
                            {meal.recipe.ai_generated && (
                              <View style={styles.aiIndicator}>
                                <Text style={styles.aiIndicatorText}>🧠 AI</Text>
                              </View>
                            )}

                            {/* Safety Score */}
                            <View style={[
                              styles.safetyScore,
                              meal.recipe.safety_score >= 90 ? styles.safetyScoreHigh :
                              meal.recipe.safety_score >= 70 ? styles.safetyScoreMedium :
                              styles.safetyScoreLow
                            ]}>
                              <Text style={styles.safetyScoreText}>
                                {meal.recipe.safety_score}%
                              </Text>
                            </View>
                          </>
                        ) : (
                          <View style={styles.emptyMealSlot}>
                            <Text style={styles.mealTypeEmoji}>
                              {meal.meal_type === 'breakfast' ? '🌅' : 
                               meal.meal_type === 'lunch' ? '☀️' : '🌙'}
                            </Text>
                            <Text style={styles.emptyMealText}>Generate {meal.meal_type}</Text>
                            <Text style={styles.generateHint}>Tap to create</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        {/* Family Safety Notice */}
        {userPreferences.family_members && userPreferences.family_members.length > 0 ? (
          <View style={styles.familySafetyNotice}>
            <Text style={styles.familySafetyTitle}>👨‍👩‍👧‍👦 Family Safety Coordination</Text>
            <Text style={styles.familySafetyText}>
              Recipes consider {userPreferences.family_members.length} family member
              {userPreferences.family_members.length !== 1 ? 's' : ''} with individual dietary needs.
              Always verify ingredients for everyone's safety.
            </Text>
            <View style={styles.familyMembersList}>
              {userPreferences.family_members.map((member, index) => (
                <View key={member.id} style={styles.familyMemberItem}>
                  <Text style={styles.familyMemberName}>{member.name}</Text>
                  {member.allergies && member.allergies.length > 0 && (
                    <Text style={styles.familyMemberAllergies}>
                      🚨 {member.allergies.join(', ')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.familySafetyNotice}>
            <Text style={styles.familySafetyTitle}>👤 Individual Meal Planning</Text>
            <Text style={styles.familySafetyText}>
              Recipes are generated for {userPreferences.household_size} people with {userPreferences.cooking_skill} cooking skills.
              Always verify ingredients for allergies and dietary restrictions.
            </Text>
          </View>
        )}

        {/* Legal Compliance Footer */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            📋 Ingred uses AI to create meal suggestions based on your family's preferences.
            Always verify ingredients for allergies and dietary restrictions.
            For complete legal information, visit Settings › Legal Information.
          </Text>
        </View>
      </ScrollView>

      {/* Recipe Generation Modal */}
      <Modal
        visible={showGenerationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelGeneration}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LoadingStates
              type="recipe-generation"
              title={`Creating ${currentGeneratingMeal?.meal_type} recipe`}
              subtitle="AI is crafting the perfect meal for your family"
              showProgress={true}
              size="large"
              animated={true}
            />
            
            {/* Cancel button */}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelGeneration}
              accessible={true}
              accessibilityLabel="Cancel recipe generation"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  
  // Enhanced loading state
  mainLoadingContainer: {
    flex: 1,
    margin: 20,
  },
  
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  setupText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  setupButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiNoticeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  aiNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#5B21B6',
    lineHeight: 18,
  },
  aiInfoButton: {
    marginLeft: 8,
  },
  aiInfoText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  costSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  costItem: {
    flex: 1,
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  costValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  savingsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  percentageValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  weeklyCalendar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 2,
  },
  monthName: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  mealSlot: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  mealSlotFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mealSlotGenerating: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  
  // Enhanced meal slot loading
  mealSlotLoading: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 4,
  },
  
  mealTypeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeText: {
    fontSize: 12,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 32,
    marginBottom: 8,
    lineHeight: 16,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
  },
  allergenWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  allergenIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  allergenMore: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
  aiIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EBE9FE',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  aiIndicatorText: {
    fontSize: 8,
    color: '#7C3AED',
    fontWeight: '600',
  },
  safetyScore: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
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
    fontSize: 8,
    fontWeight: '600',
  },
  emptyMealSlot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  emptyMealText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  generateHint: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  familySafetyNotice: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  familySafetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  familySafetyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  familyMembersList: {
    gap: 8,
  },
  familyMemberItem: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  familyMemberName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  familyMemberAllergies: {
    fontSize: 11,
    color: '#DC2626',
  },
  legalFooter: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  legalText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'center',
  },

  // Recipe Generation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});