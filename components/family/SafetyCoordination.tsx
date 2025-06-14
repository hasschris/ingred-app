import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FamilyMember } from './FamilyMemberCard';

interface SafetyCoordinationProps {
  familyMembers: FamilyMember[];
  onPress?: () => void;
}

interface SafetyAnalysis {
  hasCriticalAllergies: boolean;
  criticalMemberCount: number;
  totalAllergies: number;
  totalRestrictions: number;
  conflictingDiets: boolean;
  majorAllergens: string[];
  criticalAllergens: string[];
  dietConflicts: {
    vegetarians: string[];
    nonVegetarians: string[];
  };
}

export const SafetyCoordination: React.FC<SafetyCoordinationProps> = ({ 
  familyMembers, 
  onPress 
}) => {
  
  const getSafetyAnalysis = (): SafetyAnalysis => {
    const criticalMembers = familyMembers.filter(m => 
      m.allergy_severity.includes('life_threatening') || m.allergy_severity.includes('severe')
    );
    
    const allAllergies = [...new Set(familyMembers.flatMap(m => m.allergies))];
    const allRestrictions = [...new Set(familyMembers.flatMap(m => m.dietary_restrictions))];
    
    const criticalAllergies = [...new Set(criticalMembers.flatMap(m => m.allergies))];
    
    const vegetarians = familyMembers.filter(m => 
      m.dietary_restrictions.some(r => r.includes('vegetarian') || r.includes('vegan'))
    );
    const nonVegetarians = familyMembers.filter(m => 
      !m.dietary_restrictions.some(r => r.includes('vegetarian') || r.includes('vegan'))
    );
    
    return {
      hasCriticalAllergies: criticalMembers.length > 0,
      criticalMemberCount: criticalMembers.length,
      totalAllergies: allAllergies.length,
      totalRestrictions: allRestrictions.length,
      conflictingDiets: vegetarians.length > 0 && nonVegetarians.length > 0,
      majorAllergens: allAllergies,
      criticalAllergens: criticalAllergies,
      dietConflicts: {
        vegetarians: vegetarians.map(m => m.name),
        nonVegetarians: nonVegetarians.map(m => m.name)
      }
    };
  };

  const handleFamilySafetyOverview = () => {
    const analysis = getSafetyAnalysis();
    
    let message = 'Family-wide allergen management:\n\n';
    
    if (analysis.criticalAllergens.length > 0) {
      message += `🚨 Critical allergies: ${analysis.criticalAllergens.join(', ')}\n\n`;
    }
    
    if (analysis.majorAllergens.length > 0) {
      message += `🛡️ All allergies: ${analysis.majorAllergens.join(', ')}\n\n`;
    } else {
      message += `🛡️ All allergies: None\n\n`;
    }
    
    message += `👥 Members with critical allergies: ${analysis.criticalMemberCount}\n\n`;
    
    if (analysis.conflictingDiets) {
      message += `⚖️ Diet coordination needed:\n`;
      message += `• Vegetarian: ${analysis.dietConflicts.vegetarians.join(', ')}\n`;
      message += `• Non-vegetarian: ${analysis.dietConflicts.nonVegetarians.join(', ')}\n\n`;
    }
    
    message += 'Ingred AI considers all family allergies when generating recipes.';

    Alert.alert('Family Safety Overview', message, [{ text: 'Understood' }]);

    // Call optional onPress callback
    if (onPress) {
      onPress();
    }
  };

  const safetyAnalysis = getSafetyAnalysis();

  if (familyMembers.length === 0) {
    return (
      <View style={styles.safetyOverview}>
        <View style={styles.safetyOverviewContent}>
          <Text style={styles.safetyOverviewIcon}>👨‍👩‍👧‍👦</Text>
          <View style={styles.safetyOverviewText}>
            <Text style={styles.safetyOverviewTitle}>Add Family Members</Text>
            <Text style={styles.safetyOverviewSubtitle}>
              Set up individual dietary needs for safer meal planning
            </Text>
          </View>
        </View>
        <Text style={styles.safetyOverviewArrow}>›</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.safetyOverview,
        safetyAnalysis.hasCriticalAllergies && styles.safetyOverviewCritical
      ]}
      onPress={handleFamilySafetyOverview}
      accessible={true}
      accessibilityLabel="View family safety overview"
      accessibilityRole="button"
    >
      <View style={styles.safetyOverviewContent}>
        <Text style={styles.safetyOverviewIcon}>
          {safetyAnalysis.hasCriticalAllergies ? '🚨' : '🛡️'}
        </Text>
        <View style={styles.safetyOverviewText}>
          <Text style={styles.safetyOverviewTitle}>
            {safetyAnalysis.hasCriticalAllergies ? 'Critical Allergies Present' : 'Family Safety Active'}
          </Text>
          <Text style={styles.safetyOverviewSubtitle}>
            {safetyAnalysis.hasCriticalAllergies 
              ? `${safetyAnalysis.criticalMemberCount} member${safetyAnalysis.criticalMemberCount > 1 ? 's' : ''} with severe allergies`
              : 'AI considers all family members when generating recipes'
            }
          </Text>
          
          {/* Additional safety indicators */}
          {safetyAnalysis.totalAllergies > 0 && (
            <View style={styles.safetyIndicators}>
              <Text style={styles.safetyIndicatorText}>
                🛡️ {safetyAnalysis.totalAllergies} allergen{safetyAnalysis.totalAllergies > 1 ? 's' : ''}
              </Text>
              {safetyAnalysis.totalRestrictions > 0 && (
                <Text style={styles.safetyIndicatorText}>
                  📋 {safetyAnalysis.totalRestrictions} restriction{safetyAnalysis.totalRestrictions > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
      <Text style={styles.safetyOverviewArrow}>›</Text>
    </TouchableOpacity>
  );
};

// Additional component for compact safety display (for use in meal planning)
interface CompactSafetyDisplayProps {
  familyMembers: FamilyMember[];
  maxDisplay?: number;
}

export const CompactSafetyDisplay: React.FC<CompactSafetyDisplayProps> = ({ 
  familyMembers, 
  maxDisplay = 3 
}) => {
  const criticalMembers = familyMembers.filter(m => 
    m.allergy_severity.includes('life_threatening') || m.allergy_severity.includes('severe')
  );

  const allAllergies = [...new Set(familyMembers.flatMap(m => m.allergies))];

  if (allAllergies.length === 0) {
    return (
      <View style={styles.compactSafety}>
        <Text style={styles.compactSafetyText}>✅ No known allergies</Text>
      </View>
    );
  }

  return (
    <View style={styles.compactSafety}>
      <View style={styles.compactSafetyHeader}>
        {criticalMembers.length > 0 && (
          <Text style={styles.criticalAlert}>🚨 Critical: </Text>
        )}
        <Text style={styles.compactSafetyTitle}>
          Family allergies: 
        </Text>
      </View>
      
      <View style={styles.compactAllergenList}>
        {allAllergies.slice(0, maxDisplay).map((allergen, index) => (
          <View key={index} style={styles.compactAllergenTag}>
            <Text style={styles.compactAllergenText}>{allergen}</Text>
          </View>
        ))}
        {allAllergies.length > maxDisplay && (
          <Text style={styles.compactAllergenMore}>
            +{allAllergies.length - maxDisplay} more
          </Text>
        )}
      </View>
    </View>
  );
};

// Component for showing family member impact in meal planning
interface FamilyImpactDisplayProps {
  familyMembers: FamilyMember[];
  recipeTitle?: string;
}

export const FamilyImpactDisplay: React.FC<FamilyImpactDisplayProps> = ({ 
  familyMembers, 
  recipeTitle 
}) => {
  const membersWithRestrictions = familyMembers.filter(m => 
    m.allergies.length > 0 || m.dietary_restrictions.length > 0
  );

  if (membersWithRestrictions.length === 0) {
    return (
      <View style={styles.familyImpact}>
        <Text style={styles.familyImpactText}>
          ✅ Safe for all {familyMembers.length} family member{familyMembers.length > 1 ? 's' : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.familyImpact}>
      <Text style={styles.familyImpactTitle}>
        {recipeTitle ? 'Family considerations:' : 'Avoiding for:'}
      </Text>
      
      {membersWithRestrictions.slice(0, 3).map((member, index) => {
        const restrictions = [...member.allergies, ...member.dietary_restrictions];
        return (
          <Text key={index} style={styles.familyImpactMember}>
            • {member.name}: {restrictions.slice(0, 2).join(', ')}
            {restrictions.length > 2 && ` +${restrictions.length - 2} more`}
          </Text>
        );
      })}
      
      {membersWithRestrictions.length > 3 && (
        <Text style={styles.familyImpactMore}>
          +{membersWithRestrictions.length - 3} more family member{membersWithRestrictions.length - 3 > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Safety Overview
  safetyOverview: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
  },

  safetyOverviewCritical: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#DC2626',
  },

  safetyOverviewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  safetyOverviewIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  safetyOverviewText: {
    flex: 1,
  },

  safetyOverviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    fontFamily: 'Inter',
  },

  safetyOverviewSubtitle: {
    fontSize: 14,
    color: '#065F46',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  safetyIndicators: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  safetyIndicatorText: {
    fontSize: 12,
    color: '#065F46',
    fontFamily: 'Inter',
  },

  safetyOverviewArrow: {
    fontSize: 18,
    color: '#6B7280',
  },

  // Compact Safety Display
  compactSafety: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  compactSafetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  criticalAlert: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },

  compactSafetyTitle: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },

  compactSafetyText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },

  compactAllergenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },

  compactAllergenTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },

  compactAllergenText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500',
  },

  compactAllergenMore: {
    fontSize: 10,
    color: '#78350F',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Family Impact Display
  familyImpact: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: 8,
  },

  familyImpactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 6,
  },

  familyImpactText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '500',
  },

  familyImpactMember: {
    fontSize: 12,
    color: '#1E40AF',
    marginBottom: 2,
    lineHeight: 16,
  },

  familyImpactMore: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
});