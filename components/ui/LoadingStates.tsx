import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

// Types for loading states
interface LoadingStatesProps {
  type?: 'recipe-generation' | 'saving' | 'loading' | 'processing' | 'ai-thinking';
  title?: string;
  subtitle?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

interface GenerationStage {
  icon: string;
  title: string;
  subtitle: string;
  duration: number; // seconds
}

export default function LoadingStates({
  type = 'loading',
  title,
  subtitle,
  progress = 0,
  showProgress = false,
  animated = true,
  size = 'medium',
  style,
}: LoadingStatesProps) {
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stageTransitionAnim = useRef(new Animated.Value(1)).current;
  const stageIndex = useRef(0);
  const [currentStage, setCurrentStage] = React.useState(0);
  const [currentProgress, setCurrentProgress] = React.useState(0);

  // Refined recipe generation stages - focused on clarity
  const generationStages: GenerationStage[] = [
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Analyzing Your Family',
      subtitle: 'Understanding dietary needs and preferences',
      duration: 2.5,
    },
    {
      icon: '🛡️',
      title: 'Safety Assessment',
      subtitle: 'Checking allergens and dietary restrictions',
      duration: 2,
    },
    {
      icon: '👨‍🍳',
      title: 'Creating Your Recipe',
      subtitle: 'Crafting a delicious and nutritious meal',
      duration: 4,
    },
    {
      icon: '⚙️',
      title: 'Optimizing for Your Kitchen',
      subtitle: 'Adjusting for your cooking skill and time',
      duration: 2,
    },
    {
      icon: '✅',
      title: 'Final Safety Checks',
      subtitle: 'Ensuring everything is perfect for your family',
      duration: 1.5,
    }
  ];

  // Subtle entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  // Recipe generation stage progression with smooth transitions
  useEffect(() => {
    if (type === 'recipe-generation') {
      const totalDuration = generationStages.reduce((sum, stage) => sum + stage.duration, 0);
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += 0.1;
        const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
        
        // Update current stage with smooth transitions
        let cumulativeDuration = 0;
        for (let i = 0; i < generationStages.length; i++) {
          cumulativeDuration += generationStages[i].duration;
          if (elapsed <= cumulativeDuration) {
            if (stageIndex.current !== i) {
              stageIndex.current = i;
              
              // Smooth stage transition
              Animated.sequence([
                Animated.timing(stageTransitionAnim, {
                  toValue: 0.8,
                  duration: 150,
                  useNativeDriver: true,
                }),
                Animated.timing(stageTransitionAnim, {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
                }),
              ]).start();
              
              setCurrentStage(i);
            }
            break;
          }
        }

        setCurrentProgress(Math.round(progressPercent));

        // Smooth progress animation
        Animated.timing(progressAnim, {
          toValue: progressPercent / 100,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();

        if (elapsed >= totalDuration) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [type]);

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          containerPadding: 20,
          iconSize: 32,
          titleSize: 16,
          subtitleSize: 13,
          indicatorSize: 'small' as const,
        };
      case 'large':
        return {
          containerPadding: 40,
          iconSize: 48,
          titleSize: 24,
          subtitleSize: 16,
          indicatorSize: 'large' as const,
        };
      default:
        return {
          containerPadding: 32,
          iconSize: 40,
          titleSize: 20,
          subtitleSize: 15,
          indicatorSize: 'small' as const,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Get type-specific content - NO override for recipe-generation
  const getTypeContent = () => {
    switch (type) {
      case 'recipe-generation':
        const stage = generationStages[currentStage] || generationStages[0];
        return {
          icon: stage.icon,
          // IMPORTANT: Don't use title/subtitle props for recipe-generation to allow dynamic content
          title: stage.title,
          subtitle: stage.subtitle,
        };
      case 'ai-thinking':
        return {
          icon: '🧠',
          title: title || 'AI is thinking...',
          subtitle: subtitle || 'Processing your request',
        };
      case 'saving':
        return {
          icon: '💾',
          title: title || 'Saving Your Preferences',
          subtitle: subtitle || 'Securing your information',
        };
      case 'processing':
        return {
          icon: '⚙️',
          title: title || 'Processing...',
          subtitle: subtitle || 'Working on your request',
        };
      default:
        return {
          icon: '⏳',
          title: title || 'Loading...',
          subtitle: subtitle || 'Please wait',
        };
    }
  };

  const typeContent = getTypeContent();

  return (
    <Animated.View style={[
      styles.container,
      {
        padding: sizeStyles.containerPadding,
        opacity: fadeAnim,
        transform: [{ scale: stageTransitionAnim }],
      },
      style
    ]}>
      {/* Clean, minimal content */}
      <View style={styles.content}>
        {/* Refined icon display */}
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { fontSize: sizeStyles.iconSize }]}>
            {typeContent.icon}
          </Text>
        </View>

        {/* Premium typography */}
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            { fontSize: sizeStyles.titleSize }
          ]}>
            {typeContent.title}
          </Text>
          {typeContent.subtitle && (
            <Text style={[
              styles.subtitle,
              { fontSize: sizeStyles.subtitleSize }
            ]}>
              {typeContent.subtitle}
            </Text>
          )}
        </View>

        {/* Subtle activity indicator */}
        <View style={styles.indicatorContainer}>
          <ActivityIndicator 
            size={sizeStyles.indicatorSize} 
            color="#6B7280"
          />
        </View>
      </View>

      {/* Clean progress bar */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {type === 'recipe-generation' ? currentProgress : Math.round(progress)}%
          </Text>
        </View>
      )}

      {/* Minimal stage indicators */}
      {type === 'recipe-generation' && (
        <View style={styles.stagesContainer}>
          <View style={styles.stagesIndicator}>
            {generationStages.map((stage, index) => (
              <View
                key={index}
                style={[
                  styles.stageIndicator,
                  index <= currentStage && styles.stageIndicatorActive,
                  index === currentStage && styles.stageIndicatorCurrent,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stageText}>
            Step {currentStage + 1} of {generationStages.length}
          </Text>
        </View>
      )}

      {/* Subtle safety notice */}
      {type === 'recipe-generation' && (
        <View style={styles.safetyNotice}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <Text style={styles.safetyText}>
            AI is performing comprehensive safety checks for your family
          </Text>
        </View>
      )}

      {/* Time estimate */}
      {(type === 'recipe-generation' || type === 'ai-thinking') && (
        <View style={styles.timeEstimate}>
          <Text style={styles.timeText}>
            Usually takes 8-12 seconds
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Clean content layout
  content: {
    alignItems: 'center',
    gap: 20,
  },
  
  iconContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  icon: {
    textAlign: 'center',
  },
  
  textContainer: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 300,
  },
  
  title: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '400',
  },
  
  indicatorContainer: {
    marginTop: 8,
  },

  // Refined progress bar
  progressContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Minimal stage indicators
  stagesContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  
  stagesIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  
  stageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  
  stageIndicatorActive: {
    backgroundColor: '#8B5CF6',
  },
  
  stageIndicatorCurrent: {
    backgroundColor: '#8B5CF6',
    transform: [{ scale: 1.25 }],
  },
  
  stageText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // Subtle safety notice
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  
  safetyIcon: {
    fontSize: 16,
  },
  
  safetyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
    fontWeight: '400',
  },

  // Refined time estimate
  timeEstimate: {
    marginTop: 16,
  },
  
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '400',
  },
});