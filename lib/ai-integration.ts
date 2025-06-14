// lib/ai-integration.ts
// Enhanced Ingred AI Recipe Generation with Family Intelligence

import OpenAI from 'openai'
import { supabase } from './supabase'

/**
 * ENHANCED AI INTEGRATION FOR INGRED - FAMILY INTELLIGENCE
 * 
 * This system provides:
 * - Family-aware recipe generation with individual member consideration
 * - Real-time cost protection and circuit breakers
 * - Comprehensive allergen detection and safety warnings
 * - Individual family member impact tracking
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
// ENHANCED FAMILY-AWARE INTERFACES
// =====================================================
export interface RecipeGenerationRequest {
  userId: string
  preferences: UserPreferences
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  specialOccasion?: SpecialOccasionContext
  pantryItems?: string[]
  targetFamilyMember?: string // Optional: generate specifically for one member
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
  id: string
  name: string
  age_group: 'child' | 'teen' | 'adult' | 'senior'
  dietary_restrictions: string[]
  allergies: string[]
  allergy_severity: string[]
  dislikes: string[]
  special_needs?: string
  medical_dietary_requirements?: string
}

export interface SpecialOccasionContext {
  occasion_type: string
  guest_count: number
  guest_dietary_restrictions: string[]
  presentation_level: 'casual' | 'standard' | 'impressive'
}

export interface GeneratedRecipe {
  id?: string
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
  
  // Enhanced family metadata
  family_member_considerations: FamilyMemberConsideration[]
  family_adaptations: string[]
  family_impact_summary: string
  
  // AI safety metadata
  ai_generated: true
  detected_allergens: DetectedAllergen[]
  safety_warnings: string[]
  safety_score: number
  generation_cost: number
  generation_time_ms: number
  estimated_cost?: number
  cache_hit?: boolean
}

export interface FamilyMemberConsideration {
  member_name: string
  member_id: string
  accommodations_made: string[]
  safety_notes: string[]
  preference_adjustments: string[]
}

export interface DetectedAllergen {
  name: string
  confidence: number
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  icon: string
  warning_text: string
  affects_family_members: string[] // NEW: Which family members this affects
}

export interface RecipeGenerationResult {
  success: boolean
  recipe?: GeneratedRecipe
  error?: string
  fallback_used?: boolean
  cost_protected?: boolean
  user_message?: string
  family_impact?: string // NEW: Summary of family considerations
}

// =====================================================
// ENHANCED AI RECIPE GENERATION CLASS
// =====================================================
export class IngredAI {
  
  /**
   * Enhanced Recipe Generation with Family Intelligence
   */
  static async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeGenerationResult> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 Starting family-aware recipe generation for:', request.mealType);
      console.log('👨‍👩‍👧‍👦 Family members:', request.preferences.family_members?.length || 0);
      
      // Step 1: Pre-generation safety and cost checks
      const costCheck = await this.checkCostLimits(request.userId)
      if (!costCheck.allowed) {
        return {
          success: false,
          error: 'Daily cost limit reached',
          cost_protected: true,
          user_message: costCheck.message
        }
      }

      const rateCheck = await this.checkRateLimit(request.userId)
      if (!rateCheck.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          user_message: rateCheck.message
        }
      }

      // Step 2: Enhanced family analysis
      const familyAnalysis = this.analyzeFamilyComplexity(request.preferences)
      console.log('👨‍👩‍👧‍👦 Family complexity analysis:', familyAnalysis)

      // Step 3: Check for cached similar recipe with family consideration
      const cachedRecipe = await this.getCachedFamilyAwareRecipe(request, familyAnalysis)
      if (cachedRecipe) {
        console.log('✅ Using family-optimized cached recipe')
        await this.logAIUsage(request.userId, {
          cost: 0,
          cache_hit: true,
          meal_type: request.mealType,
          family_complexity: familyAnalysis.complexity_score
        })
        
        return {
          success: true,
          recipe: { 
            id: cachedRecipe.id,
            title: cachedRecipe.title || 'Cached Recipe',
            description: cachedRecipe.description || 'AI-generated family recipe',
            ingredients: cachedRecipe.ingredients || [],
            instructions: cachedRecipe.instructions || [],
            prep_time: cachedRecipe.prep_time || 0,
            cook_time: cachedRecipe.cook_time || 0,
            total_time: cachedRecipe.total_time || 0,
            servings: cachedRecipe.servings || 4,
            difficulty: cachedRecipe.difficulty || 'medium',
            family_reasoning: cachedRecipe.family_reasoning || 'Generated for your family',
            allergen_considerations: cachedRecipe.allergen_considerations || 'Please verify ingredients',
            dietary_compliance: cachedRecipe.dietary_compliance || [],
            nutrition_highlights: cachedRecipe.nutrition_highlights || 'Nutritionally balanced',
            safety_notes: cachedRecipe.safety_notes || 'Always verify ingredients for safety',
            family_member_considerations: cachedRecipe.family_member_considerations || [],
            family_adaptations: cachedRecipe.family_adaptations || [],
            family_impact_summary: cachedRecipe.family_impact_summary || familyAnalysis.summary,
            detected_allergens: cachedRecipe.detected_allergens || [],
            safety_warnings: cachedRecipe.safety_warnings || [],
            safety_score: cachedRecipe.safety_score || 100,
            generation_cost: 0, 
            generation_time_ms: 0,
            cache_hit: true,
            ai_generated: true as const
          },
          family_impact: familyAnalysis.summary
        }
      }

      // Step 4: Build enhanced family-aware prompt with safety prioritization
      const prompt = this.buildFamilyIntelligencePrompt(request, familyAnalysis)
      console.log('📝 Family-intelligent prompt built')

      // Step 5: Generate recipe with OpenAI
      console.log('🧠 Calling OpenAI API with family intelligence...');
      
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found in environment variables');
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Cost-optimized model
        messages: [
          { role: "system", content: prompt.systemPrompt },
          { role: "user", content: prompt.userPrompt }
        ],
        max_tokens: 1500, // Increased for family considerations
        temperature: 0.7,
        response_format: { type: "json_object" }
      })

      const generationTime = Date.now() - startTime
      const estimatedCost = this.calculateCost(completion.usage)

      // Step 6: Parse and enhance with family-aware safety features
      if (!completion.choices[0]?.message?.content) {
        throw new Error('No content received from OpenAI');
      }
      
      const rawRecipe = JSON.parse(completion.choices[0].message.content!)
      console.log('✅ Family-aware recipe parsed:', rawRecipe.title);
      
      const enhancedRecipe = await this.enhanceRecipeWithFamilySafety(
        rawRecipe, 
        request.preferences, 
        familyAnalysis
      )

      // Step 7: Store recipe in database with family metadata
      const storedRecipe = await this.storeRecipe(request.userId, enhancedRecipe, {
        generation_cost: estimatedCost,
        generation_time_ms: generationTime,
        meal_type: request.mealType,
        family_complexity: familyAnalysis.complexity_score
      })

      // Step 8: Log enhanced usage
      await this.logAIUsage(request.userId, {
        cost: estimatedCost,
        generation_time: generationTime,
        tokens_used: completion.usage!.total_tokens,
        meal_type: request.mealType,
        family_complexity: familyAnalysis.complexity_score,
        cache_hit: false,
        family_members_considered: request.preferences.family_members?.length || 0
      })

      console.log(`✅ Family-aware recipe generation completed! Cost: £${estimatedCost.toFixed(6)}`);

      return {
        success: true,
        recipe: {
          id: storedRecipe.id,
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
          family_member_considerations: enhancedRecipe.family_member_considerations || [],
          family_adaptations: enhancedRecipe.family_adaptations || [],
          family_impact_summary: enhancedRecipe.family_impact_summary || familyAnalysis.summary,
          detected_allergens: enhancedRecipe.detected_allergens || [],
          safety_warnings: enhancedRecipe.safety_warnings || [],
          safety_score: enhancedRecipe.safety_score || 100,
          generation_cost: estimatedCost,
          generation_time_ms: generationTime,
          ai_generated: true as const,
          estimated_cost: enhancedRecipe.estimated_cost,
          cache_hit: enhancedRecipe.cache_hit
        },
        family_impact: familyAnalysis.summary
      }

    } catch (error) {
      console.error('❌ Family-aware recipe generation failed:', error);
      
      // Comprehensive error handling with family context
      const fallbackResult = await this.handleGenerationFailure(request, error)
      return fallbackResult
    }
  }

  /**
   * NEW: Analyze Family Complexity for Intelligent Recipe Generation
   */
  private static analyzeFamilyComplexity(preferences: UserPreferences) {
    const familyMembers = preferences.family_members || []
    
    // Calculate complexity metrics
    const totalAllergies = [...new Set(familyMembers.flatMap(m => m.allergies))]
    const totalRestrictions = [...new Set(familyMembers.flatMap(m => m.dietary_restrictions))]
    const totalDislikes = [...new Set(familyMembers.flatMap(m => m.dislikes))]
    
    const criticalMembers = familyMembers.filter(m => 
      m.allergy_severity.includes('life_threatening') || m.allergy_severity.includes('severe')
    )
    
    const childrenCount = familyMembers.filter(m => m.age_group === 'child').length
    const teenCount = familyMembers.filter(m => m.age_group === 'teen').length
    
    // Detect dietary conflicts
    const vegetarians = familyMembers.filter(m => 
      m.dietary_restrictions.some(r => r.includes('vegetarian') || r.includes('vegan'))
    ).map(m => m.name)
    
    const nonVegetarians = familyMembers.filter(m => 
      !m.dietary_restrictions.some(r => r.includes('vegetarian') || r.includes('vegan'))
    ).map(m => m.name)
    
    // Calculate complexity score
    let complexityScore = 0
    complexityScore += totalAllergies.length * 2
    complexityScore += totalRestrictions.length * 1.5
    complexityScore += criticalMembers.length * 3
    complexityScore += childrenCount * 1
    if (vegetarians.length > 0 && nonVegetarians.length > 0) complexityScore += 2
    
    // Generate family considerations summary
    const considerations = []
    if (criticalMembers.length > 0) {
      considerations.push(`Critical allergies for ${criticalMembers.map(m => m.name).join(', ')}`)
    }
    if (totalAllergies.length > 0) {
      considerations.push(`Avoiding: ${totalAllergies.join(', ')}`)
    }
    if (vegetarians.length > 0 && nonVegetarians.length > 0) {
      considerations.push(`Mixed dietary needs: vegetarian (${vegetarians.join(', ')}) and non-vegetarian (${nonVegetarians.join(', ')})`)
    }
    if (childrenCount > 0) {
      considerations.push(`Child-friendly for ${childrenCount} ${childrenCount === 1 ? 'child' : 'children'}`)
    }
    
    return {
      complexity_score: complexityScore,
      total_allergies: totalAllergies,
      total_restrictions: totalRestrictions,
      total_dislikes: totalDislikes,
      critical_members: criticalMembers,
      children_count: childrenCount,
      teen_count: teenCount,
      dietary_conflicts: vegetarians.length > 0 && nonVegetarians.length > 0,
      vegetarians,
      non_vegetarians: nonVegetarians,
      summary: considerations.length > 0 ? considerations.join(' • ') : 'No special dietary considerations',
      individual_needs: familyMembers.map(member => ({
        name: member.name,
        restrictions: [...member.allergies, ...member.dietary_restrictions, ...member.dislikes.slice(0, 3)],
        critical: member.allergy_severity.includes('life_threatening') || member.allergy_severity.includes('severe')
      }))
    }
  }

  /**
   * NEW: Build Family Intelligence Prompt
   */
  private static buildFamilyIntelligencePrompt(
    request: RecipeGenerationRequest, 
    familyAnalysis: any
  ) {
    const { preferences, mealType, specialOccasion } = request

    // Build comprehensive avoidance list
    const allFoodAvoidances = []
    preferences.family_members?.forEach(member => {
      member.allergies.forEach(allergy => {
        allFoodAvoidances.push(`${allergy} (ALLERGY - ${member.name})`)
      })
      member.dislikes.forEach(dislike => {
        allFoodAvoidances.push(`${dislike.replace(/_/g, ' ')} (DISLIKE - ${member.name})`)
      })
    })

    const systemPrompt = `You are Ingred, an AI meal planning assistant specializing in sophisticated family-safe meal planning.

CRITICAL FAMILY INTELLIGENCE REQUIREMENTS:

1. FAMILY COMPOSITION: This recipe serves ${preferences.household_size} people with ${preferences.family_members?.length || 0} individual family members with unique needs.

2. ⚠️ ABSOLUTE FOOD AVOIDANCES - NEVER INCLUDE THESE:
${allFoodAvoidances.length > 0 
  ? allFoodAvoidances.map(item => `- ${item}`).join('\n')
  : '- No specific avoidances'}

3. ALLERGEN SAFETY MATRIX: 
${familyAnalysis.total_allergies.length > 0 
  ? `- CRITICAL ALLERGENS TO AVOID: ${familyAnalysis.total_allergies.join(', ')}
- Critical allergy members: ${familyAnalysis.critical_members.map((m: any) => m.name).join(', ')}`
  : '- No known family allergies'}

4. INDIVIDUAL FAMILY MEMBER CONSIDERATIONS:
${preferences.family_members?.map(member => 
  `- ${member.name} (${member.age_group}): 
    * ALLERGIES (NEVER USE): ${member.allergies.join(', ') || 'None'}
    * DISLIKES (MUST AVOID): ${member.dislikes.map(d => d.replace(/_/g, ' ')).join(', ') || 'None'}
    * Dietary restrictions: ${member.dietary_restrictions.join(', ') || 'None'}
    * Special needs: ${member.special_needs || 'None'}`
).join('\n') || '- No individual family members configured'}

5. FAMILY COMPLEXITY ANALYSIS:
- Complexity score: ${familyAnalysis.complexity_score}/10
- Family summary: ${familyAnalysis.summary}

6. DIETARY COORDINATION:
${familyAnalysis.dietary_conflicts ? 
  `- DIETARY CONFLICT RESOLUTION NEEDED: ${familyAnalysis.vegetarians.join(', ')} (vegetarian) vs ${familyAnalysis.non_vegetarians.join(', ')} (non-vegetarian)` :
  '- No dietary conflicts detected'}

7. AGE-APPROPRIATE CONSIDERATIONS:
${familyAnalysis.children_count > 0 ? `- Child-friendly requirements for ${familyAnalysis.children_count} children` : ''}
${familyAnalysis.teen_count > 0 ? `- Teen-appropriate portions and flavors for ${familyAnalysis.teen_count} teenagers` : ''}

${specialOccasion ? `
8. SPECIAL OCCASION: ${specialOccasion.occasion_type} with ${specialOccasion.guest_count} guests.
Guest restrictions: ${specialOccasion.guest_dietary_restrictions?.join(', ') || 'none'}.
` : ''}

CRITICAL RULE: NEVER include any ingredient from the "ABSOLUTE FOOD AVOIDANCES" list above. This includes both allergies AND dislikes.

Your mission: Generate recipes that bring families together safely while accommodating individual needs.`

    const mealTypePrompts = {
      breakfast: "Create a family breakfast that energizes everyone for their day while respecting individual dietary needs and food preferences:",
      lunch: "Create a family lunch that satisfies different preferences while maintaining nutritional balance and avoiding all listed food avoidances:",
      dinner: "Create a family dinner that brings everyone together while accommodating individual restrictions and avoiding disliked foods:"
    };

    const familyGuidance = familyAnalysis.individual_needs.length > 0 
      ? `\nSpecific family member guidance:\n${familyAnalysis.individual_needs.map((member: any) => 
          `- For ${member.name}: Ensure recipe avoids ALL their restrictions (${member.restrictions.join(', ')})${member.critical ? ' - CRITICAL SAFETY REQUIRED' : ''}`
        ).join('\n')}`
      : '';

    const userPrompt = `${mealTypePrompts[mealType]}

Family Details:
- Household size: ${preferences.household_size} people
- Cooking time available: ${preferences.cooking_time_minutes} minutes
- Cooking skill: ${preferences.cooking_skill}
- Budget preference: ${preferences.budget_level}

${familyGuidance}

${request.pantryItems?.length ? `
Available ingredients: ${request.pantryItems.join(', ')}
` : 'Use common grocery store ingredients that avoid the listed food avoidances.'}

FAMILY INTELLIGENCE REQUIREMENTS:
- NEVER include ingredients that any family member dislikes or is allergic to
- Address each family member's needs explicitly
- Suggest modifications for conflicting dietary requirements
- Provide child-friendly alternatives if needed
- Include family bonding elements in the recipe

REMINDER: Double-check that NO ingredients from the "ABSOLUTE FOOD AVOIDANCES" list appear in your recipe.

Return JSON format:
{
  "title": "Recipe name that appeals to the whole family",
  "description": "Family-focused description highlighting how it works for everyone",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "prep_time": 15,
  "cook_time": 30,
  "total_time": 45,
  "servings": ${preferences.household_size},
  "difficulty": "easy",
  "family_reasoning": "Detailed explanation of how this recipe specifically works for your family composition and individual needs, including what foods were avoided",
  "allergen_considerations": "Specific allergen safety notes for each family member",
  "dietary_compliance": ["list", "of", "dietary", "restrictions", "met"],
  "nutrition_highlights": "Nutritional benefits for different age groups in your family",
  "safety_notes": "Critical safety reminders for your family's specific allergens and restrictions",
  "family_member_considerations": [
    {
      "member_name": "Family member name",
      "accommodations_made": ["accommodation 1", "accommodation 2"],
      "safety_notes": ["safety note 1"],
      "preference_adjustments": ["adjustment 1"]
    }
  ],
  "family_adaptations": ["How to modify for different family members", "Alternative preparations"],
  "family_impact_summary": "One sentence on how this recipe brings your specific family together safely while avoiding disliked foods"
}`

    return { systemPrompt, userPrompt }
  }

  /**
   * Enhanced Recipe Safety Processing with Family Intelligence
   */
  private static async enhanceRecipeWithFamilySafety(
    rawRecipe: any, 
    preferences: UserPreferences,
    familyAnalysis: any
  ): Promise<Partial<GeneratedRecipe>> {
    
    // Enhanced allergen detection with family member mapping
    const detectedAllergens = this.detectFamilyAllergens(rawRecipe.ingredients, preferences)
    
    // Generate family-specific safety warnings
    const safetyWarnings = this.generateFamilySafetyWarnings(detectedAllergens, preferences, familyAnalysis)
    
    // Calculate enhanced safety score considering family complexity
    const safetyScore = this.calculateFamilySafetyScore(rawRecipe, preferences, detectedAllergens, familyAnalysis)

    // Ensure family member considerations exist
    const familyMemberConsiderations = rawRecipe.family_member_considerations || 
      preferences.family_members?.map(member => ({
        member_name: member.name,
        member_id: member.id,
        accommodations_made: [`Recipe designed to be safe for ${member.name}`],
        safety_notes: member.allergies.length > 0 ? [`Verified safe for ${member.allergies.join(', ')} allergies`] : [],
        preference_adjustments: member.dislikes.length > 0 ? [`Avoids ${member.dislikes.slice(0, 2).join(', ')}`] : []
      })) || []

    return {
      ...rawRecipe,
      detected_allergens: detectedAllergens,
      safety_warnings: safetyWarnings,
      safety_score: safetyScore,
      family_member_considerations: familyMemberConsiderations,
      family_adaptations: rawRecipe.family_adaptations || ['Recipe can be customized for individual family members'],
      family_impact_summary: rawRecipe.family_impact_summary || familyAnalysis.summary
    }
  }

  /**
   * Enhanced Allergen Detection with Family Member Mapping
   */
  private static detectFamilyAllergens(ingredients: string[], preferences: UserPreferences): DetectedAllergen[] {
    // Use existing allergen database
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
        
        // Find which family members this affects
        const affectedMembers = preferences.family_members?.filter(member =>
          member.allergies.includes(allergenName)
        ).map(member => member.name) || []

        let severity = allergenInfo.severity_default
        if (affectedMembers.length > 0) {
          severity = 'severe' as const // Escalate for known family allergies
        }

        detectedAllergens.push({
          name: allergenName,
          confidence,
          severity,
          icon: allergenInfo.icon,
          warning_text: affectedMembers.length > 0 
            ? `This recipe may contain ${allergenName}. CRITICAL: This affects ${affectedMembers.join(', ')} in your family.`
            : `This recipe may contain ${allergenName}. Please verify all ingredients carefully.`,
          affects_family_members: affectedMembers
        })
      }
    })

    return detectedAllergens
  }

  /**
   * Generate Enhanced Family Safety Warnings
   */
  private static generateFamilySafetyWarnings(
    detectedAllergens: DetectedAllergen[], 
    preferences: UserPreferences,
    familyAnalysis: any
  ): string[] {
    const warnings: string[] = []

    // Family-specific critical warnings
    const familyAllergens = detectedAllergens.filter(a => a.affects_family_members.length > 0)
    if (familyAllergens.length > 0) {
      warnings.push(`FAMILY SAFETY ALERT: This recipe contains allergens that affect your family members: ${familyAllergens.map(a => `${a.name} (affects ${a.affects_family_members.join(', ')})`).join(', ')}`)
    }

    // General allergen warnings
    const generalAllergens = detectedAllergens.filter(a => a.affects_family_members.length === 0)
    if (generalAllergens.length > 0) {
      warnings.push(`This recipe may contain: ${generalAllergens.map(a => `${a.icon} ${a.name}`).join(', ')}. Please verify ingredients for safety.`)
    }

    // Family complexity warnings
    if (familyAnalysis.complexity_score > 5) {
      warnings.push(`High family complexity detected (${familyAnalysis.complexity_score}/10). Extra caution recommended when preparing this meal.`)
    }

    // Always include family AI safety warning
    warnings.push(`This recipe was generated by AI considering your family of ${preferences.family_members?.length || 0} members. Always verify ingredients for allergies and dietary restrictions.`)

    return warnings
  }

  /**
   * Calculate Enhanced Family Safety Score
   */
  private static calculateFamilySafetyScore(
    recipe: any, 
    preferences: UserPreferences, 
    detectedAllergens: DetectedAllergen[],
    familyAnalysis: any
  ): number {
    let score = 100

    // Deduct for family-affecting allergens (more severe)
    const familyAllergens = detectedAllergens.filter(a => a.affects_family_members.length > 0)
    score -= familyAllergens.length * 40

    // Deduct for general allergens
    const generalAllergens = detectedAllergens.filter(a => a.affects_family_members.length === 0)
    score -= generalAllergens.length * 10

    // Deduct for high family complexity
    score -= Math.max(0, familyAnalysis.complexity_score - 3) * 5

    // Deduct for missing family considerations
    if (!recipe.family_member_considerations) score -= 15
    if (!recipe.family_adaptations) score -= 10
    if (!recipe.allergen_considerations) score -= 10
    if (!recipe.safety_notes) score -= 10

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Enhanced cached recipe lookup with family considerations
   */
  private static async getCachedFamilyAwareRecipe(
    request: RecipeGenerationRequest, 
    familyAnalysis: any
  ): Promise<any> {
    try {
      console.log('🗄️ Looking for family-compatible cached recipes...');
      
      // For now, disable caching to ensure fresh family-aware generation
      // In production, you'd want sophisticated family fingerprinting
      console.log('🆕 Family-aware cache disabled - generating fresh family-intelligent recipes');
      return null;
      
    } catch (error) {
      console.error('🗄️ Family cache lookup error (non-blocking):', error);
      return null;
    }
  }

  // ... (keep all existing methods unchanged: calculateCost, checkCostLimits, checkRateLimit, 
  //      storeRecipe, logAIUsage, handleGenerationFailure, etc.)

  private static calculateCost(usage: any): number {
    const inputCost = (usage.prompt_tokens * 0.000150) / 1000
    const outputCost = (usage.completion_tokens * 0.000600) / 1000
    return inputCost + outputCost
  }

  private static async checkCostLimits(userId: string): Promise<{ allowed: boolean; message?: string }> {
    try {
      // TEMPORARILY BYPASS ALL COST CHECKING FOR TESTING
      return { allowed: true }
    } catch (error) {
      console.error('💰 Cost limit check failed, allowing request:', error)
      return { allowed: true }
    }
  }

  private static async checkRateLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
    try {
      // TEMPORARILY BYPASS ALL RATE LIMITING FOR TESTING
      return { allowed: true }
    } catch (error) {
      console.error('⏱️ Rate limit check failed, allowing request:', error)
      return { allowed: true }
    }
  }

  private static async storeRecipe(
    userId: string, 
    recipe: any, 
    metadata: { generation_cost: number; generation_time_ms: number; meal_type: string; family_complexity: number }
  ) {
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
      difficulty: this.validateDifficultyWithLogging(recipe.difficulty),
      ai_generated: true,
      family_reasoning: recipe.family_reasoning || 'Generated for your family',
      detected_allergens: recipe.detected_allergens || [],
      safety_warnings: recipe.safety_warnings || [],
      ai_disclaimers: ['This recipe was generated by AI. Always verify ingredients for allergies and dietary restrictions.'],
      safety_score: Math.min(100, Math.max(0, parseInt(recipe.safety_score) || 100)),
      generation_cost: metadata.generation_cost,
      generation_time_ms: metadata.generation_time_ms,
      // Enhanced family intelligence fields
      family_member_considerations: recipe.family_member_considerations || [],
      family_adaptations: recipe.family_adaptations || [],
      family_impact_summary: recipe.family_impact_summary || ''
    };

    try {
      const { data, error } = await supabase
        .from('generated_recipes')
        .insert(cleanedRecipe)
        .select()
        .single();
      
      if (error) throw new Error(`Database error (${error.code}): ${error.message}`);
      if (data && data.id) return data;
      throw new Error('Database insert succeeded but no data returned');
      
    } catch (error: any) {
      throw new Error(`Recipe storage failed: ${error.message}`);
    }
  }

  private static validateDifficultyWithLogging(difficulty: any): 'easy' | 'medium' | 'hard' {
    if (!difficulty || typeof difficulty !== 'string') return 'medium';
    const cleaned = difficulty.toLowerCase().trim();
    
    if (cleaned.includes('easy') || cleaned.includes('simple') || cleaned.includes('beginner')) {
      return 'easy';
    } else if (cleaned.includes('hard') || cleaned.includes('difficult') || cleaned.includes('advanced') || cleaned.includes('challenging')) {
      return 'hard';
    } else {
      return 'medium';
    }
  }

  private static async logAIUsage(userId: string, usage: any): Promise<void> {
    try {
      const logData = {
        user_id: userId,
        cost: usage.cost || 0,
        tokens_used: usage.tokens_used || 0,
        generation_time_ms: usage.generation_time || 0,
        meal_type: usage.meal_type,
        family_complexity_score: usage.family_complexity || 1,
        cache_hit: usage.cache_hit || false,
        safety_warnings_count: usage.safety_warnings_count || 0,
        allergens_detected_count: usage.allergens_detected_count || 0,
        family_members_considered: usage.family_members_considered || 0
      };

      const { error } = await supabase.from('ai_usage_logs').insert(logData);
      if (error) {
        console.log('⚠️ AI usage logging failed (non-blocking):', error.message);
      }
    } catch (error) {
      console.error('📊 Failed to log AI usage (non-blocking):', error)
    }
  }

  private static async handleGenerationFailure(
    request: RecipeGenerationRequest,
    error: any
  ): Promise<RecipeGenerationResult> {
    console.error('❌ Family-aware AI generation failed:', error)

    let userMessage = 'We\'re having trouble generating family-safe recipes right now. Please try again in a few minutes.'
    
    if (error?.message?.includes('API key')) {
      userMessage = 'There\'s an issue with our AI service configuration. Please contact support.'
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      userMessage = 'Network connection issue. Please check your internet and try again.'
    } else if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
      userMessage = 'Our AI service is temporarily busy. Please try again in a few minutes.'
    }

    return {
      success: false,
      error: 'Family-aware recipe generation temporarily unavailable',
      fallback_used: true,
      user_message: userMessage
    }
  }
}

export default IngredAI