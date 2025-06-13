// lib/constants.ts - Shared constants and configuration for Ingred

// Meal planning constants
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch', 
  DINNER: 'dinner',
  SNACK: 'snack'
} as const

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const

// AI generation stages for loading states
export const AI_GENERATION_STAGES = [
  {
    id: 'analyzing',
    title: 'Understanding your family',
    description: 'Analyzing household preferences and dietary needs',
    duration: 2000
  },
  {
    id: 'searching',
    title: 'Finding perfect ingredients',
    description: 'Selecting ingredients that work for everyone',
    duration: 3000
  },
  {
    id: 'creating',
    title: 'Crafting your recipe',
    description: 'Generating instructions and cooking steps',
    duration: 4000
  },
  {
    id: 'safety_check',
    title: 'Safety verification',
    description: 'Checking for allergens and dietary compliance',
    duration: 2000
  },
  {
    id: 'finalizing',
    title: 'Adding finishing touches',
    description: 'Optimizing for your family and preferences',
    duration: 1000
  }
] as const

// Safety and allergen constants
export const ALLERGEN_SEVERITY_LEVELS = {
  MILD: 'mild',
  MODERATE: 'moderate', 
  SEVERE: 'severe',
  LIFE_THREATENING: 'life_threatening'
} as const

export const SAFETY_SCORE_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 85,
  WARNING: 70,
  CRITICAL: 50
} as const

export const COMMON_ALLERGENS = [
  {
    key: 'dairy',
    name: 'Dairy',
    icon: '🥛',
    commonNames: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein', 'lactose'],
    color: '#3B82F6'
  },
  {
    key: 'nuts',
    name: 'Nuts',
    icon: '🥜', 
    commonNames: ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'macadamia'],
    color: '#D97706'
  },
  {
    key: 'tree_nuts',
    name: 'Tree Nuts',
    icon: '🌰',
    commonNames: ['almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'brazil nut', 'pine nut'],
    color: '#92400E'
  },
  {
    key: 'gluten',
    name: 'Gluten',
    icon: '🌾',
    commonNames: ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'malt', 'bulgur'],
    color: '#CA8A04'
  },
  {
    key: 'shellfish',
    name: 'Shellfish',
    icon: '🦐',
    commonNames: ['shrimp', 'crab', 'lobster', 'prawn', 'crawfish', 'langostino'],
    color: '#DC2626'
  },
  {
    key: 'fish',
    name: 'Fish',
    icon: '🐟',
    commonNames: ['salmon', 'tuna', 'cod', 'halibut', 'anchovy', 'sardine'],
    color: '#0891B2'
  },
  {
    key: 'eggs',
    name: 'Eggs',
    icon: '🥚',
    commonNames: ['egg', 'eggs', 'albumin', 'mayonnaise'],
    color: '#EAB308'
  },
  {
    key: 'soy',
    name: 'Soy',
    icon: '🫘',
    commonNames: ['soy', 'tofu', 'tempeh', 'edamame', 'miso', 'tamari', 'lecithin'],
    color: '#16A34A'
  }
] as const

// Cost analysis constants
export const COST_COMPARISONS = {
  HELLOFRESH_PER_SERVING: 10.00,
  GUSTO_PER_SERVING: 9.50,
  HOME_COOKING_PER_SERVING: 3.00,
  INGRED_TARGET_COST: 0.000534,
  WEEKLY_MEALS_AVERAGE: 21
} as const

// User preference constants
export const COOKING_SKILLS = [
  { value: 'beginner', label: 'Beginner', description: 'Simple recipes with basic techniques' },
  { value: 'intermediate', label: 'Intermediate', description: 'More complex recipes and techniques' },
  { value: 'advanced', label: 'Advanced', description: 'Complex recipes and professional techniques' }
] as const

export const BUDGET_LEVELS = [
  { value: 'budget', label: 'Budget-Friendly', description: 'Focus on affordable ingredients' },
  { value: 'moderate', label: 'Moderate', description: 'Balance of quality and cost' },
  { value: 'premium', label: 'Premium', description: 'High-quality, specialty ingredients' }
] as const

export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan', 
  'Pescatarian',
  'Dairy-Free',
  'Gluten-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Mediterranean',
  'Low-Sodium',
  'Diabetic-Friendly'
] as const

export const CUISINE_PREFERENCES = [
  'British',
  'Italian',
  'Mediterranean', 
  'Asian',
  'Indian',
  'Mexican',
  'Thai',
  'Chinese',
  'French',
  'Greek',
  'Middle Eastern',
  'American',
  'Spanish',
  'Japanese'
] as const

// AI disclaimer and legal constants
export const AI_DISCLAIMERS = {
  RECIPE_HEADER: '🧠 AI-generated recipe - please verify ingredients for your family\'s safety',
  ALLERGEN_WARNING: '⚠️ Always check ingredients for allergies - AI suggestions may not catch everything',
  NUTRITION_DISCLAIMER: 'Nutritional information is estimated - consult healthcare providers for medical dietary advice',
  GENERAL_AI_NOTICE: 'Ingred uses AI to create meal suggestions based on your preferences',
  COOKING_SAFETY: 'Follow proper food safety guidelines when preparing and storing meals',
  MEDICAL_ADVICE: 'This is not medical advice - consult healthcare providers for specific dietary requirements'
} as const

export const SAFETY_MESSAGES = {
  FAMILY_SAFETY_REMINDER: 'Remember to check all ingredients against your family members\' allergies and dietary needs',
  EMERGENCY_GUIDANCE: 'For severe allergic reactions, contact emergency services immediately',
  VERIFICATION_REQUIRED: 'Please verify all ingredients and cooking instructions for safety',
  AI_CONTENT_NOTICE: 'This content was generated by AI and should be verified before use'
} as const

// App configuration constants
export const APP_CONFIG = {
  GENERATION_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_FAMILY_MEMBERS: 8,
  MIN_AGE_REQUIREMENT: 16,
  DEFAULT_SERVINGS: 4,
  DEFAULT_PREP_TIME: 15,
  DEFAULT_COOK_TIME: 30
} as const

// Rate limiting and subscription tiers
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    daily_recipes: 2,
    weekly_meal_plans: 1,
    family_members: 4,
    advanced_features: false
  },
  PREMIUM: {
    daily_recipes: Infinity,
    weekly_meal_plans: Infinity, 
    family_members: 8,
    advanced_features: true
  }
} as const

// Animation and timing constants
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  LOADING: 1200
} as const

// Color constants for consistency
export const COLORS = {
  PRIMARY: '#8B5CF6',
  SECONDARY: '#F59E0B',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B', 
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  
  // Safety colors
  SAFETY_EXCELLENT: '#10B981',
  SAFETY_GOOD: '#84CC16',
  SAFETY_WARNING: '#F59E0B',
  SAFETY_CRITICAL: '#EF4444',
  
  // Allergen severity colors
  ALLERGEN_MILD: '#F59E0B',
  ALLERGEN_MODERATE: '#F59E0B',
  ALLERGEN_SEVERE: '#EF4444',
  ALLERGEN_LIFE_THREATENING: '#DC2626',
  
  // Background colors
  BACKGROUND_PRIMARY: '#FFFFFF',
  BACKGROUND_SECONDARY: '#F9FAFB',
  BACKGROUND_ACCENT: '#F3F4F6',
  
  // Text colors
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6B7280',
  TEXT_TERTIARY: '#9CA3AF'
} as const

// Spacing constants (8-point grid system)
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48
} as const

// Typography constants
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 30
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  AI_GENERATION_FAILED: 'Recipe generation failed. Please try again.',
  RATE_LIMIT_EXCEEDED: 'Daily limit reached. Upgrade to premium for unlimited recipes.',
  INVALID_INPUT: 'Please check your input and try again.',
  SAVE_FAILED: 'Unable to save meal plan. Please try again.',
  LOAD_FAILED: 'Unable to load meal plan. Please refresh and try again.',
  ALLERGEN_DETECTION_FAILED: 'Unable to detect allergens. Please verify ingredients manually.',
  FAMILY_SETUP_INCOMPLETE: 'Please complete family setup to continue.',
  AGE_VERIFICATION_REQUIRED: 'You must be 16 or older to use Ingred.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  RECIPE_GENERATED: 'Perfect! I\'ve created a meal your family will love 🎉',
  MEAL_PLAN_SAVED: 'Your meal plan has been saved successfully!',
  FAMILY_SETUP_COMPLETE: 'Family setup complete! Ready to start meal planning.',
  PREFERENCES_UPDATED: 'Your preferences have been updated.',
  MEAL_DELETED: 'Meal removed from plan.',
  LEGAL_CONSENT_RECORDED: 'Your privacy preferences are saved and protected.'
} as const

// Default recipe fallbacks for AI failures
export const FALLBACK_RECIPES = [
  {
    title: 'Simple Pasta with Vegetables',
    description: 'A quick, family-friendly meal that works for most dietary needs',
    ingredients: ['pasta', 'olive oil', 'garlic', 'seasonal vegetables', 'salt', 'pepper'],
    instructions: [
      'Cook pasta according to package directions',
      'Sauté garlic in olive oil',
      'Add vegetables and cook until tender', 
      'Mix with pasta and season to taste'
    ],
    prep_time: 10,
    cook_time: 15,
    total_time: 25,
    servings: 4,
    difficulty: 'easy' as const,
    safety_notes: 'Check pasta ingredients for gluten if needed. Verify vegetable choices for allergies.'
  },
  {
    title: 'Rice and Bean Bowl',
    description: 'Nutritious, customizable meal suitable for various dietary restrictions',
    ingredients: ['rice', 'beans', 'vegetables', 'herbs', 'olive oil', 'lemon'],
    instructions: [
      'Cook rice according to package directions',
      'Heat beans (canned or pre-cooked)',
      'Steam or sauté vegetables',
      'Combine in bowls and season with herbs, oil, and lemon'
    ],
    prep_time: 5,
    cook_time: 20,
    total_time: 25,
    servings: 4,
    difficulty: 'easy' as const,
    safety_notes: 'Naturally gluten-free and vegan. Check bean preparation for allergens.'
  }
] as const

// Export types for TypeScript
export type MealType = typeof MEAL_TYPES[keyof typeof MEAL_TYPES]
export type AllergenSeverity = typeof ALLERGEN_SEVERITY_LEVELS[keyof typeof ALLERGEN_SEVERITY_LEVELS]
export type CookingSkill = typeof COOKING_SKILLS[number]['value']
export type BudgetLevel = typeof BUDGET_LEVELS[number]['value']
export type DietaryRestriction = typeof DIETARY_RESTRICTIONS[number]
export type CuisinePreference = typeof CUISINE_PREFERENCES[number]