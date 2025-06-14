import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { FamilyMember } from './FamilyMemberCard';

interface FamilyMemberModalProps {
  visible: boolean;
  member: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
  onClose: () => void;
}

interface AllergySelection {
  allergen: string;
  severity: string;
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

export const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
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

  // Allergen Options
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

  // Severity Selector
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

  // Dietary Restrictions
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

  // Food Dislikes
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