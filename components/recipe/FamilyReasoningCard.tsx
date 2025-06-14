import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';

// Types for family reasoning
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
  family_members?: FamilyMember[];
}

interface DetectedAllergen {
  name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  icon: string;
  warning_text: string;
}

interface FamilyReasoningCardProps {
  familyReasoning: string;
  allergenConsiderations?: string;
  userPreferences: UserPreferences;
  detectedAllergens?: DetectedAllergen[];
  dietaryCompliance?: string[];
  safetyScore?: number;
  expanded?: boolean;
  showDetailedBreakdown?: boolean;
  onExpandToggle?: () => void;
  style?: any;
}

export default function FamilyReasoningCard({
  familyReasoning,
  allergenConsiderations,
  userPreferences,
  detectedAllergens = [],
  dietaryCompliance = [],
  safetyScore,
  expanded = false,
  showDetailedBreakdown = true,
  onExpandToggle,
  style,
}: FamilyReasoningCardProps) {
  
  const [internalExpanded, setInternalExpanded] = useState(expanded);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const isExpanded = onExpandToggle ? expanded : internalExpanded;

  // Handle expansion toggle
  const handleToggleExpand = () => {
    if (onExpandToggle) {
      onExpandToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  // Get age group display info
  const getAgeGroupInfo = (ageGroup: string) => {
    switch (ageGroup) {
      case 'child':
        return { emoji: '👶', label: 'Child', considerations: 'Mild flavours, safe textures, balanced nutrition' };
      case 'teen':
        return { emoji: '🧒', label: 'Teen', considerations: 'Higher portions, energy-rich foods, familiar flavours' };
      case 'adult':
        return { emoji: '👨', label: 'Adult', considerations: 'Balanced nutrition, varied flavours, portion control' };
      case 'senior':
        return { emoji: '👴', label: 'Senior', considerations: 'Easy to chew, heart-healthy, lower sodium' };
      default:
        return { emoji: '👤', label: 'Person', considerations: 'General dietary needs' };
    }
  };

  // Get cooking skill insights
  const getCookingSkillInsights = () => {
    switch (userPreferences.cooking_skill) {
      case 'beginner':
        return {
          icon: '🌱',
          description: 'Simple techniques, basic ingredients, clear instructions',
          tips: ['One-pot recipes preferred', 'Minimal prep time', 'Common ingredients', 'Step-by-step guidance']
        };
      case 'intermediate':
        return {
          icon: '🍳',
          description: 'Moderate complexity, some advanced techniques, varied ingredients',
          tips: ['Multiple cooking methods', 'Fresh ingredient combinations', 'Moderate prep time', 'Some specialty tools']
        };
      case 'advanced':
        return {
          icon: '👨‍🍳',
          description: 'Complex techniques, specialty ingredients, creative freedom',
          tips: ['Advanced techniques', 'Seasonal ingredients', 'Complex flavour profiles', 'Professional methods']
        };
      default:
        return {
          icon: '🍽️',
          description: 'Adapted for your cooking level',
          tips: ['Customized difficulty']
        };
    }
  };

  // Get budget considerations
  const getBudgetInsights = () => {
    switch (userPreferences.budget_level) {
      case 'budget':
        return {
          icon: '💰',
          focus: 'Cost-effective ingredients, bulk cooking, minimal waste',
          strategies: ['Seasonal vegetables', 'Affordable proteins', 'Pantry staples', 'Batch cooking']
        };
      case 'moderate':
        return {
          icon: '💳',
          focus: 'Balanced cost and quality, some premium ingredients',
          strategies: ['Quality basics', 'Occasional splurges', 'Fresh when possible', 'Balanced portions']
        };
      case 'premium':
        return {
          icon: '💎',
          focus: 'High-quality ingredients, artisanal products, optimal nutrition',
          strategies: ['Organic options', 'Specialty ingredients', 'Fresh & local', 'Premium proteins']
        };
      default:
        return {
          icon: '💰',
          focus: 'Cost-conscious meal planning',
          strategies: ['Smart shopping']
        };
    }
  };

  // Check family member allergen matches
  const getFamilyAllergenMatches = (allergenName: string) => {
    if (!userPreferences.family_members) return [];
    
    return userPreferences.family_members.filter(member => 
      member.allergies?.some(allergy => 
        allergy.toLowerCase().includes(allergenName.toLowerCase()) ||
        allergenName.toLowerCase().includes(allergy.toLowerCase())
      )
    );
  };

  // Handle member selection for detailed view
  const handleMemberSelect = (memberId: string) => {
    if (selectedMember === memberId) {
      setSelectedMember(null);
    } else {
      setSelectedMember(memberId);
      
      const member = userPreferences.family_members?.find(m => m.id === memberId);
      if (member) {
        const ageInfo = getAgeGroupInfo(member.age_group);
        const allergenMatches = detectedAllergens.filter(allergen => 
          getFamilyAllergenMatches(allergen.name).some(m => m.id === memberId)
        );
        
        Alert.alert(
          `${member.name} - Individual Considerations`,
          `Age Group: ${ageInfo.label} ${ageInfo.emoji}\n\n` +
          `Dietary Needs:\n${ageInfo.considerations}\n\n` +
          (member.dietary_restrictions?.length ? 
            `Dietary Restrictions:\n• ${member.dietary_restrictions.join('\n• ')}\n\n` : '') +
          (member.allergies?.length ? 
            `Allergies:\n• ${member.allergies.join('\n• ')}\n\n` : '') +
          (allergenMatches.length ? 
            `⚠️ Recipe Allergen Matches:\n• ${allergenMatches.map(a => `${a.icon} ${a.name}`).join('\n• ')}\n\n` : '') +
          'AI has specifically considered these needs when creating this recipe.',
          [{ text: 'Got It', style: 'default' }]
        );
      }
    }
  };

  const skillInsights = getCookingSkillInsights();
  const budgetInsights = getBudgetInsights();

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        onPress={handleToggleExpand}
        accessible={true}
        accessibilityLabel={`${isExpanded ? 'Hide' : 'Show'} family reasoning details`}
        accessibilityRole="button"
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>👨‍👩‍👧‍👦</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>Why This Works for Your Family</Text>
            <Text style={styles.subtitle}>
              AI analysis for {userPreferences.household_size} people
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>
          {isExpanded ? '−' : '+'}
        </Text>
      </TouchableOpacity>

      {/* Main Reasoning */}
      <View style={styles.reasoningSection}>
        <Text style={styles.reasoningText}>
          💭 {familyReasoning}
        </Text>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Household Overview */}
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>🏠 Household Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Size</Text>
                <Text style={styles.overviewValue}>👥 {userPreferences.household_size}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Skill</Text>
                <Text style={styles.overviewValue}>
                  {skillInsights.icon} {userPreferences.cooking_skill}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Budget</Text>
                <Text style={styles.overviewValue}>
                  {budgetInsights.icon} {userPreferences.budget_level}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Time</Text>
                <Text style={styles.overviewValue}>⏱️ {userPreferences.cooking_time_minutes}m</Text>
              </View>
            </View>
          </View>

          {/* Individual Family Members */}
          {userPreferences.family_members && userPreferences.family_members.length > 0 && (
            <View style={styles.familyMembersSection}>
              <Text style={styles.sectionTitle}>👥 Individual Family Members</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.membersScroll}
              >
                {userPreferences.family_members.map((member) => {
                  const ageInfo = getAgeGroupInfo(member.age_group);
                  const allergenMatches = detectedAllergens.filter(allergen => 
                    getFamilyAllergenMatches(allergen.name).some(m => m.id === member.id)
                  );
                  const isSelected = selectedMember === member.id;
                  
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberCard,
                        isSelected && styles.memberCardSelected,
                        allergenMatches.length > 0 && styles.memberCardWarning
                      ]}
                      onPress={() => handleMemberSelect(member.id)}
                      accessible={true}
                      accessibilityLabel={`${member.name}, ${ageInfo.label}, tap for details`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.memberEmoji}>{ageInfo.emoji}</Text>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberAge}>{ageInfo.label}</Text>
                      
                      {/* Dietary indicators */}
                      <View style={styles.memberIndicators}>
                        {member.dietary_restrictions && member.dietary_restrictions.length > 0 && (
                          <Text style={styles.indicatorBadge}>
                            🥗 {member.dietary_restrictions.length}
                          </Text>
                        )}
                        {member.allergies && member.allergies.length > 0 && (
                          <Text style={[
                            styles.indicatorBadge,
                            styles.allergyBadge,
                            allergenMatches.length > 0 && styles.allergyBadgeWarning
                          ]}>
                            ⚠️ {member.allergies.length}
                          </Text>
                        )}
                      </View>
                      
                      {allergenMatches.length > 0 && (
                        <View style={styles.warningIndicator}>
                          <Text style={styles.warningText}>Recipe Alert!</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
              <Text style={styles.membersNote}>
                Tap family members to see how this recipe accommodates their specific needs
              </Text>
            </View>
          )}

          {/* Detailed Breakdown */}
          {showDetailedBreakdown && (
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>🔍 Detailed AI Analysis</Text>
              
              {/* Cooking Skill Considerations */}
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownIcon}>{skillInsights.icon}</Text>
                  <Text style={styles.breakdownTitle}>Cooking Skill Adaptation</Text>
                </View>
                <Text style={styles.breakdownDescription}>{skillInsights.description}</Text>
                <View style={styles.breakdownTips}>
                  {skillInsights.tips.map((tip, index) => (
                    <Text key={index} style={styles.tipItem}>• {tip}</Text>
                  ))}
                </View>
              </View>

              {/* Budget Considerations */}
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownIcon}>{budgetInsights.icon}</Text>
                  <Text style={styles.breakdownTitle}>Budget Optimization</Text>
                </View>
                <Text style={styles.breakdownDescription}>{budgetInsights.focus}</Text>
                <View style={styles.breakdownTips}>
                  {budgetInsights.strategies.map((strategy, index) => (
                    <Text key={index} style={styles.tipItem}>• {strategy}</Text>
                  ))}
                </View>
              </View>

              {/* Dietary Compliance */}
              {dietaryCompliance.length > 0 && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Text style={styles.breakdownIcon}>🥗</Text>
                    <Text style={styles.breakdownTitle}>Dietary Compliance</Text>
                  </View>
                  <View style={styles.complianceGrid}>
                    {dietaryCompliance.map((item, index) => (
                      <View key={index} style={styles.complianceItem}>
                        <Text style={styles.complianceText}>✓ {item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Allergen Considerations */}
              {allergenConsiderations && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Text style={styles.breakdownIcon}>🛡️</Text>
                    <Text style={styles.breakdownTitle}>Safety Considerations</Text>
                  </View>
                  <Text style={styles.breakdownDescription}>{allergenConsiderations}</Text>
                  
                  {detectedAllergens.length > 0 && (
                    <View style={styles.allergenBreakdown}>
                      <Text style={styles.allergenBreakdownTitle}>Detected Allergens:</Text>
                      {detectedAllergens.map((allergen, index) => {
                        const familyMatches = getFamilyAllergenMatches(allergen.name);
                        return (
                          <View key={index} style={styles.allergenItem}>
                            <Text style={styles.allergenIcon}>{allergen.icon}</Text>
                            <View style={styles.allergenDetails}>
                              <Text style={styles.allergenName}>{allergen.name}</Text>
                              {familyMatches.length > 0 && (
                                <Text style={styles.allergenFamilyMatch}>
                                  ⚠️ Affects: {familyMatches.map(m => m.name).join(', ')}
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Safety Score */}
          {safetyScore !== undefined && (
            <View style={styles.safetySection}>
              <View style={styles.safetyHeader}>
                <Text style={styles.safetyIcon}>🛡️</Text>
                <Text style={styles.safetyTitle}>Family Safety Score</Text>
                <View style={[
                  styles.safetyScoreBadge,
                  safetyScore >= 90 ? styles.safetyScoreHigh :
                  safetyScore >= 70 ? styles.safetyScoreMedium :
                  styles.safetyScoreLow
                ]}>
                  <Text style={styles.safetyScoreText}>{safetyScore}%</Text>
                </View>
              </View>
              <Text style={styles.safetyDescription}>
                This score reflects how well this recipe accommodates your family's specific dietary needs, 
                allergies, and safety requirements.
              </Text>
            </View>
          )}

          {/* AI Transparency Note */}
          <View style={styles.transparencyNote}>
            <Text style={styles.transparencyIcon}>🧠</Text>
            <Text style={styles.transparencyText}>
              This analysis was generated by AI based on your family's profile. The reasoning helps you 
              understand why this specific recipe was chosen for your household's unique needs.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#15803D',
  },
  expandIcon: {
    fontSize: 20,
    color: '#059669',
    fontWeight: '600',
  },

  // Main reasoning
  reasoningSection: {
    padding: 16,
  },
  reasoningText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Expanded content
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
    gap: 16,
  },

  // Overview section
  overviewSection: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  overviewItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  overviewLabel: {
    fontSize: 10,
    color: '#059669',
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },

  // Family members
  familyMembersSection: {
    paddingHorizontal: 16,
  },
  membersScroll: {
    paddingRight: 16,
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    minWidth: 100,
    position: 'relative',
  },
  memberCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  memberCardWarning: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  memberEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 2,
    textAlign: 'center',
  },
  memberAge: {
    fontSize: 10,
    color: '#059669',
    marginBottom: 8,
  },
  memberIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  indicatorBadge: {
    fontSize: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#166534',
    fontWeight: '600',
  },
  allergyBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  allergyBadgeWarning: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  warningIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  warningText: {
    fontSize: 7,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  membersNote: {
    fontSize: 10,
    color: '#059669',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Breakdown section
  breakdownSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  breakdownItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  breakdownIcon: {
    fontSize: 16,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  breakdownDescription: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 16,
    marginBottom: 8,
  },
  breakdownTips: {
    gap: 2,
  },
  tipItem: {
    fontSize: 11,
    color: '#059669',
  },

  // Compliance
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  complianceItem: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  complianceText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '500',
  },

  // Allergen breakdown
  allergenBreakdown: {
    marginTop: 8,
    gap: 6,
  },
  allergenBreakdownTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  allergenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 6,
    gap: 6,
  },
  allergenIcon: {
    fontSize: 12,
  },
  allergenDetails: {
    flex: 1,
  },
  allergenName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
  },
  allergenFamilyMatch: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '600',
  },

  // Safety section
  safetySection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  safetyIcon: {
    fontSize: 16,
  },
  safetyTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  safetyScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safetyScoreHigh: {
    backgroundColor: '#D1FAE5',
  },
  safetyScoreMedium: {
    backgroundColor: '#FEF3C7',
  },
  safetyScoreLow: {
    backgroundColor: '#FEE2E2',
  },
  safetyScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  safetyDescription: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },

  // Transparency note
  transparencyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 12,
    gap: 6,
  },
  transparencyIcon: {
    fontSize: 12,
    marginTop: 2,
  },
  transparencyText: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
  },
});