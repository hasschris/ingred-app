import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import MealSlot from './MealSlot';

// Types for the weekly calendar
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

interface WeeklyPlan {
  id: string;
  week_start_date: string;
  meals: PlannedMeal[];
  total_cost: number;
  savings_vs_meal_kits: number;
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
  family_members?: FamilyMember[];
}

interface WeeklyCalendarProps {
  weeklyPlan: WeeklyPlan;
  userPreferences: UserPreferences;
  generatingMealKey: string | null;
  onGenerateRecipe: (meal: PlannedMeal) => void;
  onViewRecipe: (meal: PlannedMeal) => void;
  onRegenerateRecipe?: (meal: PlannedMeal) => void;
  onNavigateWeek?: (direction: 'previous' | 'next') => void;
  showWeekNavigation?: boolean;
}

const { width } = Dimensions.get('window');
const CALENDAR_PADDING = 16;
const DAY_COLUMN_WIDTH = (width - (CALENDAR_PADDING * 2)) / 7;

export default function WeeklyCalendar({
  weeklyPlan,
  userPreferences,
  generatingMealKey,
  onGenerateRecipe,
  onViewRecipe,
  onRegenerateRecipe,
  onNavigateWeek,
  showWeekNavigation = false,
}: WeeklyCalendarProps) {

  // Generate week days from start date
  const getWeekDays = () => {
    const days = [];
    const startDate = new Date(weeklyPlan.week_start_date);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-GB', { month: 'short' }),
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays();

  // Get meals for a specific day
  const getMealsForDay = (date: string): PlannedMeal[] => {
    const dayMeals = weeklyPlan.meals.filter(meal => meal.meal_date === date);
    
    // Ensure we have all three meal types, create empty ones if missing
    const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];
    const completeMeals: PlannedMeal[] = [];
    
    mealTypes.forEach(mealType => {
      const existingMeal = dayMeals.find(meal => meal.meal_type === mealType);
      if (existingMeal) {
        completeMeals.push(existingMeal);
      } else {
        completeMeals.push({
          id: `${date}-${mealType}`,
          meal_date: date,
          meal_type: mealType,
          special_occasion: false,
        });
      }
    });
    
    return completeMeals;
  };

  // Get current week description
  const getWeekDescription = () => {
    const startDate = new Date(weeklyPlan.week_start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startFormatted = startDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    });
    const endFormatted = endDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  // Calculate week statistics
  const getWeekStats = () => {
    const totalMeals = weeklyPlan.meals.filter(meal => meal.recipe).length;
    const totalPlannedSlots = 21; // 7 days × 3 meals
    const completionPercentage = Math.round((totalMeals / totalPlannedSlots) * 100);
    
    const avgSafetyScore = weeklyPlan.meals
      .filter(meal => meal.recipe?.safety_score)
      .reduce((sum, meal) => sum + (meal.recipe!.safety_score || 0), 0) / totalMeals || 0;
    
    const allergenCount = weeklyPlan.meals
      .filter(meal => meal.recipe?.detected_allergens?.length)
      .reduce((sum, meal) => sum + (meal.recipe!.detected_allergens?.length || 0), 0);
    
    return {
      totalMeals,
      completionPercentage,
      avgSafetyScore: Math.round(avgSafetyScore),
      allergenCount,
    };
  };

  const weekStats = getWeekStats();

  // Handle week navigation
  const handleWeekNavigation = (direction: 'previous' | 'next') => {
    if (onNavigateWeek) {
      onNavigateWeek(direction);
    } else {
      Alert.alert(
        'Week Navigation',
        `Navigate to ${direction} week - feature coming soon!`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Week Header */}
      <View style={styles.weekHeader}>
        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>Weekly Meal Plan</Text>
          <Text style={styles.weekSubtitle}>{getWeekDescription()}</Text>
        </View>
        
        {/* Week Navigation */}
        {showWeekNavigation && (
          <View style={styles.weekNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleWeekNavigation('previous')}
              accessible={true}
              accessibilityLabel="Previous week"
              accessibilityRole="button"
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleWeekNavigation('next')}
              accessible={true}
              accessibilityLabel="Next week"
              accessibilityRole="button"
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Week Statistics */}
      <View style={styles.weekStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{weekStats.completionPercentage}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{weekStats.totalMeals}/21</Text>
          <Text style={styles.statLabel}>Meals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{weekStats.avgSafetyScore}%</Text>
          <Text style={styles.statLabel}>Safety</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>£{weeklyPlan.total_cost.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Cost</Text>
        </View>
      </View>

      {/* Family Context Notice */}
      {userPreferences.family_members && userPreferences.family_members.length > 0 && (
        <View style={styles.familyContext}>
          <Text style={styles.familyContextTitle}>
            👨‍👩‍👧‍👦 Planning for {userPreferences.household_size} people
          </Text>
          <Text style={styles.familyContextSubtitle}>
            {userPreferences.family_members.length} family member{userPreferences.family_members.length !== 1 ? 's' : ''} with individual needs
          </Text>
        </View>
      )}

      {/* Calendar Grid */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarScroll}
        style={styles.calendarContainer}
      >
        <View style={styles.calendarGrid}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {weekDays.map((day) => (
              <View key={day.date} style={[styles.dayHeader, { width: DAY_COLUMN_WIDTH }]}>
                <Text style={[
                  styles.dayName,
                  day.isToday && styles.dayNameToday,
                  day.isWeekend && styles.dayNameWeekend
                ]}>
                  {day.dayName}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  day.isToday && styles.dayNumberToday,
                  day.isWeekend && styles.dayNumberWeekend
                ]}>
                  {day.dayNumber}
                </Text>
                <Text style={[
                  styles.monthName,
                  day.isToday && styles.monthNameToday
                ]}>
                  {day.monthName}
                </Text>
              </View>
            ))}
          </View>

          {/* Meal Slots Grid */}
          <View style={styles.mealsGrid}>
            {weekDays.map((day) => {
              const dayMeals = getMealsForDay(day.date);
              
              return (
                <View key={day.date} style={[styles.dayColumn, { width: DAY_COLUMN_WIDTH }]}>
                  {dayMeals.map((meal) => {
                    const mealKey = `${meal.meal_date}-${meal.meal_type}`;
                    const isGenerating = generatingMealKey === mealKey;
                    
                    return (
                      <MealSlot
                        key={mealKey}
                        meal={meal}
                        isGenerating={isGenerating}
                        onGenerateRecipe={onGenerateRecipe}
                        onViewRecipe={onViewRecipe}
                        onRegenerateRecipe={onRegenerateRecipe}
                        style={styles.mealSlotSpacing}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* AI Content Notice */}
      <View style={styles.aiNotice}>
        <Text style={styles.aiNoticeIcon}>🧠</Text>
        <Text style={styles.aiNoticeText}>
          AI-generated meal plans with comprehensive safety checking
        </Text>
        <TouchableOpacity 
          style={styles.aiNoticeButton}
          onPress={() => Alert.alert(
            'AI Safety Information',
            'Ingred uses artificial intelligence to create personalized meal plans for your family. All recipes include safety warnings and allergen detection, but always verify ingredients for your family\'s specific needs.',
            [{ text: 'Understood', style: 'default' }]
          )}
          accessible={true}
          accessibilityLabel="Learn about AI-generated content safety"
        >
          <Text style={styles.aiNoticeButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Reminder */}
      {weekStats.allergenCount > 0 && (
        <View style={styles.safetyReminder}>
          <Text style={styles.safetyReminderIcon}>🛡️</Text>
          <View style={styles.safetyReminderContent}>
            <Text style={styles.safetyReminderTitle}>Safety Check Required</Text>
            <Text style={styles.safetyReminderText}>
              {weekStats.allergenCount} potential allergen{weekStats.allergenCount !== 1 ? 's' : ''} detected this week. 
              Please verify all ingredients for your family's safety.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  
  // Week header styles
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  weekSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  weekNavigation: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    backgroundColor: '#F3F4F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
  },
  
  // Week statistics
  weekStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Family context
  familyContext: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  familyContextTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 2,
  },
  familyContextSubtitle: {
    fontSize: 12,
    color: '#15803D',
  },
  
  // Calendar grid
  calendarContainer: {
    backgroundColor: '#FAFAFA',
  },
  calendarScroll: {
    paddingHorizontal: CALENDAR_PADDING,
  },
  calendarGrid: {
    minWidth: width - (CALENDAR_PADDING * 2),
  },
  
  // Day headers
  dayHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 12,
  },
  dayHeader: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dayNameToday: {
    color: '#8B5CF6',
  },
  dayNameWeekend: {
    color: '#DC2626',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  dayNumberToday: {
    color: '#8B5CF6',
  },
  dayNumberWeekend: {
    color: '#DC2626',
  },
  monthName: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  monthNameToday: {
    color: '#A78BFA',
  },
  
  // Meals grid
  mealsGrid: {
    flexDirection: 'row',
  },
  dayColumn: {
    paddingHorizontal: 4,
  },
  mealSlotSpacing: {
    marginBottom: 8,
  },
  
  // AI content notice
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDD6FE',
  },
  aiNoticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  aiNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#5B21B6',
    lineHeight: 16,
  },
  aiNoticeButton: {
    marginLeft: 8,
  },
  aiNoticeButtonText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  
  // Safety reminder
  safetyReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  safetyReminderIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  safetyReminderContent: {
    flex: 1,
  },
  safetyReminderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 2,
  },
  safetyReminderText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 16,
  },
});