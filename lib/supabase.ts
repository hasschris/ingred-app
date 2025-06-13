import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * FIXED: Supabase Client Configuration for Ingred
 * 
 * This resolves timeout issues by:
 * - Using standard auth flow (not PKCE)
 * - Removing problematic timeout wrappers
 * - Simplifying client configuration
 * - Proper AsyncStorage integration
 */

// Environment configuration with validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables')
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  throw new Error('Supabase environment variables are required')
}

console.log('🔧 Initializing Supabase client...')
console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseAnonKey.length)

// Create Supabase client with FIXED React Native configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // REMOVED: flowType: 'pkce' - this was causing timeouts!
    // REMOVED: custom storageKey - use default
    // REMOVED: debug setting - can cause issues
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-react-native',
    },
  },
  // REMOVED: realtime config - unnecessary for your use case
  db: {
    schema: 'public',
  },
})

/**
 * Simple Auth Helpers (NO TIMEOUT WRAPPERS)
 */

// Get current user - simple and direct (backwards compatible)
export const getCurrentUser = async (timeoutMs?: number) => {
  console.log('🔍 Getting current user...')
  // Note: timeoutMs parameter kept for backwards compatibility but ignored
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('❌ Get user error:', error.message)
      return null
    }
    console.log('✅ User retrieved:', data.user ? 'Present' : 'Null')
    return data.user
  } catch (error) {
    console.error('❌ Get user failed:', error)
    return null
  }
}

// Get current session - simple and direct (backwards compatible)
export const getCurrentSession = async (timeoutMs?: number) => {
  console.log('🔍 Getting current session...')
  // Note: timeoutMs parameter kept for backwards compatibility but ignored
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Get session error:', error.message)
      return null
    }
    console.log('✅ Session retrieved:', data.session ? 'Present' : 'Null')
    if (data.session) {
      console.log('📅 Session expires:', new Date(data.session.expires_at! * 1000).toLocaleString())
    }
    return data.session
  } catch (error) {
    console.error('❌ Get session failed:', error)
    return null
  }
}

// Test database connectivity - simple and direct
export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...')
  try {
    const { error } = await supabase.from('user_preferences').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('❌ Database test error:', error.message)
      return false
    }
    console.log('✅ Database connection successful!')
    return true
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

// Clear auth data for logout
export const clearAllAuthData = async () => {
  console.log('🧹 Clearing all auth data...')
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear auth keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys()
    const authKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('sb-')
    )
    
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys)
      console.log('✅ Removed auth keys:', authKeys.length)
    }
    
    console.log('✅ All auth data cleared successfully')
    return true
  } catch (error) {
    console.error('❌ Error clearing auth data:', error)
    return false
  }
}

// Debug function to check auth state
export const debugAuthState = async () => {
  console.log('🔍 === AUTH STATE DEBUG ===')
  
  // Test basic connectivity
  const dbConnected = await testDatabaseConnection()
  console.log('Database:', dbConnected ? '✅ Connected' : '❌ Failed')
  
  // Check session
  const session = await getCurrentSession()
  console.log('Session:', session ? '✅ Present' : '❌ Missing')
  
  // Check user
  const user = await getCurrentUser()
  console.log('User:', user ? '✅ Present' : '❌ Missing')
  
  // Check AsyncStorage
  try {
    const keys = await AsyncStorage.getAllKeys()
    const authKeys = keys.filter(key => 
      key.includes('supabase') || key.includes('sb-')
    )
    console.log('Auth keys in storage:', authKeys.length)
  } catch (error) {
    console.error('❌ AsyncStorage check failed:', error)
  }
  
  console.log('🔍 === DEBUG COMPLETE ===')
  
  return {
    dbConnected,
    hasSession: !!session,
    hasUser: !!user,
    sessionExpiry: session ? new Date(session.expires_at! * 1000) : null
  }
}

// Export all the original types for backwards compatibility
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

export interface UserPreferences {
  id: string
  user_id: string
  household_size: number
  cooking_skill: 'beginner' | 'intermediate' | 'advanced'
  budget_level: 'budget' | 'moderate' | 'premium'
  cooking_time_minutes: number
  dietary_restrictions: string[]
  allergies: string[]
  disliked_ingredients: string[]
  meals_per_week: number
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

export interface DetectedAllergen {
  name: string
  confidence: number
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  icon: string
  warning_text: string
}

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
  ai_generated: boolean
  family_reasoning: string
  detected_allergens: DetectedAllergen[]
  safety_warnings: string[]
  ai_disclaimers: string[]
  safety_score: number
  generation_cost: number
  generation_time_ms: number
  cache_hit: boolean
  created_at: string
}

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

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
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
    }
  }
}

export default supabase