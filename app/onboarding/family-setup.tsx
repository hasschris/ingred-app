import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

/**
 * Family Setup Route - Onboarding Version
 * 
 * This is the onboarding version of family member setup that
 * focuses on completing the initial setup flow. It provides
 * a streamlined experience for adding family members during
 * the onboarding process.
 */

interface FamilyMember {
  id?: string
  name: string
  age_group: 'child' | 'teen' | 'adult' | 'senior'
  dietary_restrictions: string[]
  allergies: string[]
  allergy_severity: string[]
  food_preferences: {
    loves: string[]
    dislikes: string[]
    adventurousness: 'very_picky' | 'somewhat_picky' | 'average' | 'adventurous' | 'very_adventurous'
  }
  special_needs?: string
  medical_dietary_requirements?: string
}

const AGE_GROUPS = [
  { id: 'child', label: '👶 Child (0-12)', description: 'Simple, kid-friendly meals' },
  { id: 'teen', label: '🧒 Teenager (13-17)', description: 'Growing appetites, some independence' },
  { id: 'adult', label: '👤 Adult (18-64)', description: 'Full range of meal options' },
  { id: 'senior', label: '👴 Senior (65+)', description: 'Health-conscious, easier preparation' }
];

const COMMON_ALLERGENS = [
  { id: 'nuts', label: '🥜 Tree Nuts', severity: 'high' },
  { id: 'peanuts', label: '🥜 Peanuts', severity: 'high' },
  { id: 'dairy', label: '🥛 Dairy/Milk', severity: 'medium' },
  { id: 'eggs', label: '🥚 Eggs', severity: 'medium' },
  { id: 'shellfish', label: '🦐 Shellfish', severity: 'high' },
  { id: 'fish', label: '🐟 Fish', severity: 'medium' },
  { id: 'soy', label: '🫘 Soy', severity: 'medium' },
  { id: 'sesame', label: '🌱 Sesame', severity: 'medium' },
  { id: 'wheat', label: '🌾 Wheat/Gluten', severity: 'medium' }
];

const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free', 
  'keto', 'paleo', 'low-sodium', 'diabetic-friendly', 'low-fat',
  'nut-free', 'shellfish-free', 'egg-free', 'soy-free'
];

export default function FamilySetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing family members
  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load family members:', error);
        return;
      }

      if (data) {
        setFamilyMembers(data.map(member => ({
          ...member,
          food_preferences: member.food_preferences || {
            loves: [],
            dislikes: [],
            adventurousness: 'average'
          }
        })));
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  // Add new family member
  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      name: '',
      age_group: 'adult',
      dietary_restrictions: [],
      allergies: [],
      allergy_severity: [],
      food_preferences: {
        loves: [],
        dislikes: [],
        adventurousness: 'average'
      }
    };
    setEditingMember(newMember);
    setShowMemberModal(true);
  };

  // Save family member
  const saveFamilyMember = async (member: FamilyMember) => {
    if (!user) return;

    if (!member.name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this family member.');
      return;
    }

    try {
      const memberData = {
        user_id: user.id,
        name: member.name.trim(),
        age_group: member.age_group,
        dietary_restrictions: member.dietary_restrictions,
        allergies: member.allergies,
        allergy_severity: member.allergy_severity,
        food_preferences: member.food_preferences,
        special_needs: member.special_needs,
        medical_dietary_requirements: member.medical_dietary_requirements
      };

      if (member.id) {
        // Update existing member
        const { error } = await supabase
          .from('family_members')
          .update(memberData)
          .eq('id', member.id);

        if (error) {
          Alert.alert('Error', 'Failed to update family member');
          return;
        }

        setFamilyMembers(prev => 
          prev.map(m => m.id === member.id ? { ...member, ...memberData } : m)
        );
      } else {
        // Create new member
        const { data, error } = await supabase
          .from('family_members')
          .insert(memberData)
          .select()
          .single();

        if (error) {
          Alert.alert('Error', 'Failed to add family member');
          return;
        }

        setFamilyMembers(prev => [...prev, { ...member, ...data }]);
      }

      setShowMemberModal(false);
      setEditingMember(null);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    setLoading(true);

    try {
      // Mark onboarding as completed
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('id', user!.id);

      console.log('✅ Onboarding completed!');
      
      Alert.alert(
        'Setup Complete! 🎉',
        `Welcome to Ingred! ${familyMembers.length > 0 ? `We've added ${familyMembers.length} family member${familyMembers.length !== 1 ? 's' : ''} and o` : 'O'}ur AI is ready to create amazing meal plans for your family.`,
        [
          {
            text: 'Generate First Recipe',
            onPress: () => {
              console.log('🚀 Navigate to first recipe generation');
              router.replace('/test-recipe'); // For now, use test screen
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong completing setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Family Members</Text>
        <Text style={styles.subtitle}>
          Add family members for personalized meal planning (optional)
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introduction}>
          <Text style={styles.introTitle}>🧠 Advanced Family Intelligence</Text>
          <Text style={styles.introText}>
            This is optional but powerful! Add family members with their specific needs, 
            and our AI will create meals that satisfy everyone while coordinating safety 
            requirements across your entire household.
          </Text>
        </View>

        {/* Family Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>
            Your Family ({familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''})
          </Text>

          {familyMembers.map((member, index) => (
            <View key={member.id || index} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberAge}>
                    {AGE_GROUPS.find(g => g.id === member.age_group)?.label || member.age_group}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setEditingMember({ ...member });
                    setShowMemberModal(true);
                  }}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Member Details */}
              <View style={styles.memberDetails}>
                {member.allergies.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>⚠️ Allergies:</Text>
                    <Text style={[styles.detailValue, styles.allergyValue]}>
                      {member.allergies.join(', ')}
                    </Text>
                  </View>
                )}
                
                {member.dietary_restrictions.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dietary:</Text>
                    <Text style={styles.detailValue}>
                      {member.dietary_restrictions.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Add Member Button */}
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={addFamilyMember}
          >
            <Text style={styles.addMemberButtonText}>+ Add Family Member</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, loading && styles.completeButtonDisabled]}
          onPress={completeOnboarding}
          disabled={loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? 'Completing Setup...' : 'Complete Setup & Start Meal Planning'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          You can always add or edit family members later in settings
        </Text>
      </View>

      {/* Family Member Modal */}
      <FamilyMemberModal
        visible={showMemberModal}
        member={editingMember}
        onSave={saveFamilyMember}
        onClose={() => {
          setShowMemberModal(false);
          setEditingMember(null);
        }}
      />
    </View>
  );
}

// Family Member Edit Modal Component
interface FamilyMemberModalProps {
  visible: boolean
  member: FamilyMember | null
  onSave: (member: FamilyMember) => void
  onClose: () => void
}

function FamilyMemberModal({ visible, member, onSave, onClose }: FamilyMemberModalProps) {
  const [editedMember, setEditedMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    if (member) {
      setEditedMember({ ...member });
    }
  }, [member]);

  if (!editedMember) return null;

  const updateMember = (key: keyof FamilyMember, value: any) => {
    setEditedMember(prev => prev ? { ...prev, [key]: value } : null);
  };

  const toggleArrayValue = (key: keyof FamilyMember, value: string) => {
    setEditedMember(prev => {
      if (!prev) return null;
      const currentArray = prev[key] as string[];
      return {
        ...prev,
        [key]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editedMember.id ? 'Edit' : 'Add'} Family Member
          </Text>
          <TouchableOpacity onPress={() => onSave(editedMember)}>
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Name */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Basic Information</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Family member's name"
              value={editedMember.name}
              onChangeText={(text) => updateMember('name', text)}
            />
          </View>

          {/* Age Group */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Age Group</Text>
            <View style={styles.optionGrid}>
              {AGE_GROUPS.map((age) => (
                <TouchableOpacity
                  key={age.id}
                  style={[
                    styles.optionCard,
                    editedMember.age_group === age.id && styles.optionCardSelected
                  ]}
                  onPress={() => updateMember('age_group', age.id)}
                >
                  <Text style={styles.optionLabel}>{age.label}</Text>
                  <Text style={styles.optionDescription}>{age.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Allergies */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>⚠️ Allergies (Critical for Safety)</Text>
            <View style={styles.allergenGrid}>
              {COMMON_ALLERGENS.map((allergen) => (
                <TouchableOpacity
                  key={allergen.id}
                  style={[
                    styles.allergenCard,
                    editedMember.allergies.includes(allergen.id) && styles.allergenCardSelected
                  ]}
                  onPress={() => toggleArrayValue('allergies', allergen.id)}
                >
                  <Text style={styles.allergenLabel}>{allergen.label}</Text>
                  {allergen.severity === 'high' && (
                    <Text style={styles.allergenSeverity}>High Risk</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dietary Restrictions */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Dietary Restrictions</Text>
            <View style={styles.dietaryGrid}>
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <TouchableOpacity
                  key={restriction}
                  style={[
                    styles.dietaryCard,
                    editedMember.dietary_restrictions.includes(restriction) && styles.dietaryCardSelected
                  ]}
                  onPress={() => toggleArrayValue('dietary_restrictions', restriction)}
                >
                  <Text style={styles.dietaryLabel}>{restriction}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalBottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },

  // Content
  content: {
    flex: 1,
  },
  introduction: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F0F4FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  membersSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  memberAge: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  memberDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  allergyValue: {
    color: '#DC2626',
    fontWeight: '500',
  },
  addMemberButton: {
    backgroundColor: '#F4F3FF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  addMemberButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  completeButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  modalSaveText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  optionGrid: {
    gap: 8,
  },
  optionCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F4F3FF',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenCardSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  allergenLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  allergenSeverity: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  dietaryCardSelected: {
    backgroundColor: '#F4F3FF',
    borderColor: '#8B5CF6',
  },
  dietaryLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  modalBottomSpacing: {
    height: 40,
  },
  bottomSpacing: {
    height: 40,
  },
});