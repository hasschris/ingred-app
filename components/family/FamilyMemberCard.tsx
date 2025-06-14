import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Enhanced types for the family member card
export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  age_group: 'child' | 'teen' | 'adult' | 'senior';
  dietary_restrictions: string[];
  allergies: string[];
  allergy_severity: string[];
  food_preferences: {
    loves?: string[];
    adventurousness?: 'very_picky' | 'somewhat_picky' | 'average' | 'adventurous' | 'very_adventurous';
    spice_tolerance?: 'none' | 'mild' | 'medium' | 'hot' | 'very_hot';
  };
  dislikes: string[];
  special_needs?: string;
  medical_dietary_requirements?: string;
  created_at: string;
  updated_at: string;
}

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
  onManageSafety: (member: FamilyMember) => void;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ 
  member, 
  onEdit, 
  onDelete,
  onManageSafety 
}) => {
  const hasCriticalAllergies = member.allergy_severity.includes('life_threatening') || 
                              member.allergy_severity.includes('severe');

  const hasAnyAllergies = member.allergies.length > 0;
  const hasRestrictions = member.dietary_restrictions.length > 0;

  return (
    <View style={[
      styles.memberCard,
      hasCriticalAllergies && styles.memberCardCritical
    ]}>
      <View style={styles.memberHeader}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberAge}>
            {member.age_group.charAt(0).toUpperCase() + member.age_group.slice(1)}
          </Text>
        </View>
        
        {hasCriticalAllergies && (
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalBadgeText}>🚨 Critical</Text>
          </View>
        )}
      </View>

      {/* Allergies Section */}
      {hasAnyAllergies && (
        <View style={styles.allergiesSection}>
          <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
          <View style={styles.tagContainer}>
            {member.allergies.map((allergy, index) => {
              const severity = member.allergy_severity[index] || 'mild';
              const isHighRisk = severity === 'severe' || severity === 'life_threatening';
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.allergyTag,
                    isHighRisk && styles.allergyTagCritical
                  ]}
                >
                  <Text style={[
                    styles.allergyTagText,
                    isHighRisk && styles.allergyTagTextCritical
                  ]}>
                    🛡️ {allergy}
                  </Text>
                  <Text style={[
                    styles.severityText,
                    isHighRisk && styles.severityTextCritical
                  ]}>
                    {severity}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Dietary Restrictions */}
      {hasRestrictions && (
        <View style={styles.restrictionsSection}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          <View style={styles.tagContainer}>
            {member.dietary_restrictions.map((restriction, index) => (
              <View key={index} style={styles.restrictionTag}>
                <Text style={styles.restrictionTagText}>{restriction}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Dislikes */}
      {member.dislikes.length > 0 && (
        <View style={styles.dislikesSection}>
          <Text style={styles.sectionTitle}>Dislikes</Text>
          <Text style={styles.dislikesText}>
            {member.dislikes.slice(0, 5).join(', ')}
            {member.dislikes.length > 5 && ` +${member.dislikes.length - 5} more`}
          </Text>
        </View>
      )}

      {/* Special Needs */}
      {member.special_needs && (
        <View style={styles.specialNeedsSection}>
          <Text style={styles.sectionTitle}>Special Needs</Text>
          <Text style={styles.specialNeedsText}>{member.special_needs}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.memberActions}>
        <TouchableOpacity
          style={styles.safetyButton}
          onPress={() => onManageSafety(member)}
          accessible={true}
          accessibilityLabel={`Manage safety settings for ${member.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.safetyButtonText}>🛡️ Safety</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(member)}
          accessible={true}
          accessibilityLabel={`Edit preferences for ${member.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(member.id)}
          accessible={true}
          accessibilityLabel={`Remove ${member.name} from family`}
          accessibilityRole="button"
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Family Member Cards
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  memberCardCritical: {
    borderColor: '#FCA5A5',
    borderWidth: 2,
  },

  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  memberAge: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  criticalBadge: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  criticalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    fontFamily: 'Inter',
  },

  // Sections
  allergiesSection: {
    marginBottom: 16,
  },

  restrictionsSection: {
    marginBottom: 16,
  },

  dislikesSection: {
    marginBottom: 16,
  },

  specialNeedsSection: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  // Tags
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  allergyTag: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  allergyTagCritical: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },

  allergyTagText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  allergyTagTextCritical: {
    color: '#DC2626',
  },

  severityText: {
    fontSize: 10,
    color: '#78350F',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  severityTextCritical: {
    color: '#991B1B',
    fontWeight: '600',
  },

  restrictionTag: {
    backgroundColor: '#EBF8FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  restrictionTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontFamily: 'Inter',
  },

  dislikesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  specialNeedsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  // Action Buttons
  memberActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  safetyButton: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    alignItems: 'center',
  },

  safetyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#047857',
    fontFamily: 'Inter',
  },

  editButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter',
  },

  deleteButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },

  deleteButtonText: {
    fontSize: 14,
    color: '#DC2626',
  },
});