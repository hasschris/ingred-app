import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Supabase Client Configuration for Ingred
 * 
 * This handles all database operations with:
 * - Enterprise-grade security with Row Level Security (RLS)
 * - GDPR-compliant data handling for UK families
 * - Real-time capabilities for family collaboration
 * - Enhanced authentication with legal compliance
 * - EU data residency for privacy protection
 */

// Environment configuration
// TODO: These will be set up when we create the Supabase project
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client with enhanced security and mobile optimization
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for secure token storage on mobile
    storage: AsyncStorage,
    // Automatically refresh tokens for seamless user experience
    autoRefreshToken: true,
    // Persist sessions across app restarts
    persistSession: true,
    // Disable session detection in URL (mobile app)
    detectSessionInUrl: false,
    // Use PKCE flow for enhanced security on mobile
    flowType: 'pkce'
  },
  realtime: {
    params: {
      // Rate limiting for real-time features (family collaboration)
      eventsPerSecond: 10
    }
  }
})

/**
 * Database Type Definitions
 * 
 * These TypeScript interfaces ensure type safety across the app
 * and match the sophisticated database schema from the implementation plan
 */

// Core user and authentication types
export interface UserProfile {
  id: string
  email: string
  created_at: string
  subscription_tier: 'free' | 'premium'
  onboarding_completed: boolean
  legal_consent_recorded: boolean
  privacy_settings: Record<string, any>
  last_active_at?: string
  account_status: 'active' | 'suspended' | 'deleted'
}

// Family and household management
export interface Household {
  id: string
  created_by: string
  name: string
  created_at: string
  household_size: number
  family_complexity_level: 'simple' | 'moderate' | 'complex'
}

export interface UserPreferences {
  id: string
  user_id: string
  // Mandatory setup (8 core questions)
  household_size: number
  cooking_skill: 'beginner' | 'intermediate' | 'advanced'
  budget_level: 'budget' | 'moderate' | 'premium'
  cooking_time_minutes: number
  dietary_restrictions: string[]
  allergies: string[]
  disliked_ingredients: string[]
  meals_per_week: number
  // Optional deep personalization (50+ options)
  cuisine_preferences?: string[]
  cooking_methods?: string[]
  flavor_profiles?: Record<string, any>
  kitchen_equipment?: string[]
  nutritional_goals?: Record<string, any>
  meal_timing_preferences?: Record<string, any>
  shopping_preferences?: Record<string, any>
  updated_at: string
}

export interface FamilyMember {
  id: string
  user_id: string
  name: string
  age_group: 'child' | 'teen' | 'adult' | 'senior'
  dietary_restrictions: string[]
  allergies: string[]
  allergy_severity: string[]
  food_preferences: Record<string, any>
  dislikes: string[]
  special_needs?: string
  medical_dietary_requirements?: string
  created_at: string
}

// AI-generated recipe types with safety features
export interface GeneratedRecipe {
  id: string
  user_id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prep_time: number
  cook_time: number
  total_time: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  // AI and safety features
  ai_generated: boolean
  family_reasoning: string
  detected_allergens: DetectedAllergen[]
  safety_warnings: string[]
  ai_disclaimers: string[]
  safety_score: number
  // Cost and performance tracking
  generation_cost: number
  generation_time_ms: number
  cache_hit: boolean
  created_at: string
}

export interface DetectedAllergen {
  name: string
  confidence: number
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  icon: string
  warning_text: string
}

// Meal planning and special occasions
export interface MealPlan {
  id: string
  user_id: string
  week_start_date: string
  auto_generated: boolean
  generation_cost: number
  family_complexity_score: number
  created_at: string
}

export interface PlannedMeal {
  id: string
  meal_plan_id: string
  recipe_id: string
  meal_date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  special_occasion: boolean
  override_applied: boolean
}

export interface MealPlanOverride {
  id: string
  user_id: string
  override_date: string
  occasion_type: 'dinner_party' | 'date_night' | 'family_gathering' | 'celebration'
  guest_count: number
  guest_dietary_restrictions: string[]
  cooking_time_override?: number
  presentation_level: 'casual' | 'standard' | 'impressive'
  special_requirements?: string
  created_at: string
}

// Legal compliance and GDPR types
export interface UserConsent {
  user_id: string
  terms_accepted_version: string
  privacy_accepted_version: string
  marketing_consent: boolean
  analytics_consent: boolean
  ai_learning_consent: boolean
  accepted_at: string
  ip_address?: string
  user_agent?: string
  consent_source: 'registration' | 'settings_update'
}

export interface DataProcessingLog {
  id: string
  user_id?: string
  processing_type: string
  data_categories: string[]
  legal_basis: 'consent' | 'legitimate_interest' | 'contract'
  third_party_processor?: 'openai' | 'supabase'
  processed_at: string
  processing_purpose: string
  retention_period?: string
}

// AI usage tracking and cost protection
export interface AIUsageLog {
  id: string
  user_id: string
  cost: number
  tokens_used: number
  generation_time_ms: number
  meal_type: string
  family_complexity_score: number
  special_occasion?: string
  safety_warnings_count: number
  allergens_detected_count: number
  cache_hit: boolean
  created_at: string
}

// Shopping and cost optimization
export interface ShoppingList {
  id: string
  user_id: string
  meal_plan_id: string
  week_start_date: string
  estimated_total_cost: number
  cost_vs_meal_kits: number
  optimized_for_waste: boolean
  created_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient_id: string
  quantity: number
  unit: string
  estimated_cost: number
  store_section: string
  allergen_warnings: string[]
  priority_level: number
  already_owned: boolean
}

/**
 * Database Interface Definition
 * 
 * This provides type safety for all database operations
 * and ensures consistency across the app
 */
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
      households: {
        Row: Household
        Insert: Omit<Household, 'id' | 'created_at'>
        Update: Partial<Omit<Household, 'id' | 'created_at'>>
      }
      user_preferences: {
        Row: UserPreferences
        Insert: Omit<UserPreferences, 'id' | 'updated_at'>
        Update: Partial<Omit<UserPreferences, 'id' | 'updated_at'>>
      }
      family_members: {
        Row: FamilyMember
        Insert: Omit<FamilyMember, 'id' | 'created_at'>
        Update: Partial<Omit<FamilyMember, 'id' | 'created_at'>>
      }
      generated_recipes: {
        Row: GeneratedRecipe
        Insert: Omit<GeneratedRecipe, 'id' | 'created_at'>
        Update: Partial<Omit<GeneratedRecipe, 'id' | 'created_at'>>
      }
      meal_plans: {
        Row: MealPlan
        Insert: Omit<MealPlan, 'id' | 'created_at'>
        Update: Partial<Omit<MealPlan, 'id' | 'created_at'>>
      }
      planned_meals: {
        Row: PlannedMeal
        Insert: Omit<PlannedMeal, 'id'>
        Update: Partial<Omit<PlannedMeal, 'id'>>
      }
      meal_plan_overrides: {
        Row: MealPlanOverride
        Insert: Omit<MealPlanOverride, 'id' | 'created_at'>
        Update: Partial<Omit<MealPlanOverride, 'id' | 'created_at'>>
      }
      user_consent: {
        Row: UserConsent
        Insert: UserConsent
        Update: Partial<UserConsent>
      }
      data_processing_logs: {
        Row: DataProcessingLog
        Insert: Omit<DataProcessingLog, 'id'>
        Update: Partial<Omit<DataProcessingLog, 'id'>>
      }
      ai_usage_logs: {
        Row: AIUsageLog
        Insert: Omit<AIUsageLog, 'id' | 'created_at'>
        Update: Partial<Omit<AIUsageLog, 'id' | 'created_at'>>
      }
      shopping_lists: {
        Row: ShoppingList
        Insert: Omit<ShoppingList, 'id' | 'created_at'>
        Update: Partial<Omit<ShoppingList, 'id' | 'created_at'>>
      }
      shopping_list_items: {
        Row: ShoppingListItem
        Insert: Omit<ShoppingListItem, 'id'>
        Update: Partial<Omit<ShoppingListItem, 'id'>>
      }
    }
  }
}

/**
 * Utility Functions for Database Operations
 */

// Helper function to check if user is authenticated
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get current session
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper function for safe database queries with error handling
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const { data, error } = await queryFn()
    if (error) {
      console.error('Database query error:', error)
      return { data: null, error: error.message || 'Database query failed' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected database error:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Export configured client as default
export default supabase