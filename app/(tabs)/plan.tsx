// Real Database Test Component for app/(tabs)/plan.tsx
// Replace your current plan.tsx with this temporarily to test database operations

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  timestamp: string;
}

export default function DatabaseTestScreen() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, data?: any) => {
    const result: TestResult = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`${status.toUpperCase()}: ${test} - ${message}`, data);
  };

  // Test 1: User Preferences
  const testUserPreferences = async () => {
    setCurrentTest('Testing User Preferences...');
    
    if (!user?.id) {
      addResult('User Preferences', 'error', 'No authenticated user found');
      return;
    }

    try {
      // Test single query that your meal planning code uses
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          addResult('User Preferences', 'warning', 'No preferences found - user needs setup', { error: error.code });
        } else {
          addResult('User Preferences', 'error', `Query failed: ${error.message}`, { error });
        }
      } else {
        addResult('User Preferences', 'success', 'Preferences loaded successfully', {
          household_size: preferences.household_size,
          cooking_skill: preferences.cooking_skill,
          budget_level: preferences.budget_level,
          meals_per_week: preferences.meals_per_week
        });
      }
    } catch (error) {
      addResult('User Preferences', 'error', `Exception: ${error}`, { error });
    }
  };

  // Test 2: Family Members
  const testFamilyMembers = async () => {
    setCurrentTest('Testing Family Members...');
    
    if (!user?.id) {
      addResult('Family Members', 'error', 'No authenticated user found');
      return;
    }

    try {
      const { data: familyMembers, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        addResult('Family Members', 'error', `Query failed: ${error.message}`, { error });
      } else {
        addResult('Family Members', 'success', `Found ${familyMembers?.length || 0} family members`, {
          count: familyMembers?.length || 0,
          members: familyMembers?.map(m => ({ name: m.name, allergies: m.allergies })) || []
        });
      }
    } catch (error) {
      addResult('Family Members', 'error', `Exception: ${error}`, { error });
    }
  };

  // Test 3: Meal Plans
  const testMealPlans = async () => {
    setCurrentTest('Testing Meal Plans...');
    
    if (!user?.id) {
      addResult('Meal Plans', 'error', 'No authenticated user found');
      return;
    }

    try {
      // Test current week lookup
      const getCurrentWeekStart = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        return monday.toISOString().split('T')[0];
      };

      const weekStart = getCurrentWeekStart();
      
      let { data: mealPlan, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .single();

      if (planError && planError.code === 'PGRST116') {
        // Try to create meal plan
        addResult('Meal Plans', 'warning', 'No meal plan found, attempting to create one');
        
        const { data: newPlan, error: createError } = await supabase
          .from('meal_plans')
          .insert({
            user_id: user.id,
            week_start_date: weekStart,
            auto_generated: true,
          })
          .select()
          .single();

        if (createError) {
          addResult('Meal Plans', 'error', `Failed to create meal plan: ${createError.message}`, { createError });
        } else {
          addResult('Meal Plans', 'success', 'Created new meal plan successfully', {
            id: newPlan.id,
            week_start_date: newPlan.week_start_date
          });
          mealPlan = newPlan;
        }
      } else if (planError) {
        addResult('Meal Plans', 'error', `Query failed: ${planError.message}`, { planError });
      } else {
        addResult('Meal Plans', 'success', 'Found existing meal plan', {
          id: mealPlan.id,
          week_start_date: mealPlan.week_start_date,
          auto_generated: mealPlan.auto_generated
        });
      }

      // Test planned meals if we have a meal plan
      if (mealPlan) {
        const { data: plannedMeals, error: mealsError } = await supabase
          .from('planned_meals')
          .select(`
            *,
            generated_recipes (*)
          `)
          .eq('meal_plan_id', mealPlan.id);

        if (mealsError) {
          addResult('Planned Meals', 'error', `Query failed: ${mealsError.message}`, { mealsError });
        } else {
          addResult('Planned Meals', 'success', `Found ${plannedMeals?.length || 0} planned meals`, {
            count: plannedMeals?.length || 0,
            withRecipes: plannedMeals?.filter(m => m.generated_recipes).length || 0
          });
        }
      }

    } catch (error) {
      addResult('Meal Plans', 'error', `Exception: ${error}`, { error });
    }
  };

  // Test 4: Generated Recipes
  const testGeneratedRecipes = async () => {
    setCurrentTest('Testing Generated Recipes...');
    
    if (!user?.id) {
      addResult('Generated Recipes', 'error', 'No authenticated user found');
      return;
    }

    try {
      const { data: recipes, error } = await supabase
        .from('generated_recipes')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);

      if (error) {
        addResult('Generated Recipes', 'error', `Query failed: ${error.message}`, { error });
      } else {
        addResult('Generated Recipes', 'success', `Found ${recipes?.length || 0} generated recipes`, {
          count: recipes?.length || 0,
          sampleTitles: recipes?.slice(0, 3).map(r => r.title) || []
        });

        // Test JSONB field handling
        if (recipes && recipes.length > 0) {
          const sampleRecipe = recipes[0];
          addResult('JSONB Fields', 'success', 'JSONB fields loaded correctly', {
            hasDetectedAllergens: !!sampleRecipe.detected_allergens,
            allergenType: typeof sampleRecipe.detected_allergens,
            safetyScore: sampleRecipe.safety_score
          });
        }
      }
    } catch (error) {
      addResult('Generated Recipes', 'error', `Exception: ${error}`, { error });
    }
  };

  // Test 5: Complex Join Query
  const testComplexQueries = async () => {
    setCurrentTest('Testing Complex Queries...');
    
    if (!user?.id) {
      addResult('Complex Queries', 'error', 'No authenticated user found');
      return;
    }

    try {
      // Test the exact query pattern from your meal planning code
      const { data: mealPlan } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (mealPlan) {
        const { data: plannedMealsWithRecipes, error } = await supabase
          .from('planned_meals')
          .select(`
            meal_date,
            meal_type,
            generated_recipes (
              id,
              title,
              description,
              prep_time,
              cook_time,
              total_time,
              detected_allergens,
              safety_score
            )
          `)
          .eq('meal_plan_id', mealPlan.id);

        if (error) {
          addResult('Complex Join', 'error', `Join query failed: ${error.message}`, { error });
        } else {
          addResult('Complex Join', 'success', 'Complex join query successful', {
            joinedRecords: plannedMealsWithRecipes?.length || 0,
            hasNestedData: plannedMealsWithRecipes?.some(m => m.generated_recipes) || false
          });
        }
      } else {
        addResult('Complex Join', 'warning', 'No meal plan to test joins with');
      }
    } catch (error) {
      addResult('Complex Queries', 'error', `Exception: ${error}`, { error });
    }
  };

  // Test 6: RLS Policies
  const testRLSPolicies = async () => {
    setCurrentTest('Testing RLS Policies...');
    
    if (!user?.id) {
      addResult('RLS Policies', 'error', 'No authenticated user found');
      return;
    }

    try {
      // Test if we can only see our own data
      const { data: allUserPrefs, error } = await supabase
        .from('user_preferences')
        .select('user_id')
        .limit(10);

      if (error) {
        addResult('RLS Policies', 'error', `RLS test failed: ${error.message}`, { error });
      } else {
        const uniqueUserIds = new Set(allUserPrefs?.map(p => p.user_id) || []);
        const onlyOwnData = uniqueUserIds.size <= 1 && (uniqueUserIds.size === 0 || uniqueUserIds.has(user.id));
        
        addResult('RLS Policies', onlyOwnData ? 'success' : 'warning', 
          onlyOwnData ? 'RLS working correctly - only own data visible' : 'RLS might not be working - seeing other users data', 
          {
            recordsFound: allUserPrefs?.length || 0,
            uniqueUsers: uniqueUserIds.size,
            containsCurrentUser: uniqueUserIds.has(user.id)
          }
        );
      }
    } catch (error) {
      addResult('RLS Policies', 'error', `Exception: ${error}`, { error });
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      await testUserPreferences();
      await testFamilyMembers();
      await testMealPlans();
      await testGeneratedRecipes();
      await testComplexQueries();
      await testRLSPolicies();
      
      addResult('Test Suite', 'success', 'All database tests completed');
    } catch (error) {
      addResult('Test Suite', 'error', `Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // Auto-run tests when component mounts
  useEffect(() => {
    if (user?.id) {
      runAllTests();
    }
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ No authenticated user found</Text>
          <Text style={styles.subText}>Please log in to test database operations</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧪 Database Test Results</Text>
          <Text style={styles.headerSubtitle}>
            Testing user: {user.email}
          </Text>
        </View>

        {/* Test Controls */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, isRunning && styles.buttonDisabled]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? '🔄 Running Tests...' : '🧪 Run All Tests'}
            </Text>
          </TouchableOpacity>
          
          {isRunning && currentTest && (
            <Text style={styles.currentTest}>{currentTest}</Text>
          )}
        </View>

        {/* Test Results */}
        <View style={styles.resultsContainer}>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={[styles.resultStatus, { color: getStatusColor(result.status) }]}>
                  {result.status.toUpperCase()}
                </Text>
              </View>
              
              <Text style={styles.resultMessage}>{result.message}</Text>
              
              {result.data && (
                <View style={styles.resultData}>
                  <Text style={styles.dataLabel}>Data:</Text>
                  <Text style={styles.dataText}>
                    {JSON.stringify(result.data, null, 2)}
                  </Text>
                </View>
              )}
              
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        {testResults.length > 0 && !isRunning && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>📊 Test Summary</Text>
            <Text style={styles.summaryText}>
              ✅ Passed: {testResults.filter(r => r.status === 'success').length} | 
              ⚠️ Warnings: {testResults.filter(r => r.status === 'warning').length} | 
              ❌ Failed: {testResults.filter(r => r.status === 'error').length}
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>🎯 Next Steps:</Text>
          <Text style={styles.instructionsText}>
            1. Check if all tests pass ✅{'\n'}
            2. If user_preferences fails → User needs setup{'\n'}
            3. If RLS warnings → Check policies{'\n'}
            4. If join queries fail → Foreign key issues{'\n'}
            5. If JSONB issues → Check data serialization
          </Text>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentTest: {
    marginTop: 8,
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  resultData: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  resultTime: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  summary: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  instructions: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
  },
});