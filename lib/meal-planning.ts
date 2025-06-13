// lib/meal-planning.ts - Comprehensive meal planning utility functions

import { supabase } from './supabase'

// Type definitions for meal planning system
export interface MealSlot {
  id?: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipe?: SavedRecipe
  isEmpty: boolean
  isLoading: boolean
  lastGenerated?: string
}

export interface SavedRecipe {
  id: string
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
  detected_allergens: DetectedAllergen[]
  safety_warnings: string[]
  safety_score: number
  generation_cost: number
  ai_generated: boolean
  created_at: string
}

export interface DetectedAllergen {
  name: string
  icon: string
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  warning_text: string
}

export interface AllergenInfo {
  icon: string
  commonNames: string[]
}

export interface WeeklyStats {
  totalMeals: number
  completedMeals: number
  completionPercentage: number
  averageSafetyScore: number
  totalEstimatedCost: number
  avgCostPerMeal: number
  savingsVsHelloFresh: number
}

export interface FamilyMember {
  id: string
  name: string
  age_group?: 'child' | 'teen' | 'adult' | 'senior'
  dietary_restrictions?: string[]
  allergies?: string[]
  allergy_severity?: string[]
}

export interface UserPreferences {
  household_size: number
  cooking_skill: 'beginner' | 'intermediate' | 'advanced'
  budget_level: 'budget' | 'moderate' | 'premium'
  cooking_time_minutes: number
  dietary_restrictions?: string[]
  allergies?: string[]
  disliked_ingredients?: string[]
  meals_per_week: number
  family_members?: FamilyMember[]
}

// Date utility functions
export const DateUtils = {
  // Get current week's dates (Monday to Sunday)
  getCurrentWeekDates(): string[] {
    const today = new Date()
    const currentDay = today.getDay()
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDates.push(date.toISOString().split('T')[0])
    }
    
    return weekDates
  },

  // Get week dates starting from a specific date
  getWeekDatesFrom(startDate: string): string[] {
    const start = new Date(startDate)
    const weekDates = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      weekDates.push(date.toISOString().split('T')[0])
    }
    
    return weekDates
  },

  // Format date for display
  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-GB', options)
  },

  // Check if date is today
  isToday(dateString: string): boolean {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  },

  // Check if date is weekend
  isWeekend(dateString: string): boolean {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }
}

// Main meal planning service
export const MealPlanningService = {
  // Create empty meal slots for a week
  createEmptyWeeklyMealSlots(weekDates: string[]): MealSlot[] {
    const mealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner']
    const slots: MealSlot[] = []

    weekDates.forEach(date => {
      mealTypes.forEach(mealType => {
        slots.push({
          id: `${date}-${mealType}`,
          date,
          mealType,
          isEmpty: true,
          isLoading: false
        })
      })
    })

    return slots
  },

  // Load saved meal plan from database
  async loadWeeklyMealPlan(userId: string, weekStartDate: string): Promise<MealSlot[]> {
    try {
      const { data: mealPlan, error: planError } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('week_start_date', weekStartDate)
        .single()

      if (planError || !mealPlan) {
        // No existing meal plan, return empty slots
        return this.createEmptyWeeklyMealSlots(DateUtils.getWeekDatesFrom(weekStartDate))
      }

      // Load planned meals with recipe details
      const { data: plannedMeals, error: mealsError } = await supabase
        .from('planned_meals')
        .select(`
          meal_date,
          meal_type,
          generated_recipes (
            id,
            title,
            description,
            ingredients,
            instructions,
            prep_time,
            cook_time,
            total_time,
            servings,
            difficulty,
            family_reasoning,
            allergen_considerations,
            dietary_compliance,
            nutrition_highlights,
            safety_notes,
            detected_allergens,
            safety_warnings,
            safety_score,
            generation_cost,
            ai_generated,
            created_at
          )
        `)
        .eq('meal_plan_id', mealPlan.id)

      if (mealsError) {
        console.error('Error loading planned meals:', mealsError)
        return this.createEmptyWeeklyMealSlots(DateUtils.getWeekDatesFrom(weekStartDate))
      }

      // Create meal slots with saved recipes
      const weekDates = DateUtils.getWeekDatesFrom(weekStartDate)
      const slots = this.createEmptyWeeklyMealSlots(weekDates)

      // Populate slots with saved meals
      plannedMeals?.forEach(meal => {
        const slotIndex = slots.findIndex(
          slot => slot.date === meal.meal_date && slot.mealType === meal.meal_type
        )
        
        if (slotIndex >= 0 && meal.generated_recipes) {
          // Handle case where generated_recipes might be an array or single object
          const recipe = Array.isArray(meal.generated_recipes) 
            ? meal.generated_recipes[0] 
            : meal.generated_recipes
            
          if (recipe) {
            slots[slotIndex] = {
              ...slots[slotIndex],
              recipe: recipe as SavedRecipe,
              isEmpty: false
            }
          }
        }
      })

      return slots
    } catch (error) {
      console.error('Error loading weekly meal plan:', error)
      return this.createEmptyWeeklyMealSlots(DateUtils.getWeekDatesFrom(weekStartDate))
    }
  },

  // Save a generated recipe to a meal slot
  async saveMealToSlot(
    userId: string, 
    weekStartDate: string, 
    date: string, 
    mealType: string, 
    recipe: SavedRecipe
  ): Promise<boolean> {
    try {
      // Ensure meal plan exists
      let { data: mealPlan, error: planError } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('week_start_date', weekStartDate)
        .single()

      if (planError || !mealPlan) {
        // Create meal plan
        const { data: newMealPlan, error: createError } = await supabase
          .from('meal_plans')
          .insert({
            user_id: userId,
            week_start_date: weekStartDate,
            auto_generated: true,
            generation_cost: recipe.generation_cost || 0.000534,
            family_complexity_score: 1
          })
          .select('id')
          .single()

        if (createError || !newMealPlan) {
          console.error('Error creating meal plan:', createError)
          return false
        }

        mealPlan = newMealPlan
      }

      // Check if planned meal already exists
      const { data: existingMeal } = await supabase
        .from('planned_meals')
        .select('id, recipe_id')
        .eq('meal_plan_id', mealPlan.id)
        .eq('meal_date', date)
        .eq('meal_type', mealType)
        .single()

      if (existingMeal) {
        // Update existing planned meal
        const { error: updateError } = await supabase
          .from('planned_meals')
          .update({
            recipe_id: recipe.id,
            override_applied: true
          })
          .eq('id', existingMeal.id)

        if (updateError) {
          console.error('Error updating planned meal:', updateError)
          return false
        }
      } else {
        // Create new planned meal
        const { error: insertError } = await supabase
          .from('planned_meals')
          .insert({
            meal_plan_id: mealPlan.id,
            recipe_id: recipe.id,
            meal_date: date,
            meal_type: mealType,
            special_occasion: false,
            override_applied: false
          })

        if (insertError) {
          console.error('Error creating planned meal:', insertError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error saving meal to slot:', error)
      return false
    }
  },

  // Remove a meal from a slot
  async removeMealFromSlot(
    userId: string,
    weekStartDate: string,
    date: string,
    mealType: string
  ): Promise<boolean> {
    try {
      const { data: mealPlan } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('week_start_date', weekStartDate)
        .single()

      if (!mealPlan) return false

      const { error } = await supabase
        .from('planned_meals')
        .delete()
        .eq('meal_plan_id', mealPlan.id)
        .eq('meal_date', date)
        .eq('meal_type', mealType)

      if (error) {
        console.error('Error removing meal:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error removing meal from slot:', error)
      return false
    }
  },

  // Calculate weekly statistics
  calculateWeeklyStats(mealSlots: MealSlot[]): WeeklyStats {
    const totalMeals = mealSlots.length
    const completedMeals = mealSlots.filter(slot => !slot.isEmpty).length
    const completionPercentage = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0

    const recipesWithSafety = mealSlots
      .filter(slot => slot.recipe?.safety_score)
      .map(slot => slot.recipe!)

    const averageSafetyScore = recipesWithSafety.length > 0
      ? recipesWithSafety.reduce((sum, recipe) => sum + recipe.safety_score, 0) / recipesWithSafety.length
      : 100

    const totalEstimatedCost = mealSlots
      .filter(slot => slot.recipe?.generation_cost)
      .reduce((sum, slot) => sum + (slot.recipe!.generation_cost || 0), 0)

    const avgCostPerMeal = completedMeals > 0 ? totalEstimatedCost / completedMeals : 0

    // HelloFresh average cost per serving is £8-12, let's use £10 for comparison
    const helloFreshWeeklyCost = totalMeals * 10
    const estimatedWeeklyCost = totalMeals * 3 // Estimated £3 per meal for home cooking
    const savingsVsHelloFresh = helloFreshWeeklyCost - estimatedWeeklyCost

    return {
      totalMeals,
      completedMeals,
      completionPercentage,
      averageSafetyScore,
      totalEstimatedCost,
      avgCostPerMeal,
      savingsVsHelloFresh
    }
  }
}

// Safety and allergen utilities
export const SafetyUtils = {
  // Common allergen database
  allergenDatabase: {
    dairy: { icon: '🥛', commonNames: ['milk', 'cheese', 'butter', 'cream', 'yogurt'] },
    nuts: { icon: '🥜', commonNames: ['peanut', 'almond', 'walnut', 'cashew', 'pecan'] },
    tree_nuts: { icon: '🌰', commonNames: ['almond', 'walnut', 'cashew', 'pecan', 'hazelnut'] },
    gluten: { icon: '🌾', commonNames: ['wheat', 'flour', 'bread', 'pasta', 'barley'] },
    shellfish: { icon: '🦐', commonNames: ['shrimp', 'crab', 'lobster', 'prawn', 'crawfish'] },
    fish: { icon: '🐟', commonNames: ['salmon', 'tuna', 'cod', 'halibut', 'anchovy'] },
    eggs: { icon: '🥚', commonNames: ['egg', 'eggs', 'albumin', 'mayonnaise'] },
    soy: { icon: '🫘', commonNames: ['soy', 'tofu', 'tempeh', 'edamame', 'miso'] }
  } as Record<string, AllergenInfo>,

  // Detect allergens in recipe ingredients
  detectAllergens(ingredients: string[], userAllergens: string[] = []): DetectedAllergen[] {
    const detectedAllergens: DetectedAllergen[] = []
    const ingredientText = ingredients.join(' ').toLowerCase()

    Object.entries(this.allergenDatabase).forEach(([allergenName, allergenInfo]) => {
      const typedAllergenInfo = allergenInfo as AllergenInfo
      const matchedIngredients = typedAllergenInfo.commonNames.filter(name =>
        ingredientText.includes(name.toLowerCase())
      )

      if (matchedIngredients.length > 0) {
        const severity = userAllergens.includes(allergenName) ? 'life_threatening' : 'moderate'
        
        detectedAllergens.push({
          name: allergenName,
          icon: typedAllergenInfo.icon,
          severity,
          warning_text: `This recipe contains ${allergenName}. ${severity === 'life_threatening' ? 'CRITICAL: This is a known allergen for this family.' : 'Please verify ingredients carefully.'}`
        })
      }
    })

    return detectedAllergens
  },

  // Generate safety warnings for family
  generateSafetyWarnings(detectedAllergens: DetectedAllergen[], familyMembers: FamilyMember[] = []): string[] {
    const warnings: string[] = []

    // Critical allergen warnings
    const criticalAllergens = detectedAllergens.filter(a => a.severity === 'life_threatening')
    if (criticalAllergens.length > 0) {
      warnings.push(`⚠️ CRITICAL: This recipe contains allergens dangerous for family members: ${criticalAllergens.map(a => a.name).join(', ')}`)
    }

    // General allergen warnings
    const generalAllergens = detectedAllergens.filter(a => a.severity !== 'life_threatening')
    if (generalAllergens.length > 0) {
      warnings.push(`This recipe may contain: ${generalAllergens.map(a => `${a.icon} ${a.name}`).join(', ')}`)
    }

    // Family-specific warnings
    familyMembers.forEach(member => {
      if (member.allergies && member.allergies.length > 0) {
        const memberAllergens = detectedAllergens.filter(a => member.allergies!.includes(a.name))
        if (memberAllergens.length > 0) {
          warnings.push(`⚠️ ${member.name}: Contains their known allergens (${memberAllergens.map(a => a.name).join(', ')})`)
        }
      }
    })

    // Always include general AI safety warning
    warnings.push('🧠 AI-generated recipe - please verify all ingredients for allergies and dietary requirements')

    return warnings
  },

  // Calculate overall safety score
  calculateSafetyScore(detectedAllergens: DetectedAllergen[], hasWarnings: boolean = false): number {
    let score = 100

    // Deduct for allergens
    const criticalAllergens = detectedAllergens.filter(a => a.severity === 'life_threatening')
    score -= criticalAllergens.length * 30

    const moderateAllergens = detectedAllergens.filter(a => a.severity === 'moderate')
    score -= moderateAllergens.length * 10

    // Deduct for missing safety considerations
    if (hasWarnings) score -= 5

    return Math.max(0, Math.min(100, score))
  },

  // Get safety color based on score
  getSafetyColor(score: number): string {
    if (score >= 90) return '#10B981' // Green
    if (score >= 70) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }
}

// Cost analysis utilities
export const CostAnalysis = {
  // Calculate estimated meal cost
  calculateMealCost(servings: number, ingredients: string[]): number {
    // Simplified cost calculation - in production would use ingredient database
    const baseCostPerServing = 2.5 // £2.50 per serving estimate
    const ingredientMultiplier = Math.min(ingredients.length / 10, 1.5) // More ingredients = slightly higher cost
    
    return servings * baseCostPerServing * ingredientMultiplier
  },

  // Calculate weekly cost comparison
  calculateWeeklySavings(mealSlots: MealSlot[]): {
    homeCookingCost: number
    helloFreshCost: number
    gustoCost: number
    savings: number
    savingsPercentage: number
  } {
    const completedMeals = mealSlots.filter(slot => !slot.isEmpty).length
    
    // Cost estimates (per serving)
    const homeCookingPerMeal = 3.00 // £3 per meal
    const helloFreshPerMeal = 10.00 // £10 per meal
    const gustoPerMeal = 9.50 // £9.50 per meal
    
    const homeCookingCost = completedMeals * homeCookingPerMeal
    const helloFreshCost = completedMeals * helloFreshPerMeal
    const gustoCost = completedMeals * gustoPerMeal
    
    const savings = helloFreshCost - homeCookingCost
    const savingsPercentage = helloFreshCost > 0 ? (savings / helloFreshCost) * 100 : 0
    
    return {
      homeCookingCost,
      helloFreshCost,
      gustoCost,
      savings,
      savingsPercentage
    }
  },

  // Format cost for display
  formatCost(amount: number): string {
    return `£${amount.toFixed(2)}`
  },

  // Calculate annual savings projection
  calculateAnnualSavings(weeklySavings: number): number {
    return weeklySavings * 52 // 52 weeks per year
  }
}