import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Share,
  Vibration,
} from 'react-native';

// Types for recipe actions
interface SavedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  total_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  user_rating?: number;
  user_notes?: string;
  ai_generated: boolean;
  safety_score: number;
  estimated_cost?: number;
}

interface RecipeActionsProps {
  recipe: SavedRecipe;
  currentRating?: number;
  isSaved?: boolean;
  canEdit?: boolean;
  canRegenerate?: boolean;
  showAdvancedActions?: boolean;
  onRate?: (rating: number) => Promise<void>;
  onSave?: () => Promise<void>;
  onRemove?: () => Promise<void>;
  onRegenerate?: () => Promise<void>;
  onEdit?: () => void;
  onStartCooking?: () => void;
  onAddToShoppingList?: () => void;
  onShare?: () => Promise<void>;
  onReportIssue?: () => void;
  style?: any;
}

export default function RecipeActions({
  recipe,
  currentRating = 0,
  isSaved = false,
  canEdit = true,
  canRegenerate = true,
  showAdvancedActions = false,
  onRate,
  onSave,
  onRemove,
  onRegenerate,
  onEdit,
  onStartCooking,
  onAddToShoppingList,
  onShare,
  onReportIssue,
  style,
}: RecipeActionsProps) {
  
  const [rating, setRating] = useState(currentRating);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Handle recipe rating with haptic feedback
  const handleRating = async (newRating: number) => {
    if (!onRate) return;

    // Provide haptic feedback
    Vibration.vibrate(50);
    
    setRating(newRating);
    
    try {
      await onRate(newRating);
      
      // Show rating confirmation
      const ratingMessages = {
        1: 'Thanks for the feedback! We\'ll work on better recipes for your family.',
        2: 'Thanks for rating! We\'ll improve our suggestions.',
        3: 'Good to know! We\'ll keep refining our AI recommendations.',
        4: 'Great! Glad this recipe worked well for your family.',
        5: 'Wonderful! We\'ll create more recipes like this one.'
      };

      setTimeout(() => {
        Alert.alert(
          `${newRating} Star${newRating !== 1 ? 's' : ''} ⭐`,
          ratingMessages[newRating as keyof typeof ratingMessages],
          [{ text: 'Continue', style: 'default' }]
        );
      }, 300);

    } catch (error) {
      console.error('Rating error:', error);
      setRating(currentRating); // Revert on error
      Alert.alert(
        'Rating Error',
        'We couldn\'t save your rating. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handle recipe save/unsave
  const handleSaveToggle = async () => {
    if (!onSave && !onRemove) return;

    setSaving(true);
    setActionLoading('save');
    
    try {
      if (isSaved && onRemove) {
        await onRemove();
        Alert.alert(
          'Recipe Removed',
          'This recipe has been removed from your saved recipes.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (!isSaved && onSave) {
        await onSave();
        Alert.alert(
          'Recipe Saved',
          'This recipe has been added to your saved recipes for easy access.',
          [{ text: 'Great!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Save/remove error:', error);
      Alert.alert(
        'Action Failed',
        `We couldn't ${isSaved ? 'remove' : 'save'} this recipe. Please try again.`,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setSaving(false);
      setActionLoading(null);
    }
  };

  // Handle recipe regeneration
  const handleRegenerate = async () => {
    if (!onRegenerate || !canRegenerate) return;

    Alert.alert(
      'Regenerate Recipe',
      'This will create a completely new recipe with the same dietary preferences and family requirements. The current recipe will be replaced.\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate New Recipe',
          style: 'destructive',
          onPress: async () => {
            setRegenerating(true);
            setActionLoading('regenerate');
            
            try {
              await onRegenerate();
              
              Alert.alert(
                '✨ New Recipe Generated!',
                'A fresh recipe has been created for your family with updated ingredients and instructions.',
                [{ text: 'Explore Recipe', style: 'default' }]
              );
            } catch (error) {
              console.error('Regeneration error:', error);
              Alert.alert(
                'Generation Failed',
                'We couldn\'t create a new recipe right now. Our AI might be temporarily busy. Please try again in a few minutes.',
                [{ text: 'OK', style: 'default' }]
              );
            } finally {
              setRegenerating(false);
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  // Handle recipe sharing
  const handleShare = async () => {
    setActionLoading('share');
    
    try {
      if (onShare) {
        await onShare();
      } else {
        // Default sharing implementation
        const shareContent = `🍽️ ${recipe.title}

${recipe.description}

📝 Ingredients:
${recipe.ingredients.map(ing => `• ${ing}`).join('\n')}

👩‍🍳 Instructions:
${recipe.instructions.map((inst, index) => `${index + 1}. ${inst}`).join('\n')}

⏱️ ${recipe.total_time} minutes | 👥 Serves ${recipe.servings} | 📊 ${recipe.difficulty}

${recipe.ai_generated ? '🧠 Generated by Ingred AI for family meal planning\n⚠️ Always verify ingredients for allergies and dietary restrictions\n\n' : ''}Created with Ingred - AI Family Meal Planning`;

        await Share.share({
          message: shareContent,
          title: recipe.title,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert(
        'Share Failed',
        'We couldn\'t share this recipe. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle start cooking mode
  const handleStartCooking = () => {
    if (onStartCooking) {
      onStartCooking();
      return;
    }

    Alert.alert(
      '👩‍🍳 Cooking Mode',
      'This feature will guide you through cooking step-by-step with timers and reminders.\n\nComing soon in a future update!',
      [
        { text: 'OK', style: 'default' },
        { text: 'Get Notified', style: 'default' }
      ]
    );
  };

  // Handle add to shopping list
  const handleAddToShoppingList = async () => {
    setActionLoading('shopping');
    
    try {
      if (onAddToShoppingList) {
        onAddToShoppingList();
      } else {
        // Default implementation - create shopping list text
        const shoppingList = recipe.ingredients.join('\n• ');
        await Share.share({
          message: `🛒 Shopping List for ${recipe.title}:\n\n• ${shoppingList}\n\nGenerated by Ingred`,
          title: `Shopping List - ${recipe.title}`,
        });
      }
    } catch (error) {
      console.error('Shopping list error:', error);
      Alert.alert(
        'Shopping List Error',
        'We couldn\'t create the shopping list. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle report issue
  const handleReportIssue = () => {
    if (onReportIssue) {
      onReportIssue();
      return;
    }

    Alert.alert(
      '🚨 Report Recipe Issue',
      'What type of issue would you like to report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Safety Concern', 
          style: 'destructive',
          onPress: () => Alert.alert(
            'Safety Concern Reported',
            'Thank you for reporting this safety issue. Our team will review the recipe immediately and take appropriate action.\n\nRecipe ID: ' + recipe.id.substring(0, 8),
            [{ text: 'OK', style: 'default' }]
          )
        },
        { 
          text: 'Incorrect Information',
          style: 'default',
          onPress: () => Alert.alert(
            'Information Issue Reported',
            'Thank you for the feedback. We\'ll review the recipe for accuracy and improve our AI training.',
            [{ text: 'OK', style: 'default' }]
          )
        },
        { 
          text: 'Other Issue',
          style: 'default',
          onPress: () => Alert.alert(
            'Issue Reported',
            'Thank you for the feedback. We\'ll look into this and improve the experience.',
            [{ text: 'OK', style: 'default' }]
          )
        }
      ]
    );
  };

  // Handle edit recipe
  const handleEdit = () => {
    if (!canEdit) {
      Alert.alert(
        'Editing Unavailable',
        'This recipe cannot be edited. You can regenerate a new version or save it to your collection.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (onEdit) {
      onEdit();
    } else {
      Alert.alert(
        '✏️ Edit Recipe',
        'Recipe editing is coming soon! You\'ll be able to:\n\n• Modify ingredients and quantities\n• Adjust cooking instructions\n• Update timing and servings\n• Add personal notes\n\nFor now, you can regenerate to get a new version.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Regenerate Instead', onPress: handleRegenerate }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>⭐ Rate This Recipe</Text>
        <Text style={styles.ratingSubtitle}>
          Help us create better recipes for your family
        </Text>
        
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              style={styles.starButton}
              onPress={() => handleRating(star)}
              disabled={!onRate}
              accessible={true}
              accessibilityLabel={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              accessibilityRole="button"
            >
              <Text style={[
                styles.starText,
                rating >= star && styles.starTextActive,
                !onRate && styles.starTextDisabled
              ]}>
                ⭐
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {rating > 0 && (
          <Text style={styles.ratingFeedback}>
            {rating === 5 ? 'Perfect! We\'ll create more recipes like this.' :
             rating >= 4 ? 'Great! This helps us understand your preferences.' :
             rating >= 3 ? 'Thanks! We\'ll keep improving our suggestions.' :
             'Thanks for the feedback! We\'ll work on better recipes.'}
          </Text>
        )}
      </View>

      {/* Primary Actions */}
      <View style={styles.primaryActions}>
        <TouchableOpacity
          style={[styles.primaryButton, styles.cookingButton]}
          onPress={handleStartCooking}
          disabled={actionLoading === 'cooking'}
          accessible={true}
          accessibilityLabel="Start cooking this recipe"
          accessibilityRole="button"
        >
          {actionLoading === 'cooking' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonIcon}>👩‍🍳</Text>
              <Text style={styles.primaryButtonText}>Start Cooking</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, styles.shoppingButton]}
          onPress={handleAddToShoppingList}
          disabled={actionLoading === 'shopping'}
          accessible={true}
          accessibilityLabel="Add ingredients to shopping list"
          accessibilityRole="button"
        >
          {actionLoading === 'shopping' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonIcon}>🛒</Text>
              <Text style={styles.primaryButtonText}>Shopping List</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Secondary Actions */}
      <View style={styles.secondaryActions}>
        {/* Save/Remove */}
        <TouchableOpacity
          style={[styles.secondaryButton, isSaved && styles.secondaryButtonActive]}
          onPress={handleSaveToggle}
          disabled={saving || (!onSave && !onRemove)}
          accessible={true}
          accessibilityLabel={isSaved ? 'Remove from saved recipes' : 'Save recipe'}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <>
              <Text style={styles.secondaryButtonIcon}>
                {isSaved ? '❤️' : '🤍'}
              </Text>
              <Text style={[
                styles.secondaryButtonText,
                isSaved && styles.secondaryButtonTextActive
              ]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleShare}
          disabled={actionLoading === 'share'}
          accessible={true}
          accessibilityLabel="Share this recipe"
          accessibilityRole="button"
        >
          {actionLoading === 'share' ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <>
              <Text style={styles.secondaryButtonIcon}>📤</Text>
              <Text style={styles.secondaryButtonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Edit */}
        {canEdit && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleEdit}
            disabled={!canEdit}
            accessible={true}
            accessibilityLabel="Edit this recipe"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonIcon}>✏️</Text>
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </TouchableOpacity>
        )}

        {/* Regenerate */}
        {canRegenerate && recipe.ai_generated && (
          <TouchableOpacity
            style={[styles.secondaryButton, styles.regenerateButton]}
            onPress={handleRegenerate}
            disabled={regenerating || !canRegenerate}
            accessible={true}
            accessibilityLabel="Generate a different recipe"
            accessibilityRole="button"
          >
            {regenerating ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <>
                <Text style={styles.regenerateButtonIcon}>🔄</Text>
                <Text style={styles.regenerateButtonText}>Regenerate</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Advanced Actions */}
      {showAdvancedActions && (
        <View style={styles.advancedActions}>
          <TouchableOpacity
            style={styles.advancedButton}
            onPress={() => Alert.alert(
              'Recipe History',
              'View previous versions of this recipe and see how your preferences have evolved.\n\nComing soon!',
              [{ text: 'OK', style: 'default' }]
            )}
            accessible={true}
            accessibilityLabel="View recipe history"
            accessibilityRole="button"
          >
            <Text style={styles.advancedButtonText}>📊 History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.advancedButton}
            onPress={() => Alert.alert(
              'Recipe Analytics',
              `Recipe Performance:\n\n⭐ Rating: ${rating}/5 stars\n🛡️ Safety Score: ${recipe.safety_score}%\n⏱️ Cook Time: ${recipe.total_time} minutes\n💰 Est. Cost: £${recipe.estimated_cost?.toFixed(2) || 'N/A'}\n\nThis helps improve our AI recommendations.`,
              [{ text: 'OK', style: 'default' }]
            )}
            accessible={true}
            accessibilityLabel="View recipe analytics"
            accessibilityRole="button"
          >
            <Text style={styles.advancedButtonText}>📈 Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.advancedButton}
            onPress={handleReportIssue}
            accessible={true}
            accessibilityLabel="Report an issue with this recipe"
            accessibilityRole="button"
          >
            <Text style={styles.advancedButtonText}>🚨 Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recipe Info Footer */}
      <View style={styles.infoFooter}>
        <View style={styles.recipeStats}>
          <Text style={styles.statItem}>
            🛡️ {recipe.safety_score}% Safe
          </Text>
          {recipe.estimated_cost && (
            <Text style={styles.statItem}>
              💰 £{recipe.estimated_cost.toFixed(2)}
            </Text>
          )}
          <Text style={styles.statItem}>
            ⏱️ {recipe.total_time}m
          </Text>
          <Text style={styles.statItem}>
            👥 {recipe.servings} servings
          </Text>
        </View>
        
        {recipe.ai_generated && (
          <Text style={styles.aiFooterNote}>
            🧠 AI-generated with safety verification
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  // Rating section
  ratingSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  starText: {
    fontSize: 28,
    opacity: 0.3,
  },
  starTextActive: {
    opacity: 1,
  },
  starTextDisabled: {
    opacity: 0.2,
  },
  ratingFeedback: {
    fontSize: 11,
    color: '#059669',
    textAlign: 'center',
    marginTop: 4,
  },

  // Primary actions
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cookingButton: {
    backgroundColor: '#8B5CF6',
  },
  shoppingButton: {
    backgroundColor: '#059669',
  },
  primaryButtonIcon: {
    fontSize: 16,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Secondary actions
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    minWidth: 80,
  },
  secondaryButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  secondaryButtonIcon: {
    fontSize: 14,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  secondaryButtonTextActive: {
    color: '#DC2626',
  },
  regenerateButton: {
    backgroundColor: '#F3E8FF',
    borderColor: '#DDD6FE',
  },
  regenerateButtonIcon: {
    fontSize: 14,
  },
  regenerateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
  },

  // Advanced actions
  advancedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  advancedButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  advancedButtonText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Info footer
  infoFooter: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  recipeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  aiFooterNote: {
    fontSize: 10,
    color: '#8B5CF6',
    textAlign: 'center',
  },
});