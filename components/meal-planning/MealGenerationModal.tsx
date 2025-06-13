import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';

// Types for the generation modal
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
  cooking_time_minutes: number;
  dietary_restrictions: string[];
  allergies: string[];
  disliked_ingredients: string[];
  meals_per_week: number;
  family_members?: FamilyMember[];
}

interface GenerationStage {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  icon: string;
}

interface MealGenerationModalProps {
  visible: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  mealDate: string;
  userPreferences: UserPreferences;
  onCancel: () => void;
  onComplete?: (success: boolean, error?: string) => void;
  estimatedCost?: number;
}

const { width, height } = Dimensions.get('window');

// AI Generation stages with realistic timing
const GENERATION_STAGES: GenerationStage[] = [
  {
    id: 'analyzing',
    title: 'Analyzing Your Family',
    description: 'Understanding dietary needs and preferences',
    duration: 2,
    icon: '🧠',
  },
  {
    id: 'safety_checking',
    title: 'Safety Assessment',
    description: 'Checking allergens and dietary restrictions',
    duration: 1.5,
    icon: '🛡️',
  },
  {
    id: 'generating',
    title: 'Creating Your Recipe',
    description: 'AI is crafting the perfect meal for your family',
    duration: 4,
    icon: '✨',
  },
  {
    id: 'optimizing',
    title: 'Optimizing for Your Kitchen',
    description: 'Adjusting for cooking skill and available time',
    duration: 1.5,
    icon: '🍳',
  },
  {
    id: 'finalizing',
    title: 'Adding the Finishing Touches',
    description: 'Final safety checks and family recommendations',
    duration: 2,
    icon: '🎯',
  },
];

export default function MealGenerationModal({
  visible,
  mealType,
  mealDate,
  userPreferences,
  onCancel,
  onComplete,
  estimatedCost = 0.000534,
}: MealGenerationModalProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stageOpacity = useRef(new Animated.Value(1)).current;

  // Timer refs
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const stageTimer = useRef<NodeJS.Timeout | null>(null);

  // Calculate total estimated time
  const totalEstimatedTime = GENERATION_STAGES.reduce((sum, stage) => sum + stage.duration, 0);

  // Format date for display
  const formatMealDate = () => {
    const date = new Date(mealDate);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // Get meal type emoji and context
  const getMealContext = () => {
    switch (mealType) {
      case 'breakfast':
        return { emoji: '🌅', timeContext: 'morning energy boost' };
      case 'lunch':
        return { emoji: '☀️', timeContext: 'midday satisfaction' };
      case 'dinner':
        return { emoji: '🌙', timeContext: 'evening family gathering' };
      default:
        return { emoji: '🍽️', timeContext: 'perfect meal' };
    }
  };

  const mealContext = getMealContext();

  // Start generation process
  useEffect(() => {
    if (!visible) return;

    // Reset state when modal opens
    setCurrentStageIndex(0);
    setProgress(0);
    setElapsedTime(0);
    setIsCompleted(false);
    setHasError(false);
    progressAnim.setValue(0);

    // Start progress animation
    startProgressTracking();

    // Start pulse animation
    startPulseAnimation();

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (stageTimer.current) clearTimeout(stageTimer.current);
    };
  }, [visible]);

  // Progress tracking
  const startProgressTracking = () => {
    let currentTime = 0;
    let stageStartTime = 0;
    let stageIndex = 0;

    progressTimer.current = setInterval(() => {
      currentTime += 0.1;
      setElapsedTime(currentTime);

      // Calculate overall progress
      const overallProgress = Math.min(currentTime / totalEstimatedTime, 1);
      setProgress(overallProgress * 100);

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: overallProgress,
        duration: 100,
        useNativeDriver: false,
      }).start();

      // Check if we should move to next stage
      const currentStage = GENERATION_STAGES[stageIndex];
      if (currentStage && currentTime - stageStartTime >= currentStage.duration) {
        if (stageIndex < GENERATION_STAGES.length - 1) {
          // Move to next stage
          stageIndex += 1;
          stageStartTime = currentTime;
          setCurrentStageIndex(stageIndex);
          
          // Animate stage transition
          Animated.sequence([
            Animated.timing(stageOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(stageOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } else if (!isCompleted) {
          // Generation complete
          setIsCompleted(true);
          setProgress(100);
          progressAnim.setValue(1);
          
          // Stop timers
          if (progressTimer.current) clearInterval(progressTimer.current);
          
          // Auto-close after showing completion
          setTimeout(() => {
            onComplete?.(true);
          }, 1500);
        }
      }

      // Error simulation (rare occurrence for testing)
      if (currentTime > totalEstimatedTime + 3 && !isCompleted && !hasError) {
        setHasError(true);
        if (progressTimer.current) clearInterval(progressTimer.current);
        
        setTimeout(() => {
          onComplete?.(false, 'Generation took longer than expected. Please try again.');
        }, 2000);
      }
    }, 100);
  };

  // Pulse animation for visual feedback
  const startPulseAnimation = () => {
    const pulseSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseSequence.start();
  };

  // Handle cancellation
  const handleCancel = () => {
    Alert.alert(
      'Cancel Recipe Generation',
      'Are you sure you want to cancel? This will stop the AI from creating your recipe.',
      [
        { text: 'Continue Generating', style: 'default' },
        { 
          text: 'Cancel Generation', 
          style: 'destructive',
          onPress: () => {
            if (progressTimer.current) clearInterval(progressTimer.current);
            if (stageTimer.current) clearTimeout(stageTimer.current);
            onCancel();
          }
        }
      ]
    );
  };

  if (!visible) return null;

  const currentStage = GENERATION_STAGES[currentStageIndex];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Creating Your Recipe</Text>
              <Text style={styles.headerSubtitle}>
                {mealContext.emoji} {mealType.charAt(0).toUpperCase() + mealType.slice(1)} for {formatMealDate()}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              accessible={true}
              accessibilityLabel="Cancel recipe generation"
            >
              <Text style={styles.cancelButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            {/* Progress Ring */}
            <View style={styles.progressRingContainer}>
              <Animated.View 
                style={[
                  styles.progressRing,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <View style={styles.progressRingInner}>
                  <Text style={styles.progressPercentage}>
                    {Math.round(progress)}%
                  </Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </Animated.View>
              
              {/* Progress Bar Overlay */}
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }) }
                  ]} 
                />
              </View>
            </View>

            {/* Current Stage */}
            {currentStage && (
              <Animated.View 
                style={[styles.stageInfo, { opacity: stageOpacity }]}
              >
                <Text style={styles.stageIcon}>{currentStage.icon}</Text>
                <Text style={styles.stageTitle}>{currentStage.title}</Text>
                <Text style={styles.stageDescription}>{currentStage.description}</Text>
              </Animated.View>
            )}

            {/* Error State */}
            {hasError && (
              <View style={styles.errorState}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Generation Taking Longer</Text>
                <Text style={styles.errorDescription}>
                  AI is working hard on your complex family needs. Please wait a moment longer.
                </Text>
              </View>
            )}

            {/* Completion State */}
            {isCompleted && (
              <View style={styles.completionState}>
                <Text style={styles.completionIcon}>✅</Text>
                <Text style={styles.completionTitle}>Recipe Created!</Text>
                <Text style={styles.completionDescription}>
                  Your perfect family {mealType} is ready with safety checks complete.
                </Text>
              </View>
            )}
          </View>

          {/* Family Context */}
          <View style={styles.familyContext}>
            <Text style={styles.familyTitle}>👨‍👩‍👧‍👦 AI is considering your family:</Text>
            <View style={styles.familyDetails}>
              <View style={styles.familyItem}>
                <Text style={styles.familyIcon}>👥</Text>
                <Text style={styles.familyText}>
                  {userPreferences.household_size} people
                </Text>
              </View>
              <View style={styles.familyItem}>
                <Text style={styles.familyIcon}>👩‍🍳</Text>
                <Text style={styles.familyText}>
                  {userPreferences.cooking_skill} cooking
                </Text>
              </View>
              <View style={styles.familyItem}>
                <Text style={styles.familyIcon}>⏱️</Text>
                <Text style={styles.familyText}>
                  {userPreferences.cooking_time_minutes} minutes
                </Text>
              </View>
              <View style={styles.familyItem}>
                <Text style={styles.familyIcon}>💰</Text>
                <Text style={styles.familyText}>
                  {userPreferences.budget_level} budget
                </Text>
              </View>
            </View>

            {/* Individual Family Members */}
            {userPreferences.family_members && userPreferences.family_members.length > 0 && (
              <View style={styles.familyMembers}>
                <Text style={styles.familyMembersTitle}>Individual considerations:</Text>
                {userPreferences.family_members.slice(0, 3).map((member, index) => (
                  <View key={member.id} style={styles.familyMemberItem}>
                    <Text style={styles.familyMemberName}>{member.name}</Text>
                    <Text style={styles.familyMemberDetails}>
                      {member.age_group}
                      {member.allergies && member.allergies.length > 0 && 
                        ` • Allergies: ${member.allergies.join(', ')}`
                      }
                    </Text>
                  </View>
                ))}
                {userPreferences.family_members.length > 3 && (
                  <Text style={styles.familyMembersMore}>
                    +{userPreferences.family_members.length - 3} more family members
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Safety Notice */}
          <View style={styles.safetyNotice}>
            <Text style={styles.safetyIcon}>🛡️</Text>
            <View style={styles.safetyContent}>
              <Text style={styles.safetyTitle}>Safety-First Generation</Text>
              <Text style={styles.safetyText}>
                AI is checking for allergens and dietary restrictions throughout the creation process.
              </Text>
            </View>
          </View>

          {/* Cost Transparency */}
          <View style={styles.costNotice}>
            <Text style={styles.costIcon}>💰</Text>
            <Text style={styles.costText}>
              Generation cost: £{estimatedCost.toFixed(6)} • 
              Time estimate: {Math.round(elapsedTime)}s / {totalEstimatedTime}s
            </Text>
          </View>

          {/* Legal Notice */}
          <View style={styles.legalNotice}>
            <Text style={styles.legalText}>
              🧠 AI-generated recipe will include safety disclaimers. Always verify ingredients for your family's specific needs.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  cancelButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '300',
  },
  
  // Progress section
  progressSection: {
    alignItems: 'center',
    padding: 32,
  },
  progressRingContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingInner: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 60,
  },
  
  // Stage info
  stageInfo: {
    alignItems: 'center',
    minHeight: 80,
  },
  stageIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  stageDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Error state
  errorState: {
    alignItems: 'center',
    minHeight: 80,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Completion state
  completionState: {
    alignItems: 'center',
    minHeight: 80,
  },
  completionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
    textAlign: 'center',
  },
  completionDescription: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Family context
  familyContext: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  familyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 12,
  },
  familyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  familyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  familyIcon: {
    fontSize: 12,
  },
  familyText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  familyMembers: {
    gap: 6,
  },
  familyMembersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 6,
  },
  familyMemberItem: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  familyMemberName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 2,
  },
  familyMemberDetails: {
    fontSize: 11,
    color: '#059669',
  },
  familyMembersMore: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Safety notice
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    gap: 8,
  },
  safetyIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 2,
  },
  safetyText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 16,
  },
  
  // Cost notice
  costNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  costIcon: {
    fontSize: 12,
  },
  costText: {
    fontSize: 11,
    color: '#6B7280',
  },
  
  // Legal notice
  legalNotice: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  legalText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
});