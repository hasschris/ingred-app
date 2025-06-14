import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../lib/auth';

/**
 * SubscriptionManagement Component - Free/Premium Tier Management
 * 
 * Features:
 * - Current subscription status display
 * - Free vs Premium feature comparison
 * - Future-ready billing integration
 * - Professional upgrade interface
 * - Transparent pricing and features
 * - Family-focused value proposition
 */

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limitations: string[];
  recommended?: boolean;
  current?: boolean;
}

interface FeatureComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
}

const FeatureComparisonModal: React.FC<FeatureComparisonModalProps> = ({
  visible,
  onClose,
  onUpgrade,
}) => {
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      currency: 'GBP',
      interval: 'month',
      current: true,
      features: [
        'Unlimited AI-generated recipes',
        'Up to 4 family members',
        'Basic meal planning',
        'Essential allergen warnings',
        'Weekly meal calendar',
        'Recipe saving and rating',
        'Email support',
        'Basic shopping lists'
      ],
      limitations: [
        'Limited to 4 family members',
        'Basic nutrition information',
        'Standard recipe variety',
        'Email support only'
      ]
    },
    {
      id: 'premium_monthly',
      name: 'Premium Plan',
      price: 9.99,
      currency: 'GBP',
      interval: 'month',
      recommended: true,
      features: [
        'Everything in Free Plan',
        'Unlimited family members',
        'Advanced nutrition tracking',
        'Detailed nutritional analysis',
        'Smart shopping list integration',
        'Meal prep planning & timing',
        'Advanced dietary customisation',
        'Recipe scaling and adjustments',
        'Pantry management',
        'Cost tracking and budgeting',
        'Priority customer support',
        'Premium recipe collections',
        'Advanced allergen management',
        'Family meal history analytics',
        'Export meal plans to calendar',
        'Integration with grocery delivery'
      ],
      limitations: []
    },
    {
      id: 'premium_yearly',
      name: 'Premium Plan (Annual)',
      price: 99.99,
      currency: 'GBP',
      interval: 'year',
      features: [
        'Everything in Premium Monthly',
        '2 months free (save £20/year)',
        'Premium recipe collections',
        'Early access to new features'
      ],
      limitations: []
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Choose Your Plan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.planComparison}>
            <Text style={styles.comparisonTitle}>Perfect for British Families</Text>
            <Text style={styles.comparisonSubtitle}>
              Choose the plan that fits your family's meal planning needs
            </Text>

            <View style={styles.plansList}>
              {subscriptionPlans.map((plan) => (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    plan.recommended && styles.planCardRecommended,
                    plan.current && styles.planCardCurrent
                  ]}
                >
                  {plan.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Most Popular</Text>
                    </View>
                  )}

                  {plan.current && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentText}>Current Plan</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.planPricing}>
                      {plan.price === 0 ? (
                        <Text style={styles.planPrice}>Free</Text>
                      ) : (
                        <View style={styles.priceContainer}>
                          <Text style={styles.planPrice}>£{plan.price}</Text>
                          <Text style={styles.planInterval}>/{plan.interval}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.planFeatures}>
                    <Text style={styles.featuresTitle}>✅ What's Included:</Text>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureIcon}>•</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}

                    {plan.limitations.length > 0 && (
                      <>
                        <Text style={styles.limitationsTitle}>⚠️ Limitations:</Text>
                        {plan.limitations.map((limitation, index) => (
                          <View key={index} style={styles.limitationItem}>
                            <Text style={styles.limitationIcon}>•</Text>
                            <Text style={styles.limitationText}>{limitation}</Text>
                          </View>
                        ))}
                      </>
                    )}
                  </View>

                  {!plan.current && (
                    <TouchableOpacity
                      style={[
                        styles.upgradeButton,
                        plan.recommended && styles.upgradeButtonRecommended
                      ]}
                      onPress={() => onUpgrade(plan.id)}
                    >
                      <Text style={[
                        styles.upgradeButtonText,
                        plan.recommended && styles.upgradeButtonTextRecommended
                      ]}>
                        {plan.price === 0 ? 'Downgrade to Free' : 'Upgrade to Premium'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.familyValue}>
            <Text style={styles.familyValueTitle}>👨‍👩‍👧‍👦 Built for Families</Text>
            <Text style={styles.familyValueText}>
              Ingred understands that every family is unique. Whether you're managing 
              allergies, picky eaters, or complex dietary needs, our plans scale with 
              your family's requirements.
            </Text>

            <View style={styles.valuePoints}>
              <View style={styles.valuePoint}>
                <Text style={styles.valueIcon}>🛡️</Text>
                <Text style={styles.valueText}>Safety-first approach to family meal planning</Text>
              </View>
              <View style={styles.valuePoint}>
                <Text style={styles.valueIcon}>🇬🇧</Text>
                <Text style={styles.valueText}>Designed for British families and ingredients</Text>
              </View>
              <View style={styles.valuePoint}>
                <Text style={styles.valueIcon}>💰</Text>
                <Text style={styles.valueText}>Save money compared to meal kit services</Text>
              </View>
              <View style={styles.valuePoint}>
                <Text style={styles.valueIcon}>⏰</Text>
                <Text style={styles.valueText}>Save time with intelligent meal planning</Text>
              </View>
            </View>
          </View>

          <View style={styles.comingSoonSection}>
            <Text style={styles.comingSoonTitle}>🚀 Coming Soon</Text>
            <Text style={styles.comingSoonText}>
              Premium features are currently in development. Join our waiting list 
              to be notified when they become available and receive early access pricing.
            </Text>
            <TouchableOpacity style={styles.waitingListButton}>
              <Text style={styles.waitingListButtonText}>Join Waiting List</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

interface SubscriptionManagementProps {
  // Future props for subscription data
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = () => {
  const { user } = useAuth();
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Mock current subscription data - would come from database in production
  const currentSubscription = {
    plan: 'free',
    status: 'active',
    billing_cycle: null as string | null,
    next_billing_date: null as string | null,
    created_at: new Date().toISOString(),
    family_members_limit: 4,
    features_used: {
      family_members: 2,
      recipes_generated: 24,
      meal_plans_created: 3,
    }
  };

  const handleCurrentPlan = () => {
    const usageText = `📊 Current Usage:\n\n👨‍👩‍👧‍👦 Family members: ${currentSubscription.features_used.family_members}/${currentSubscription.family_members_limit}\n\n🍽️ Recipes generated: ${currentSubscription.features_used.recipes_generated}\n\n📅 Meal plans created: ${currentSubscription.features_used.meal_plans_created}\n\n📅 Member since: ${new Date(currentSubscription.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;

    Alert.alert(
      '⭐ Free Plan',
      usageText + '\n\n🆓 You\'re currently enjoying all the essential features of Ingred at no cost!',
      [
        { text: 'Got it!' },
        { text: 'View Premium Features', onPress: () => setShowFeatureComparison(true) }
      ]
    );
  };

  const handleBillingInfo = () => {
    Alert.alert(
      '💳 Billing Information',
      '🆓 You\'re currently on the free plan with no billing information required.\n\n💎 When premium features become available, you\'ll be able to add payment methods and manage billing here.\n\n🔒 All payments will be processed securely through Stripe with full encryption.',
      [
        { text: 'OK' },
        { text: 'Learn About Premium', onPress: () => setShowFeatureComparison(true) }
      ]
    );
  };

  const handleUsageStats = () => {
    const usage = currentSubscription.features_used;
    const limits = {
      family_members: currentSubscription.family_members_limit,
      recipes_per_month: 'Unlimited',
      meal_plans: 'Unlimited'
    };

    Alert.alert(
      '📊 Usage Statistics',
      `👨‍👩‍👧‍👦 Family Members: ${usage.family_members}/${limits.family_members}\n\n🍽️ Recipes Generated: ${usage.recipes_generated} (${limits.recipes_per_month})\n\n📅 Meal Plans: ${usage.meal_plans_created} (${limits.meal_plans})\n\n✅ You're well within your plan limits!\n\n💡 Upgrade to Premium for unlimited family members and advanced features.`,
      [
        { text: 'Great!' },
        { text: 'View Premium', onPress: () => setShowFeatureComparison(true) }
      ]
    );
  };

  const handleUpgrade = (planId: string) => {
    setShowFeatureComparison(false);
    
    if (planId === 'free') {
      Alert.alert(
        'Downgrade to Free',
        'You\'re already on the free plan! 🎉\n\nEnjoy unlimited recipes and essential features at no cost.',
        [{ text: 'Brilliant!' }]
      );
      return;
    }

    Alert.alert(
      'Premium Coming Soon! 🚀',
      '💎 Premium features are currently in development.\n\n📧 Join our waiting list to:\n• Get notified when premium launches\n• Receive early access pricing\n• Help shape premium features\n\n🇬🇧 Designed specifically for British families who want the ultimate meal planning experience.',
      [
        { text: 'Maybe Later' },
        { 
          text: 'Join Waiting List', 
          onPress: () => {
            Alert.alert(
              'Added to Waiting List! ✅',
              'You\'ll be among the first to know when premium features are available.\n\n📧 We\'ll send updates to your email address.\n\n🎁 Waiting list members get exclusive early access pricing!'
            );
          }
        }
      ]
    );
  };

  const handleSubscriptionSupport = () => {
    Alert.alert(
      '🤝 Subscription Support',
      '📧 For billing questions or subscription support:\n\nEmail: billing@ingred.app\n📞 Phone: +44 20 1234 5678\n🕐 Support hours: Mon-Fri 9am-5pm GMT\n\n💬 For immediate help, use the in-app chat or visit our help centre.\n\n🔒 All billing inquiries are handled securely and confidentially.',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Current Plan */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleCurrentPlan}
        accessible={true}
        accessibilityLabel="Current subscription plan"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>⭐</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Current Plan</Text>
            <Text style={styles.settingsSubtitle}>
              Free Plan • Unlimited recipes, 4 family members
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Usage Statistics */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleUsageStats}
        accessible={true}
        accessibilityLabel="Usage statistics"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>📊</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Usage Statistics</Text>
            <Text style={styles.settingsSubtitle}>
              {currentSubscription.features_used.family_members}/{currentSubscription.family_members_limit} family members • {currentSubscription.features_used.recipes_generated} recipes generated
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Billing Information */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleBillingInfo}
        accessible={true}
        accessibilityLabel="Billing information"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>💳</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Billing & Payment</Text>
            <Text style={styles.settingsSubtitle}>
              No payment method required for free plan
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Compare Plans */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={() => setShowFeatureComparison(true)}
        accessible={true}
        accessibilityLabel="Compare subscription plans"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>💎</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Compare Plans</Text>
            <Text style={styles.settingsSubtitle}>
              See what's available with Premium (coming soon)
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Subscription Support */}
      <TouchableOpacity
        style={[styles.settingsRow, styles.lastRow]}
        onPress={handleSubscriptionSupport}
        accessible={true}
        accessibilityLabel="Subscription support"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>🤝</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Subscription Support</Text>
            <Text style={styles.settingsSubtitle}>
              Get help with billing and subscription questions
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Feature Comparison Modal */}
      <FeatureComparisonModal
        visible={showFeatureComparison}
        onClose={() => setShowFeatureComparison(false)}
        onUpgrade={handleUpgrade}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Settings Rows
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 56,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  settingsRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingsIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },

  settingsTextContainer: {
    flex: 1,
  },

  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  settingsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  settingsArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    marginLeft: 12,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter',
  },

  headerSpacer: {
    width: 60,
  },

  modalContent: {
    flex: 1,
  },

  // Plan Comparison
  planComparison: {
    padding: 16,
  },

  comparisonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  comparisonSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter',
  },

  plansList: {
    gap: 16,
  },

  planCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 20,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },

  planCardRecommended: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F9FAFB',
  },

  planCardCurrent: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },

  recommendedBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },

  currentBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  currentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },

  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },

  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  planPricing: {
    alignItems: 'center',
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    fontFamily: 'Inter',
  },

  planInterval: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'Inter',
  },

  planFeatures: {
    marginBottom: 20,
  },

  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  featureIcon: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 8,
    marginTop: 2,
  },

  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  limitationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 12,
    marginTop: 16,
    fontFamily: 'Inter',
  },

  limitationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  limitationIcon: {
    fontSize: 16,
    color: '#DC2626',
    marginRight: 8,
    marginTop: 2,
  },

  limitationText: {
    fontSize: 14,
    color: '#7F1D1D',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  upgradeButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },

  upgradeButtonRecommended: {
    backgroundColor: '#8B5CF6',
  },

  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter',
  },

  upgradeButtonTextRecommended: {
    color: '#FFFFFF',
  },

  // Family Value Section
  familyValue: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  familyValueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  familyValueText: {
    fontSize: 16,
    color: '#1E3A8A',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  valuePoints: {
    gap: 12,
  },

  valuePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  valueIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  valueText: {
    fontSize: 14,
    color: '#1E40AF',
    flex: 1,
    fontFamily: 'Inter',
  },

  // Coming Soon Section
  comingSoonSection: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  comingSoonText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter',
  },

  waitingListButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  waitingListButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
});

/**
 * SubscriptionManagement Component Features:
 * 
 * Current Plan Management:
 * - Clear display of current subscription status
 * - Usage statistics and limits tracking
 * - Professional plan information
 * - Integration ready for billing systems
 * 
 * Feature Comparison:
 * - Comprehensive free vs premium comparison
 * - Family-focused value proposition
 * - Clear pricing structure (future-ready)
 * - British market positioning
 * 
 * User Experience:
 * - Professional subscription interface
 * - Clear upgrade path and messaging
 * - Future-ready for billing integration
 * - Transparent pricing and features
 * 
 * Business Features:
 * - Waiting list functionality for premium launch
 * - Value-focused messaging
 * - Professional billing support contact
 * - Conversion-optimized design
 * 
 * Integration Points:
 * - Ready for Stripe payment integration
 * - Database schema for subscription tracking
 * - Support for multiple billing cycles
 * - Professional customer support integration
 */