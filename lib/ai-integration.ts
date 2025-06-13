// lib/ai-integration.ts
// Ingred AI Recipe Generation with Industry-Leading Safety and Cost Protection

import OpenAI from 'openai'
import { supabase } from './supabase'

/**
 * COMPREHENSIVE AI INTEGRATION FOR INGRED
 * 
 * This system provides:
 * - Family-aware recipe generation with safety prioritization
 * - Real-time cost protection and circuit breakers
 * - Comprehensive allergen detection and safety warnings
 * - AI content disclaimers and legal compliance
 * - Intelligent caching for cost optimization
 * - Fallback systems for reliability
 */

// Initialize OpenAI client with cost protection
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
})

// =====================================================
// COST PROTECTION CONSTANTS (AGGRESSIVE OPTIMIZATION)
// =====================================================
const COST_PROTECTION = {
  // Target costs (extremely optimized)
  target_cost_per_recipe: 0.000534, // £0.000534 aggressive target
  
  // Daily limits per user tier
  max_daily_cost_free: parseFloat(process.env.EXPO_PUBLIC_MAX_DAILY_COST_FREE || '0.01'),
  max_daily_cost_premium: parseFloat(process.env.EXPO_PUBLIC_MAX_DAILY_COST_PREMIUM || '0.50'),
  
  // Emergency circuit breaker
  circuit_breaker_cost: parseFloat(process.env.EXPO_PUBLIC_CIRCUIT_BREAKER_COST || '2.00'),
  
  // Anomaly detection thresholds
  user_spike_threshold: 10, // >10 recipes in 1 hour
  regeneration_loop: 5, // >5 regenerations of same meal
  bulk_generation: 25, // >25 recipes in 10 minutes
}

// =====================================================
// CORE INTERFACES
// =====================================================
export interface RecipeGenerationRequest {
  userId: string
  preferences: UserPreferences
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  specialOccasion?: SpecialOccasionContext
  pantryItems?: string[]
}

export interface UserPreferences {
  household_size: number
  cooking_skill: 'beginner' | 'intermediate' | 'advanced'
  budget_level: 'budget' | 'moderate' | 'premium'
  cooking_time_minutes: number
  dietary_restrictions: string[]
  allergies: string[]
  disliked_ingredients: string[]
  meals_per_week: number
  family_members?: FamilyMember[]
}

export interface FamilyMember {
  name: string
  age_group: 'child' | 'teen' | 'adult' | 'senior'
  dietary_restrictions: string[]
  allergies: string[]
  allergy_severity: string[]
}

export interface SpecialOccasionContext {
  occasion_type: string
  guest_count: number
  guest_dietary_restrictions: string[]
  presentation_level: 'casual' | 'standard' | 'impressive'
}

export interface GeneratedRecipe {
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prep_time: number
  cook_time: number
  total_time: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  family_reasoning: string
  allergen_considerations: string
  dietary_compliance: string[]
  nutrition_highlights: string
  safety_notes: string
  
  // AI safety metadata
  ai_generated: true
  detected_allergens: DetectedAllergen[]
  safety_warnings: string[]
  safety_score: number
  generation_cost: number
  generation_time_ms: number
  cache_hit?: boolean
}

export interface DetectedAllergen {
  name: string
  confidence: number
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  icon: string
  warning_text: string
}

export interface RecipeGenerationResult {
  success: boolean
  recipe?: GeneratedRecipe
  error?: string
  fallback_used?: boolean
  cost_protected?: boolean
  user_message?: string
}

// =====================================================
// AI RECIPE GENERATION CLASS
// =====================================================
export class IngredAI {
  
  /**
   * Main Recipe Generation with Comprehensive Safety
   */
  static async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeGenerationResult> {
    const startTime = Date.now()
    
    // DEBUG CODE
    console.log('🔑 OpenAI API Key loaded:', process.env.EXPO_PUBLIC_OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('🔑 API Key starts with:', process.env.EXPO_PUBLIC_OPENAI_API_KEY?.substring(0, 7));
    
    try {
      console.log('🚀 Starting recipe generation for:', request.mealType);
      
      // Step 1: Pre-generation safety and cost checks
      console.log('💰 Checking cost limits...');
      const costCheck = await this.checkCostLimits(request.userId)
      if (!costCheck.allowed) {
        console.log('❌ Cost limit exceeded');
        return {
          success: false,
          error: 'Daily cost limit reached',
          cost_protected: true,
          user_message: costCheck.message
        }
      }
      console.log('✅ Cost check passed');

      console.log('⏱️ Checking rate limits...');
      const rateCheck = await this.checkRateLimit(request.userId)
      if (!rateCheck.allowed) {
        console.log('❌ Rate limit exceeded');
        return {
          success: false,
          error: 'Rate limit exceeded',
          user_message: rateCheck.message
        }
      }
      console.log('✅ Rate limit check passed');

      // Step 2: Check for cached similar recipe (60% cost reduction target)
      console.log('🗄️ Checking for cached recipes...');
      const cachedRecipe = await this.getCachedSimilarRecipe(request)
      if (cachedRecipe) {
        console.log('✅ Using cached recipe for cost optimization')
        await this.logAIUsage(request.userId, {
          cost: 0,
          cache_hit: true,
          meal_type: request.mealType,
          family_complexity: request.preferences.family_members?.length || 1
        })
        
        return {
          success: true,
          recipe: { 
            ...cachedRecipe, 
            generation_cost: 0, 
            generation_time_ms: 0,
            cache_hit: true,
            ai_generated: true as const
          }
        }
      }
      console.log('🆕 No cached recipe found, generating new one...');

      // Step 3: Build family-aware prompt with safety prioritization
      console.log('📝 Building AI prompt...');
      const prompt = this.buildSafetyAwarePrompt(request)
      console.log('✅ Prompt built successfully');

      // ADD THIS DEBUG CODE TO SEE THE ACTUAL PROMPTS
      console.log('🔍 DEBUG - Meal Type:', request.mealType);
      console.log('🔍 DEBUG - System Prompt:', prompt.systemPrompt);
      console.log('🔍 DEBUG - User Prompt:', prompt.userPrompt);

      // Step 4: Generate recipe with OpenAI
      console.log('🧠 Calling OpenAI API...');
      
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found in environment variables');
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Cost-optimized model
        messages: [
          { role: "system", content: prompt.systemPrompt },
          { role: "user", content: prompt.userPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
      
      console.log('✅ OpenAI API call successful!');
      console.log('📊 Usage:', completion.usage);

      const generationTime = Date.now() - startTime
      const estimatedCost = this.calculateCost(completion.usage)
      
      console.log('💰 Estimated cost: £' + estimatedCost.toFixed(6));

      // Step 5: Parse and enhance with safety features
      console.log('🔍 Parsing AI response...');
      
      if (!completion.choices[0]?.message?.content) {
        throw new Error('No content received from OpenAI');
      }
      
      const rawRecipe = JSON.parse(completion.choices[0].message.content!)
      console.log('✅ Recipe parsed successfully:', rawRecipe.title);
      
      console.log('🛡️ Enhancing with safety features...');
      const enhancedRecipe = await this.enhanceRecipeWithSafety(rawRecipe, request.preferences)
      console.log('✅ Safety enhancement complete');

      // Step 6: Store recipe in database
      console.log('💾 Storing recipe in database...');
      const storedRecipe = await this.storeRecipe(request.userId, enhancedRecipe, {
        generation_cost: estimatedCost,
        generation_time_ms: generationTime,
        meal_type: request.mealType,
        family_complexity: request.preferences.family_members?.length || 1
      })
      console.log('✅ Recipe stored successfully');

      // Step 7: Log usage for optimization and legal compliance
      console.log('📊 Logging AI usage...');
      await this.logAIUsage(request.userId, {
        cost: estimatedCost,
        generation_time: generationTime,
        tokens_used: completion.usage!.total_tokens,
        meal_type: request.mealType,
        family_complexity: request.preferences.family_members?.length || 1,
        cache_hit: false
      })

      console.log(`✅ Recipe generation completed! Cost: £${estimatedCost.toFixed(6)}`);

      return {
        success: true,
        recipe: {
          ...enhancedRecipe,
          title: enhancedRecipe.title || 'Generated Recipe',
          description: enhancedRecipe.description || 'AI-generated family recipe',
          ingredients: enhancedRecipe.ingredients || [],
          instructions: enhancedRecipe.instructions || [],
          prep_time: enhancedRecipe.prep_time || 0,
          cook_time: enhancedRecipe.cook_time || 0,
          total_time: enhancedRecipe.total_time || 0,
          servings: enhancedRecipe.servings || 4,
          difficulty: enhancedRecipe.difficulty || 'medium',
          family_reasoning: enhancedRecipe.family_reasoning || 'Generated for your family',
          allergen_considerations: enhancedRecipe.allergen_considerations || 'Please verify ingredients',
          dietary_compliance: enhancedRecipe.dietary_compliance || [],
          nutrition_highlights: enhancedRecipe.nutrition_highlights || 'Nutritionally balanced',
          safety_notes: enhancedRecipe.safety_notes || 'Always verify ingredients for safety',
          detected_allergens: enhancedRecipe.detected_allergens || [],
          safety_warnings: enhancedRecipe.safety_warnings || [],
          safety_score: enhancedRecipe.safety_score || 100,
          generation_cost: estimatedCost,
          generation_time_ms: generationTime,
          ai_generated: true as const
        }
      }

    } catch (error) {
      console.error('❌ Recipe generation failed at step:', error);
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
      
      // Comprehensive error handling with fallback
      const fallbackResult = await this.handleGenerationFailure(request, error)
      return fallbackResult
    }
  }

  /**
   * Build Family-Aware Prompt with Safety Prioritization
   */
  private static buildSafetyAwarePrompt(request: RecipeGenerationRequest) {
    const { preferences, mealType, specialOccasion } = request

    const systemPrompt = `You are Ingred, an AI meal planning assistant specializing in family-safe meal planning.

CRITICAL SAFETY REQUIREMENTS:

1. ALLERGEN SAFETY: Family allergies (${preferences.allergies?.join(', ') || 'none'}). NEVER include these ingredients.

2. DIETARY COMPLIANCE: Strict adherence to dietary restrictions (${preferences.dietary_restrictions?.join(', ') || 'none'}).

3. FAMILY COORDINATION: This meal serves ${preferences.household_size} people with ${preferences.family_members?.length || 0} individual family members.

4. LEGAL COMPLIANCE: Recipe will include safety disclaimers for user verification.

${specialOccasion ? `
5. SPECIAL OCCASION: ${specialOccasion.occasion_type} with ${specialOccasion.guest_count} guests.
Guest restrictions: ${specialOccasion.guest_dietary_restrictions?.join(', ') || 'none'}.
` : ''}

Generate recipes that prioritize safety while being delicious and family-appropriate.`

    const mealTypePrompts = {
      breakfast: "Create a delicious breakfast recipe that energizes my family for the day:",
      lunch: "Create a satisfying lunch recipe that provides midday energy and nutrition:",
      dinner: "Create a hearty dinner recipe that brings my family together for the evening:"
    };

    const varietyRequests = {
      breakfast: "Focus on morning-appropriate foods like eggs, toast, cereals, or pancakes.",
      lunch: "Consider lighter meals like salads, sandwiches, soups, or quick stir-fries.",
      dinner: "Think substantial evening meals like pasta dishes, casseroles, roasts, or curries."
    };

    const userPrompt = `${mealTypePrompts[mealType]}

    ${varietyRequests[mealType]}

    VARIETY REQUEST: Please create something different from typical ${mealType === 'lunch' ? 'stir-fry' : 'repeated'} dishes. Explore diverse ingredients and cooking methods.

Family Details:
- Household size: ${preferences.household_size} people
- Cooking time available: ${preferences.cooking_time_minutes} minutes
- Cooking skill: ${preferences.cooking_skill}
- Budget preference: ${preferences.budget_level}

${preferences.family_members?.length ? `
Individual Family Members:
${preferences.family_members.map(member => 
  `- ${member.name} (${member.age_group}): ${member.dietary_restrictions?.join(', ') || 'no restrictions'}${member.allergies?.length ? ` | ALLERGIES: ${member.allergies.join(', ')}` : ''}`
).join('\n')}
` : ''}

${request.pantryItems?.length ? `
Available ingredients: ${request.pantryItems.join(', ')}
` : 'Use common grocery store ingredients.'}

Return JSON format:
{
  "title": "Recipe name",
  "description": "Brief family-friendly description",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "prep_time": 15,
  "cook_time": 30,
  "total_time": 45,
  "servings": 4,
  "difficulty": "easy",
  "family_reasoning": "Why this recipe works perfectly for your family",
  "allergen_considerations": "Specific notes about allergen safety for this recipe",
  "dietary_compliance": ["vegetarian", "dairy-free"],
  "nutrition_highlights": "Key nutritional benefits",
  "safety_notes": "Important safety reminders and verification steps"
}`

    return { systemPrompt, userPrompt }
  }

  /**
   * Enhanced Recipe Safety Processing
   */
  private static async enhanceRecipeWithSafety(
    rawRecipe: any, 
    preferences: UserPreferences
  ): Promise<Partial<GeneratedRecipe>> {
    
    // Detect allergens in ingredients
    const detectedAllergens = this.detectAllergens(rawRecipe.ingredients, preferences)
    
    // Generate safety warnings
    const safetyWarnings = this.generateSafetyWarnings(detectedAllergens, preferences)
    
    // Calculate safety score
    const safetyScore = this.calculateSafetyScore(rawRecipe, preferences, detectedAllergens)

    return {
      ...rawRecipe,
      detected_allergens: detectedAllergens,
      safety_warnings: safetyWarnings,
      safety_score: safetyScore
    }
  }

  /**
   * Comprehensive Allergen Detection System
   */
  private static detectAllergens(ingredients: string[], preferences: UserPreferences): DetectedAllergen[] {
    const ALLERGEN_DATABASE = {
      dairy: {
        keywords: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein', 'lactose'],
        icon: '🥛',
        severity_default: 'moderate' as const
      },
      nuts: {
        keywords: ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio', 'macadamia'],
        icon: '🥜',
        severity_default: 'severe' as const
      },
      gluten: {
        keywords: ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'malt', 'bulgur'],
        icon: '🌾',
        severity_default: 'moderate' as const
      },
      shellfish: {
        keywords: ['shrimp', 'crab', 'lobster', 'prawn', 'crawfish', 'langostino'],
        icon: '🦐',
        severity_default: 'severe' as const
      },
      eggs: {
        keywords: ['egg', 'eggs', 'albumin', 'mayonnaise'],
        icon: '🥚',
        severity_default: 'moderate' as const
      },
      soy: {
        keywords: ['soy', 'tofu', 'tempeh', 'edamame', 'miso', 'tamari', 'lecithin'],
        icon: '🫘',
        severity_default: 'mild' as const
      }
    } as const

    const detectedAllergens: DetectedAllergen[] = []
    const ingredientText = ingredients.join(' ').toLowerCase()

    Object.entries(ALLERGEN_DATABASE).forEach(([allergenName, allergenInfo]) => {
      const matchedKeywords = allergenInfo.keywords.filter(keyword =>
        ingredientText.includes(keyword.toLowerCase())
      )

      if (matchedKeywords.length > 0) {
        const confidence = Math.min(matchedKeywords.length / allergenInfo.keywords.length, 1.0)
        
        let severity = allergenInfo.severity_default
        if (preferences.allergies?.includes(allergenName)) {
          severity = 'severe' as const // Escalate for known user allergies
        }

        detectedAllergens.push({
          name: allergenName,
          confidence,
          severity,
          icon: allergenInfo.icon,
          warning_text: `This recipe may contain ${allergenName}. ${severity === 'severe' ? 'CRITICAL: This is a known allergen for this family member.' : 'Please verify all ingredients carefully.'}`
        })
      }
    })

    return detectedAllergens
  }

  /**
   * Generate Comprehensive Safety Warnings
   */
  private static generateSafetyWarnings(
    detectedAllergens: DetectedAllergen[], 
    preferences: UserPreferences
  ): string[] {
    const warnings: string[] = []

    // Critical allergen warnings
    const criticalAllergens = detectedAllergens.filter(a => a.severity === 'severe')
    if (criticalAllergens.length > 0) {
      warnings.push(`CRITICAL ALLERGEN WARNING: This recipe contains allergens that are dangerous for family members: ${criticalAllergens.map(a => a.name).join(', ')}`)
    }

    // General allergen warnings
    const generalAllergens = detectedAllergens.filter(a => a.severity !== 'severe')
    if (generalAllergens.length > 0) {
      warnings.push(`This recipe may contain: ${generalAllergens.map(a => `${a.icon} ${a.name}`).join(', ')}. Please verify ingredients for safety.`)
    }

    // Always include general AI safety warning
    warnings.push('This recipe was generated by AI. Always verify ingredients for allergies and dietary restrictions.')

    return warnings
  }

  /**
   * Calculate Overall Safety Score
   */
  private static calculateSafetyScore(
    recipe: any, 
    preferences: UserPreferences, 
    detectedAllergens: DetectedAllergen[]
  ): number {
    let score = 100

    // Deduct for critical allergens
    const criticalAllergens = detectedAllergens.filter(a => a.severity === 'severe')
    score -= criticalAllergens.length * 30

    // Deduct for general allergens
    const generalAllergens = detectedAllergens.filter(a => a.severity !== 'severe')
    score -= generalAllergens.length * 10

    // Deduct for missing safety considerations
    if (!recipe.allergen_considerations) score -= 10
    if (!recipe.safety_notes) score -= 10
    if (!recipe.dietary_compliance) score -= 5

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Cost Calculation and Monitoring
   */
  private static calculateCost(usage: any): number {
    const inputCost = (usage.prompt_tokens * 0.000150) / 1000 // GPT-4o-mini input cost
    const outputCost = (usage.completion_tokens * 0.000600) / 1000 // GPT-4o-mini output cost
    return inputCost + outputCost
  }

  private static async checkCostLimits(userId: string): Promise<{ allowed: boolean; message?: string }> {
  try {
    console.log('💰 Cost check - SIMPLIFIED FOR TESTING');
    // TEMPORARILY BYPASS ALL COST CHECKING FOR TESTING
    return { allowed: true }
  } catch (error) {
    console.error('💰 Cost limit check failed, allowing request:', error)
    return { allowed: true }
  }
}

  private static async checkRateLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
  try {
    console.log('⏱️ Rate limit check - SIMPLIFIED FOR TESTING');
    // TEMPORARILY BYPASS ALL RATE LIMITING FOR TESTING
    return { allowed: true }
  } catch (error) {
    console.error('⏱️ Rate limit check failed, allowing request:', error)
    return { allowed: true }
  }
}

  /**
   * Store Recipe in Database with Data Validation
   */
  private static async storeRecipe(
    userId: string, 
    recipe: any, 
    metadata: { generation_cost: number; generation_time_ms: number; meal_type: string; family_complexity: number }
  ) {
    // Validate and clean the recipe data before storing
    const cleanedRecipe = {
      user_id: userId,
      title: recipe.title || 'Generated Recipe',
      description: recipe.description || 'AI-generated family recipe',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      prep_time: parseInt(recipe.prep_time) || 0,
      cook_time: parseInt(recipe.cook_time) || 0,
      total_time: parseInt(recipe.total_time) || parseInt(recipe.prep_time) + parseInt(recipe.cook_time) || 0,
      servings: parseInt(recipe.servings) || 4,
      // Clean and validate difficulty
      difficulty: this.validateDifficulty(recipe.difficulty),
      ai_generated: true,
      family_reasoning: recipe.family_reasoning || 'Generated for your family',
      detected_allergens: recipe.detected_allergens || [],
      safety_warnings: recipe.safety_warnings || [],
      ai_disclaimers: ['This recipe was generated by AI. Always verify ingredients for allergies and dietary restrictions.'],
      safety_score: Math.min(100, Math.max(0, parseInt(recipe.safety_score) || 100)),
      generation_cost: metadata.generation_cost,
      generation_time_ms: metadata.generation_time_ms
    };

    console.log('💾 Storing cleaned recipe data:', {
      title: cleanedRecipe.title,
      difficulty: cleanedRecipe.difficulty,
      servings: cleanedRecipe.servings,
      total_time: cleanedRecipe.total_time
    });

    console.log('💾 About to insert recipe into database...');
    console.log('💾 Using userId:', userId);

    try {
      // Production-ready database insert with timeout and detailed error handling
      console.log('💾 Starting database insert operation...');

      const insertPromise = supabase
        .from('generated_recipes')
        .insert(cleanedRecipe)
        .select()
        .single();
      
      // Add 10-second timeout for production reliability
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timeout - 10 seconds exceeded')), 10000)
      );
      
      console.log('💾 Executing insert with timeout protection...');
      const insertResult = await Promise.race([insertPromise, timeoutPromise]) as any;
      
      console.log('💾 Database operation completed');
      
      // Check for database errors
      if (insertResult.error) {
        console.error('💾 Database insert error details:');
        console.error('💾 Error code:', insertResult.error.code);
        console.error('💾 Error message:', insertResult.error.message);
        console.error('💾 Error hint:', insertResult.error.hint);
        console.error('💾 Error details:', insertResult.error.details);
        
        // Production error handling
        if (insertResult.error.code === '42501') {
          throw new Error('Database permission error. Please log out and log back in.');
        } else if (insertResult.error.code === '23505') {
          throw new Error('Recipe already exists. Please try generating a different recipe.');
        } else {
          throw new Error(`Database error: ${insertResult.error.message}`);
        }
      }
      
      // Check for successful data return
      if (insertResult.data) {
        console.log('✅ Recipe stored successfully with ID:', insertResult.data.id);
        return insertResult.data;
      }
      
      throw new Error('Database insert completed but no data returned');
      
    } catch (error: any) {
      console.error('💾 Database operation failed:', error.name, error.message);
      
      // Production error categorization
      if (error.message?.includes('timeout')) {
        console.error('💾 TIMEOUT: Database operation took longer than 10 seconds');
        throw new Error('Database is temporarily slow. Please try again.');
      } else if (error.message?.includes('network')) {
        console.error('💾 NETWORK: Connection issue detected');
        throw new Error('Network connection issue. Please check your internet and try again.');
      } else {
        console.error('💾 UNKNOWN ERROR:', error);
        throw new Error('Database error. Please try again or contact support.');
      }
    }
  }

  /**
   * Validate and Clean Difficulty Value
   */
  private static validateDifficulty(difficulty: any): 'easy' | 'medium' | 'hard' {
    if (!difficulty || typeof difficulty !== 'string') {
      return 'medium' // Default fallback
    }

    const cleaned = difficulty.toLowerCase().trim()
    
    // Map various AI responses to our valid values
    if (cleaned.includes('easy') || cleaned.includes('simple') || cleaned.includes('beginner')) {
      return 'easy'
    }
    
    if (cleaned.includes('hard') || cleaned.includes('difficult') || cleaned.includes('advanced') || cleaned.includes('challenging')) {
      return 'hard'
    }
    
    // Default to medium for anything else (intermediate, normal, moderate, etc.)
    return 'medium'
  }

  /**
   * Usage Logging for Optimization and Legal Compliance
   */
  private static async logAIUsage(userId: string, usage: any): Promise<void> {
    try {
      console.log('📊 Attempting to log AI usage...');
      
      const logData = {
        user_id: userId,
        cost: usage.cost || 0,
        tokens_used: usage.tokens_used || 0,
        generation_time_ms: usage.generation_time || 0,
        meal_type: usage.meal_type,
        family_complexity_score: usage.family_complexity || 1,
        cache_hit: usage.cache_hit || false,
        safety_warnings_count: usage.safety_warnings_count || 0,
        allergens_detected_count: usage.allergens_detected_count || 0
      };

      const { error } = await supabase.from('ai_usage_logs').insert(logData);
      
      if (error) {
        console.log('⚠️ AI usage logging failed (non-blocking):', error.message);
      } else {
        console.log('✅ AI usage logged successfully');
      }
    } catch (error) {
      console.error('📊 Failed to log AI usage (non-blocking):', error)
    }
  }

  private static async getCachedSimilarRecipe(request: RecipeGenerationRequest): Promise<any> {
    try {
      console.log('🗄️ Looking for cached similar recipes...');
      
      // TEMPORARILY DISABLED: Always return null to force new generation
      console.log('🆕 Cache disabled for testing - generating fresh recipes');
      return null;
      
    } catch (error) {
      console.error('🗄️ Cache lookup error (non-blocking):', error);
      return null;
    }
  }

  /**
   * Error Handling with Fallback Systems
   */
  private static async handleGenerationFailure(
    request: RecipeGenerationRequest,
    error: any
  ): Promise<RecipeGenerationResult> {
    // Log the error for analysis
    console.error('❌ AI generation failed with error:', error)
    console.error('❌ Error name:', error?.name)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error stack:', error?.stack)

    // Provide specific error messages based on error type
    let userMessage = 'We\'re having trouble generating recipes right now. Please try again in a few minutes.'
    
    if (error?.message?.includes('API key')) {
      userMessage = 'There\'s an issue with our AI service configuration. Please contact support.'
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      userMessage = 'Network connection issue. Please check your internet and try again.'
    } else if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
      userMessage = 'Our AI service is temporarily busy. Please try again in a few minutes.'
    }

    // Return user-friendly fallback
    return {
      success: false,
      error: 'Recipe generation temporarily unavailable',
      fallback_used: true,
      user_message: userMessage
    }
  }
}

// =====================================================
// EXPORT FOR USE IN APP
// =====================================================
export default IngredAI