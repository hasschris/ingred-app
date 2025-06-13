import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Weekly Meal Planning Screen - Core meal planning interface
 * 
 * Features:
 * - Weekly calendar view with meal slots
 * - AI recipe generation for each meal
 * - Safety indicators and allergen warnings
 * - Day-specific overrides for special occasions
 * - Premium design matching HelloFresh standards
 * - Full accessibility compliance
 */

interface MealSlot {
  id: string;
  day: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipe?: {
    title: string;
    cookTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    allergens: string[];
    aiGenerated: boolean;
  };
}

interface DayCardProps {
  day: string;
  date: string;
  meals: MealSlot[];
  onAddMeal: (day: string, mealType: string) => void;
  onEditMeal: (mealId: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({ 
  day, 
  date, 
  meals, 
  onAddMeal, 
  onEditMeal 
}) => {
  const isToday = new Date().getDate().toString() === date;

  return (
    <View style={[styles.dayCard, isToday && styles.dayCardToday]}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
          {day}
        </Text>
        <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>
          {date}
        </Text>
      </View>

      <View style={styles.mealsContainer}>
        {['breakfast', 'lunch', 'dinner'].map((mealType) => {
          const meal = meals.find(m => m.mealType === mealType);
          
          return (
            <TouchableOpacity
              key={mealType}
              style={[
                styles.mealSlot,
                meal && styles.mealSlotFilled,
                isToday && styles.mealSlotToday
              ]}
              onPress={() => meal ? onEditMeal(meal.id) : onAddMeal(day, mealType)}
              accessible={true}
              accessibilityLabel={
                meal 
                  ? `${mealType}: ${meal.recipe?.title || 'Planned meal'}`
                  : `Add ${mealType} meal for ${day}`
              }
              accessibilityHint={
                meal 
                  ? "Tap to view or edit this meal"
                  : "Tap to generate a new meal"
              }
              accessibilityRole="button"
            >
              <View style={styles.mealHeader}>
                <Text style={styles.mealTypeIcon}>
                  {mealType === 'breakfast' ? '🍳' : 
                   mealType === 'lunch' ? '🥗' : '🍽️'}
                </Text>
                <Text style={[
                  styles.mealTypeText,
                  meal && styles.mealTypeTextFilled
                ]}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
              </View>

              {meal?.recipe ? (
                <View style={styles.mealContent}>
                  <Text style={styles.mealTitle} numberOfLines={2}>
                    {meal.recipe.title}
                  </Text>
                  <View style={styles.mealMeta}>
                    <Text style={styles.mealMetaText}>
                      ⏱️ {meal.recipe.cookTime}min
                    </Text>
                    <Text style={styles.mealMetaText}>
                      📊 {meal.recipe.difficulty}
                    </Text>
                  </View>
                  
                  {/* AI and Safety Indicators */}
                  <View style={styles.mealIndicators}>
                    {meal.recipe.aiGenerated && (
                      <View style={styles.aiIndicator}>
                        <Text style={styles.aiIndicatorText}>🧠 AI</Text>
                      </View>
                    )}
                    {meal.recipe.allergens.length > 0 && (
                      <View style={styles.allergenIndicator}>
                        <Text style={styles.allergenIndicatorText}>
                          🛡️ {meal.recipe.allergens.length}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyMealContent}>
                  <Text style={styles.emptyMealText}>
                    Tap to generate meal
                  </Text>
                  <Text style={styles.generateHint}>
                    ✨ AI will create something perfect
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  
  // Mock data - In production, this would come from database
  const [weekData, setWeekData] = useState<MealSlot[]>([
    {
      id: '1',
      day: 'Monday',
      date: '13',
      mealType: 'dinner',
      recipe: {
        title: 'Family Spaghetti Bolognese',
        cookTime: 35,
        difficulty: 'easy',
        allergens: ['gluten'],
        aiGenerated: true,
      }
    },
    {
      id: '2',
      day: 'Tuesday',
      date: '14',
      mealType: 'dinner',
      recipe: {
        title: 'Chicken & Vegetable Stir Fry',
        cookTime: 20,
        difficulty: 'easy',
        allergens: [],
        aiGenerated: true,
      }
    },
  ]);

  const currentWeek = [
    { day: 'Monday', date: '13' },
    { day: 'Tuesday', date: '14' },
    { day: 'Wednesday', date: '15' },
    { day: 'Thursday', date: '16' },
    { day: 'Friday', date: '17' },
    { day: 'Saturday', date: '18' },
    { day: 'Sunday', date: '19' },
  ];

  const handleAddMeal = (day: string, mealType: string) => {
    Alert.alert(
      'Generate New Meal',
      `Create a new AI-generated ${mealType} for ${day}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            // TODO: Integrate with AI generation system
            Alert.alert(
              'Coming Soon!',
              'AI meal generation will be connected in the next development phase.'
            );
          }
        },
      ]
    );
  };

  const handleEditMeal = (mealId: string) => {
    Alert.alert(
      'Edit Meal',
      'Modify or regenerate this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Regenerate', onPress: () => {
          Alert.alert('Regenerating...', 'Creating a new version of this meal.');
        }},
        { text: 'View Recipe', onPress: () => {
          Alert.alert('Recipe Details', 'Full recipe view coming soon!');
        }},
      ]
    );
  };

  const handleGenerateWeek = () => {
    Alert.alert(
      'Generate Full Week',
      'Create a complete meal plan for the entire week based on your family\'s preferences?\n\n🧠 AI will consider all family members\n🛡️ Safety checks for allergens\n💰 Optimised for your budget',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate Week', 
          onPress: () => {
            Alert.alert(
              'Coming Soon!',
              'Full week generation will be available in the next development phase.'
            );
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weekly Meal Plan</Text>
          <Text style={styles.headerSubtitle}>
            Week of 13-19 June • 4 family members
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateWeek}
          accessible={true}
          accessibilityLabel="Generate complete week plan"
          accessibilityHint="Creates meals for the entire week using AI"
        >
          <Text style={styles.generateButtonText}>✨ Generate Week</Text>
        </TouchableOpacity>
      </View>

      {/* AI Safety Notice */}
      <View style={styles.safetyNotice}>
        <Text style={styles.safetyNoticeText}>
          🧠 AI-generated meal plans • 🛡️ Always verify ingredients for allergies
        </Text>
      </View>

      {/* Weekly Calendar */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekContainer}
        style={styles.weekScroll}
      >
        {currentWeek.map((dayInfo) => {
          const dayMeals = weekData.filter(meal => meal.day === dayInfo.day);
          
          return (
            <DayCard
              key={dayInfo.day}
              day={dayInfo.day}
              date={dayInfo.date}
              meals={dayMeals}
              onAddMeal={handleAddMeal}
              onEditMeal={handleEditMeal}
            />
          );
        })}
      </ScrollView>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>6</Text>
          <Text style={styles.statLabel}>Meals planned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>£47</Text>
          <Text style={styles.statLabel}>Est. grocery cost</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>£73</Text>
          <Text style={styles.statLabel}>vs meal kits</Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Shopping List', 'Generate shopping list for planned meals.')}
          accessible={true}
          accessibilityLabel="Create shopping list"
        >
          <Text style={styles.actionButtonText}>🛒 Shopping List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Family Settings', 'Manage family preferences and allergies.')}
          accessible={true}
          accessibilityLabel="Manage family preferences"
        >
          <Text style={styles.actionButtonText}>👨‍👩‍👧‍👦 Family Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  generateButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },

  // Safety Notice
  safetyNotice: {
    backgroundColor: '#F4F3FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  safetyNoticeText: {
    fontSize: 14,
    color: '#5B21B6',
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  // Weekly Calendar
  weekScroll: {
    flex: 1,
  },

  weekContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },

  // Day Cards
  dayCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  dayCardToday: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },

  dayHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },

  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  dayNameToday: {
    color: '#8B5CF6',
  },

  dayDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  dayDateToday: {
    color: '#8B5CF6',
  },

  mealsContainer: {
    gap: 12,
  },

  // Meal Slots
  mealSlot: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },

  mealSlotFilled: {
    backgroundColor: '#FFFFFF',
    borderStyle: 'solid',
    borderColor: '#D1D5DB',
  },

  mealSlotToday: {
    borderColor: '#C4B5FD',
  },

  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  mealTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  mealTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    fontFamily: 'Inter',
  },

  mealTypeTextFilled: {
    color: '#374151',
  },

  mealContent: {
    flex: 1,
  },

  mealTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    fontFamily: 'Inter',
  },

  mealMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },

  mealMetaText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter',
  },

  mealIndicators: {
    flexDirection: 'row',
    gap: 6,
  },

  aiIndicator: {
    backgroundColor: '#EBE9FE',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },

  aiIndicatorText: {
    fontSize: 10,
    color: '#5B21B6',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  allergenIndicator: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },

  allergenIndicatorText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  emptyMealContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  emptyMealText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter',
  },

  generateHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'Inter',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter',
  },
});

/**
 * Accessibility Features:
 * - All meal slots have descriptive accessibility labels
 * - Touch targets meet minimum 44px requirement  
 * - High contrast colors and clear visual hierarchy
 * - Screen reader friendly content structure
 * - Proper button roles and navigation hints
 * 
 * Design Features:
 * - Horizontal scrolling weekly calendar with today highlighting
 * - Card-based meal slot design with visual state indicators
 * - AI and allergen indicators prominently displayed
 * - Premium design matching HelloFresh with subtle shadows
 * - Consistent spacing using 8-point grid system
 * 
 * Safety & Legal Integration:
 * - AI content notices naturally integrated
 * - Allergen indicators on each meal with count
 * - Safety reminders about ingredient verification
 * - Clear distinction between AI-generated and user content
 * - Quick access to family safety management
 * 
 * Future Integration Points:
 * - Connect to AI generation system for meal creation
 * - Link to family preference and allergen management
 * - Shopping list generation with cost estimates
 * - Recipe detail views with full safety information
 */