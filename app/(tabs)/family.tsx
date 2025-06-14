import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

/**
 * Enhanced Family Management Screen - Real Database Integration
 * 
 * Revolutionary family complexity handling that sets Ingred apart:
 * - Individual dietary profiles with safety coordination
 * - Real-time allergy conflict detection
 * - Cross-family meal planning intelligence
 * - Child-friendly vs adult restriction handling
 * - Emergency allergy information management
 */

interface FamilyMember {
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

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ 
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

export default function EnhancedFamilyScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // State management
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Load family members from database
  const loadFamilyMembers = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading family members for user:', user.id);

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading family members:', error);
        Alert.alert('Error', 'Failed to load family members. Please try again.');
        return;
      }

      console.log(`✅ Loaded ${data?.length || 0} family members`);

      // Process the data to match our interface
      const processedMembers: FamilyMember[] = (data || []).map(member => ({
        ...member,
        food_preferences: member.food_preferences || {},
        dislikes: member.dislikes || [],
        dietary_restrictions: member.dietary_restrictions || [],
        allergies: member.allergies || [],
        allergy_severity: member.allergy_severity || [],
      }));

      setFamilyMembers(processedMembers);
    } catch (error) {
      console.error('💥 Unexpected error loading family members:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFamilyMembers();
    setRefreshing(false);
  }, [loadFamilyMembers]);

  // Load family members on mount
  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);

  // Delete family member
  const handleDeleteMember = async (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (!member) return;

    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${member.name} from your family? This will affect their meal planning.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('family_members')
                .delete()
                .eq('id', memberId);

              if (error) {
                Alert.alert('Error', 'Failed to remove family member');
                return;
              }

              // Update local state
              setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
              
              Alert.alert('Success', `${member.name} has been removed from your family.`);
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  // Edit family member
  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowAddModal(true);
  };

  // Add family member
  const handleAddMember = () => {
    setEditingMember(null);
    setShowAddModal(true);
  };

  // Manage safety for specific member
  const handleManageSafety = (member: FamilyMember) => {
    const allergyDetails = member.allergies.map((allergy, index) => {
      const severity = member.allergy_severity[index] || 'mild';
      return `• ${allergy} (${severity})`;
    }).join('\n');

    Alert.alert(
      `Safety Management - ${member.name}`,
      `🛡️ Current allergies:\n${allergyDetails || 'None'}\n\n📋 Dietary restrictions:\n${member.dietary_restrictions.join(', ') || 'None'}\n\n⚠️ Special needs:\n${member.special_needs || 'None'}`,
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Edit Safety Info', 
          onPress: () => handleEditMember(member)
        },
      ]
    );
  };

  // Family safety overview
  const handleFamilySafetyOverview = () => {
    const allAllergies = familyMembers.flatMap(m => m.allergies);
    const criticalMembers = familyMembers.filter(m => 
      m.allergy_severity.includes('life_threatening') || m.allergy_severity.includes('severe')
    );
    const criticalAllergies = criticalMembers.flatMap(m => m.allergies);

    Alert.alert(
      'Family Safety Overview',
      `Family-wide allergen management:\n\n🚨 Critical allergies: ${[...new Set(criticalAllergies)].join(', ') || 'None'}\n\n🛡️ All allergies: ${[...new Set(allAllergies)].join(', ') || 'None'}\n\n👥 Members with critical allergies: ${criticalMembers.length}\n\nIngred AI considers all family allergies when generating recipes.`,
      [{ text: 'Understood' }]
    );
  };

  // Safety analysis
  const getSafetyAnalysis = () => {
    const criticalMembers = familyMembers.filter(m => 
      m.allergy_severity.includes('life_threatening') || m.allergy_severity.includes('severe')
    );
    
    const allAllergies = [...new Set(familyMembers.flatMap(m => m.allergies))];
    const allRestrictions = [...new Set(familyMembers.flatMap(m => m.dietary_restrictions))];
    
    return {
      hasCriticalAllergies: criticalMembers.length > 0,
      criticalMemberCount: criticalMembers.length,
      totalAllergies: allAllergies.length,
      totalRestrictions: allRestrictions.length,
      conflictingDiets: checkDietaryConflicts(familyMembers)
    };
  };

  const checkDietaryConflicts = (members: FamilyMember[]) => {
    const vegetarians = members.filter(m => 
      m.dietary_restrictions.some(r => r.includes('vegetarian') || r.includes('vegan'))
    );
    const nonVegetarians = members.filter(m => 
      !m.dietary_restrictions.some(r => r.includes('vegetarian') || r.includes('vegan'))
    );
    
    return vegetarians.length > 0 && nonVegetarians.length > 0;
  };

  const safetyAnalysis = getSafetyAnalysis();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading family members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Family Management</Text>
          <Text style={styles.headerSubtitle}>
            {familyMembers.length} family member{familyMembers.length !== 1 ? 's' : ''} • Individual preferences & safety
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMember}
          accessible={true}
          accessibilityLabel="Add new family member"
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Overview */}
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
          </View>
        </View>
        <Text style={styles.safetyOverviewArrow}>›</Text>
      </TouchableOpacity>

      {/* Family Members List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {familyMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.emptyStateTitle}>No Family Members Yet</Text>
            <Text style={styles.emptyStateText}>
              Add family members to create personalized meal plans that consider everyone's dietary needs and preferences.
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddMember}>
              <Text style={styles.emptyStateButtonText}>Add First Family Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          familyMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onManageSafety={handleManageSafety}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom Notice */}
      <View style={styles.bottomNotice}>
        <Text style={styles.bottomNoticeText}>
          🧠 AI generates recipes considering all family members' preferences and allergies
        </Text>
      </View>

      {/* Add/Edit Family Member Modal */}
      <FamilyMemberModal
        visible={showAddModal}
        member={editingMember}
        onSave={(member) => {
          // Refresh the list after saving
          loadFamilyMembers();
          setShowAddModal(false);
          setEditingMember(null);
        }}
        onClose={() => {
          setShowAddModal(false);
          setEditingMember(null);
        }}
      />
    </SafeAreaView>
  );
}

// Family Member Add/Edit Modal Component
interface FamilyMemberModalProps {
  visible: boolean;
  member: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
  onClose: () => void;
}

// Comprehensive food categories and options
const ALLERGY_OPTIONS = [
  // The Big 9 Allergens
  { id: 'milk', label: '🥛 Milk/Dairy', category: 'Major Allergens' },
  { id: 'eggs', label: '🥚 Eggs', category: 'Major Allergens' },
  { id: 'fish', label: '🐟 Fish', category: 'Major Allergens' },
  { id: 'shellfish', label: '🦐 Shellfish', category: 'Major Allergens' },
  { id: 'tree_nuts', label: '🌰 Tree Nuts', category: 'Major Allergens' },
  { id: 'peanuts', label: '🥜 Peanuts', category: 'Major Allergens' },
  { id: 'wheat', label: '🌾 Wheat/Gluten', category: 'Major Allergens' },
  { id: 'soy', label: '🫘 Soy', category: 'Major Allergens' },
  { id: 'sesame', label: '🌱 Sesame', category: 'Major Allergens' },
  // Additional Allergens
  { id: 'sulfites', label: '🍷 Sulfites', category: 'Other Allergens' },
  { id: 'mustard', label: '🌻 Mustard', category: 'Other Allergens' },
  { id: 'celery', label: '🥬 Celery', category: 'Other Allergens' },
  { id: 'lupin', label: '🌸 Lupin', category: 'Other Allergens' },
  { id: 'mollusks', label: '🐚 Mollusks', category: 'Other Allergens' },
];

const SEVERITY_OPTIONS = [
  { id: 'mild', label: '😊 Mild', displayName: 'Mild', description: 'Minor discomfort' },
  { id: 'moderate', label: '😐 Moderate', displayName: 'Moderate', description: 'Noticeable reaction' },
  { id: 'severe', label: '😰 Severe', displayName: 'Severe', description: 'Strong reaction, avoid completely' },
  { id: 'life_threatening', label: '🚨 Life-Threatening', displayName: 'Life threatening', description: 'Emergency risk' },
];

const DIETARY_RESTRICTIONS = [
  // Medical
  { id: 'gluten_free', label: 'Gluten-Free', category: 'Medical' },
  { id: 'dairy_free', label: 'Dairy-Free', category: 'Medical' },
  { id: 'nut_free', label: 'Nut-Free', category: 'Medical' },
  { id: 'diabetic_friendly', label: 'Diabetic-Friendly', category: 'Medical' },
  { id: 'low_sodium', label: 'Low-Sodium', category: 'Medical' },
  { id: 'low_fodmap', label: 'Low-FODMAP', category: 'Medical' },
  // Lifestyle
  { id: 'vegetarian', label: 'Vegetarian', category: 'Lifestyle' },
  { id: 'vegan', label: 'Vegan', category: 'Lifestyle' },
  { id: 'pescatarian', label: 'Pescatarian', category: 'Lifestyle' },
  { id: 'keto', label: 'Ketogenic', category: 'Lifestyle' },
  { id: 'paleo', label: 'Paleo', category: 'Lifestyle' },
  { id: 'low_carb', label: 'Low-Carb', category: 'Lifestyle' },
  { id: 'whole30', label: 'Whole30', category: 'Lifestyle' },
  { id: 'mediterranean', label: 'Mediterranean', category: 'Lifestyle' },
  { id: 'raw_food', label: 'Raw Food', category: 'Lifestyle' },
  // Religious
  { id: 'halal', label: 'Halal', category: 'Religious' },
  { id: 'kosher', label: 'Kosher', category: 'Religious' },
];

const FOOD_DISLIKES_CATEGORIES = {
  vegetables: {
    title: '🥬 Vegetables',
    items: [
      'mushrooms', 'onions', 'garlic', 'bell_peppers', 'hot_peppers', 'broccoli', 
      'brussels_sprouts', 'cauliflower', 'spinach', 'kale', 'lettuce', 'tomatoes', 
      'carrots', 'celery', 'asparagus', 'artichokes', 'eggplant', 'zucchini', 
      'cucumber', 'beetroot', 'radishes', 'cabbage', 'leeks'
    ]
  },
  proteins: {
    title: '🥩 Proteins',
    items: [
      'beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck', 'white_fish', 
      'oily_fish', 'shellfish', 'prawns', 'crab', 'lobster', 'mussels', 
      'oysters', 'tofu', 'tempeh', 'beans', 'lentils', 'chickpeas', 
      'liver', 'organ_meats'
    ]
  },
  dairy: {
    title: '🧀 Dairy & Alternatives',
    items: [
      'milk', 'mild_cheese', 'strong_cheese', 'blue_cheese', 'goat_cheese', 
      'yogurt', 'cream', 'butter', 'non_dairy_milk', 'vegan_cheese'
    ]
  },
  grains: {
    title: '🌾 Grains & Starches',
    items: [
      'rice', 'pasta', 'bread', 'quinoa', 'oats', 'barley', 'potatoes', 
      'sweet_potatoes', 'couscous', 'bulgur'
    ]
  },
  fruits: {
    title: '🍎 Fruits',
    items: [
      'avocado', 'coconut', 'olives', 'citrus_fruits', 'berries', 'bananas', 
      'apples', 'stone_fruits', 'tropical_fruits', 'dried_fruits', 'grapes'
    ]
  },
  flavors: {
    title: '🌶️ Flavors & Spices',
    items: [
      'spicy_food', 'garlic', 'cilantro', 'mint', 'basil', 'oregano', 'cumin', 
      'curry_spices', 'ginger', 'licorice', 'dill', 'rosemary', 'thyme', 
      'paprika', 'cinnamon'
    ]
  },
  textures: {
    title: '🤲 Textures & Preparations',
    items: [
      'slimy_textures', 'crunchy_foods', 'soft_foods', 'fried_foods', 
      'raw_foods', 'very_hot_foods', 'cold_foods', 'chewy_foods', 
      'creamy_foods', 'lumpy_foods'
    ]
  },
  condiments: {
    title: '🍯 Condiments & Extras',
    items: [
      'mayonnaise', 'mustard', 'ketchup', 'pickles', 'vinegar', 'hot_sauce', 
      'soy_sauce', 'fish_sauce', 'honey', 'nuts', 'seeds', 'olive_oil'
    ]
  }
};

interface AllergySelection {
  allergen: string;
  severity: string;
}

const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  visible,
  member,
  onSave,
  onClose,
}) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | 'senior'>('adult');
  const [selectedAllergies, setSelectedAllergies] = useState<AllergySelection[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  
  // UI state for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize form when member changes
  useEffect(() => {
    if (member) {
      setName(member.name);
      setAgeGroup(member.age_group);
      
      // Convert allergies and severity arrays to AllergySelection objects
      const allergySelections: AllergySelection[] = member.allergies.map((allergen, index) => ({
        allergen,
        severity: member.allergy_severity[index] || 'mild'
      }));
      setSelectedAllergies(allergySelections);
      
      setSelectedRestrictions(member.dietary_restrictions);
      setSelectedDislikes(member.dislikes);
      setSpecialNeeds(member.special_needs || '');
    } else {
      // Reset form for new member
      setName('');
      setAgeGroup('adult');
      setSelectedAllergies([]);
      setSelectedRestrictions([]);
      setSelectedDislikes([]);
      setSpecialNeeds('');
    }
  }, [member]);

  const toggleAllergySelection = (allergenId: string) => {
    setSelectedAllergies(prev => {
      const existing = prev.find(a => a.allergen === allergenId);
      if (existing) {
        // Remove if already selected
        return prev.filter(a => a.allergen !== allergenId);
      } else {
        // Add with default mild severity
        return [...prev, { allergen: allergenId, severity: 'mild' }];
      }
    });
  };

  const updateAllergySeverity = (allergenId: string, severity: string) => {
    setSelectedAllergies(prev => 
      prev.map(a => a.allergen === allergenId ? { ...a, severity } : a)
    );
  };

  const toggleRestriction = (restrictionId: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(restrictionId) 
        ? prev.filter(r => r !== restrictionId)
        : [...prev, restrictionId]
    );
  };

  const toggleDislike = (dislikeId: string) => {
    setSelectedDislikes(prev => 
      prev.includes(dislikeId) 
        ? prev.filter(d => d !== dislikeId)
        : [...prev, dislikeId]
    );
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const formatLabel = (id: string) => {
    return id.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this family member.');
      return;
    }

    setSaving(true);
    
    try {
      const memberData = {
        user_id: user.id,
        name: name.trim(),
        age_group: ageGroup,
        allergies: selectedAllergies.map(a => a.allergen),
        allergy_severity: selectedAllergies.map(a => a.severity),
        dietary_restrictions: selectedRestrictions,
        dislikes: selectedDislikes,
        special_needs: specialNeeds.trim() || null,
        food_preferences: {},
        updated_at: new Date().toISOString(),
      };

      if (member?.id) {
        // Update existing member
        const { error } = await supabase
          .from('family_members')
          .update(memberData)
          .eq('id', member.id);

        if (error) throw error;
        
        Alert.alert('Success', `${name} has been updated successfully.`);
      } else {
        // Create new member
        const { error } = await supabase
          .from('family_members')
          .insert(memberData);

        if (error) throw error;
        
        Alert.alert('Success', `${name} has been added to your family.`);
      }

      onSave(memberData as FamilyMember);
    } catch (error) {
      console.error('Error saving family member:', error);
      Alert.alert('Error', 'Failed to save family member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} disabled={saving}>
            <Text style={[styles.modalCancelText, saving && { opacity: 0.5 }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {member ? 'Edit' : 'Add'} Family Member
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <Text style={styles.modalSaveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Name */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Family member's name"
              value={name}
              onChangeText={setName}
              editable={!saving}
            />
          </View>

          {/* Age Group */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Age Group</Text>
            <View style={styles.ageGroupContainer}>
              {(['child', 'teen', 'adult', 'senior'] as const).map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.ageGroupButton,
                    ageGroup === age && styles.ageGroupButtonSelected
                  ]}
                  onPress={() => setAgeGroup(age)}
                  disabled={saving}
                >
                  <Text style={[
                    styles.ageGroupButtonText,
                    ageGroup === age && styles.ageGroupButtonTextSelected
                  ]}>
                    {age.charAt(0).toUpperCase() + age.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Allergies */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>⚠️ Allergies (Critical for Safety)</Text>
            
            {/* Major Allergens */}
            <View style={styles.allergenCategory}>
              <Text style={styles.categorySubtitle}>Major Allergens</Text>
              {ALLERGY_OPTIONS.filter(a => a.category === 'Major Allergens').map((option) => {
                const isSelected = selectedAllergies.find(a => a.allergen === option.id);
                return (
                  <View key={option.id} style={styles.allergenItem}>
                    <TouchableOpacity
                      style={[
                        styles.allergenButton,
                        isSelected && styles.allergenButtonSelected
                      ]}
                      onPress={() => toggleAllergySelection(option.id)}
                      disabled={saving}
                    >
                      <Text style={[
                        styles.allergenButtonText,
                        isSelected && styles.allergenButtonTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                    
                    {isSelected && (
                      <View style={styles.severityContainer}>
                        <Text style={styles.severityLabel}>Severity:</Text>
                        <View style={styles.severityButtons}>
                          {SEVERITY_OPTIONS.map((severity) => (
                            <TouchableOpacity
                              key={severity.id}
                              style={[
                                styles.severityButton,
                                isSelected.severity === severity.id && styles.severityButtonSelected
                              ]}
                              onPress={() => updateAllergySeverity(option.id, severity.id)}
                              disabled={saving}
                            >
                              <Text style={[
                                styles.severityButtonText,
                                isSelected.severity === severity.id && styles.severityButtonTextSelected
                              ]}>
                                {severity.displayName}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Other Allergens */}
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={() => toggleSection('otherAllergens')}
            >
              <Text style={styles.expandableHeaderText}>Other Allergens</Text>
              <Text style={styles.expandableArrow}>
                {expandedSections.otherAllergens ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {expandedSections.otherAllergens && (
              <View style={styles.allergenList}>
                {ALLERGY_OPTIONS.filter(a => a.category === 'Other Allergens').map((option) => {
                  const isSelected = selectedAllergies.find(a => a.allergen === option.id);
                  return (
                    <View key={option.id} style={styles.allergenItem}>
                      <TouchableOpacity
                        style={[
                          styles.allergenButton,
                          isSelected && styles.allergenButtonSelected
                        ]}
                        onPress={() => toggleAllergySelection(option.id)}
                        disabled={saving}
                      >
                        <Text style={[
                          styles.allergenButtonText,
                          isSelected && styles.allergenButtonTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                      
                      {isSelected && (
                        <View style={styles.severityContainer}>
                          <Text style={styles.severityLabel}>Severity:</Text>
                          <View style={styles.severityButtons}>
                            {SEVERITY_OPTIONS.map((severity) => (
                              <TouchableOpacity
                                key={severity.id}
                                style={[
                                  styles.severityButton,
                                  isSelected.severity === severity.id && styles.severityButtonSelected
                                ]}
                                onPress={() => updateAllergySeverity(option.id, severity.id)}
                                disabled={saving}
                              >
                                <Text style={[
                                  styles.severityButtonText,
                                  isSelected.severity === severity.id && styles.severityButtonTextSelected
                                ]}>
                                  {severity.displayName}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Dietary Restrictions */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Dietary Restrictions</Text>
            
            {(['Medical', 'Lifestyle', 'Religious'] as const).map((category) => (
              <View key={category} style={styles.restrictionCategory}>
                <TouchableOpacity 
                  style={styles.expandableHeader}
                  onPress={() => toggleSection(`restrictions_${category}`)}
                >
                  <Text style={styles.expandableHeaderText}>{category}</Text>
                  <Text style={styles.expandableArrow}>
                    {expandedSections[`restrictions_${category}`] ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                {expandedSections[`restrictions_${category}`] && (
                  <View style={styles.restrictionList}>
                    {DIETARY_RESTRICTIONS.filter(r => r.category === category).map((restriction) => (
                      <TouchableOpacity
                        key={restriction.id}
                        style={[
                          styles.restrictionButton,
                          selectedRestrictions.includes(restriction.id) && styles.restrictionButtonSelected
                        ]}
                        onPress={() => toggleRestriction(restriction.id)}
                        disabled={saving}
                      >
                        <Text style={[
                          styles.restrictionButtonText,
                          selectedRestrictions.includes(restriction.id) && styles.restrictionButtonTextSelected
                        ]}>
                          {restriction.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Food Dislikes */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Food Dislikes</Text>
            <Text style={styles.modalHint}>
              Select specific foods this family member prefers to avoid
            </Text>
            
            {Object.entries(FOOD_DISLIKES_CATEGORIES).map(([categoryKey, category]) => (
              <View key={categoryKey} style={styles.dislikeCategory}>
                <TouchableOpacity 
                  style={styles.expandableHeader}
                  onPress={() => toggleSection(`dislikes_${categoryKey}`)}
                >
                  <Text style={styles.expandableHeaderText}>{category.title}</Text>
                  <Text style={styles.expandableArrow}>
                    {expandedSections[`dislikes_${categoryKey}`] ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                {expandedSections[`dislikes_${categoryKey}`] && (
                  <View style={styles.dislikeGrid}>
                    {category.items.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.dislikeOption,
                          selectedDislikes.includes(item) && styles.dislikeOptionSelected
                        ]}
                        onPress={() => toggleDislike(item)}
                        disabled={saving}
                      >
                        <Text style={[
                          styles.dislikeOptionText,
                          selectedDislikes.includes(item) && styles.dislikeOptionTextSelected
                        ]}>
                          {formatLabel(item)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.modalBottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontFamily: 'Inter',
  },

  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  addButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },

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

  safetyOverviewArrow: {
    fontSize: 18,
    color: '#6B7280',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Inter',
  },

  emptyStateButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },

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

  // Bottom Notice
  bottomNotice: {
    backgroundColor: '#F4F3FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  bottomNoticeText: {
    fontSize: 14,
    color: '#5B21B6',
    textAlign: 'center',
    fontFamily: 'Inter',
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter',
  },

  modalSaveText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },

  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter',
  },

  modalTextArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'Inter',
  },

  modalHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  ageGroupContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  ageGroupButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },

  ageGroupButtonSelected: {
    backgroundColor: '#F4F3FF',
    borderColor: '#8B5CF6',
  },

  ageGroupButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  ageGroupButtonTextSelected: {
    color: '#8B5CF6',
  },

  // Expandable Sections
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },

  expandableHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    fontFamily: 'Inter',
  },

  expandableArrow: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Option Grids (For general use)
  optionGrid: {
    gap: 8,
    marginBottom: 16,
  },

  // Allergen Options (Improved Layout)
  allergenCategory: {
    marginBottom: 20,
  },

  categorySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Inter',
  },

  allergenList: {
    marginBottom: 12,
  },

  allergenItem: {
    marginBottom: 12,
  },

  allergenButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  allergenButtonSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },

  allergenButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  allergenButtonTextSelected: {
    color: '#DC2626',
  },

  // Severity Selector (Fixed Layout)
  severityContainer: {
    marginTop: 8,
    paddingLeft: 16,
  },

  severityLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 6,
    fontFamily: 'Inter',
  },

  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  severityButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },

  severityButtonSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },

  severityButtonText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  severityButtonTextSelected: {
    color: '#DC2626',
  },

  // Dietary Restrictions (Improved Layout)
  restrictionCategory: {
    marginBottom: 16,
  },

  restrictionList: {
    gap: 8,
    marginBottom: 12,
  },

  restrictionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  restrictionButtonSelected: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },

  restrictionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  restrictionButtonTextSelected: {
    color: '#1E40AF',
  },

  // Food Dislikes (Grid Layout for Small Items)
  dislikeCategory: {
    marginBottom: 16,
  },

  dislikeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  dislikeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },

  dislikeOptionSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },

  dislikeOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  dislikeOptionTextSelected: {
    color: '#92400E',
  },

  modalBottomSpacing: {
    height: 40,
  },
});