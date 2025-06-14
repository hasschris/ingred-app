import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface AllergySelection {
  allergen: string;
  severity: string;
}

interface AllergyManagementProps {
  selectedAllergies: AllergySelection[];
  onAllergyChange: (allergies: AllergySelection[]) => void;
  disabled?: boolean;
}

// Comprehensive allergen database
const ALLERGY_OPTIONS = [
  // The Big 9 Allergens (FDA + EU requirements)
  { id: 'milk', label: '🥛 Milk/Dairy', category: 'Major Allergens', description: 'Includes all dairy products' },
  { id: 'eggs', label: '🥚 Eggs', category: 'Major Allergens', description: 'All egg-based products' },
  { id: 'fish', label: '🐟 Fish', category: 'Major Allergens', description: 'All fish varieties' },
  { id: 'shellfish', label: '🦐 Shellfish', category: 'Major Allergens', description: 'Shrimp, crab, lobster, etc.' },
  { id: 'tree_nuts', label: '🌰 Tree Nuts', category: 'Major Allergens', description: 'Almonds, walnuts, cashews, etc.' },
  { id: 'peanuts', label: '🥜 Peanuts', category: 'Major Allergens', description: 'Peanuts and peanut products' },
  { id: 'wheat', label: '🌾 Wheat/Gluten', category: 'Major Allergens', description: 'Wheat, barley, rye, malt' },
  { id: 'soy', label: '🫘 Soy', category: 'Major Allergens', description: 'Soybeans and soy products' },
  { id: 'sesame', label: '🌱 Sesame', category: 'Major Allergens', description: 'Sesame seeds and tahini' },
  
  // Additional Common Allergens
  { id: 'sulfites', label: '🍷 Sulfites', category: 'Other Allergens', description: 'Wine, dried fruits, preservatives' },
  { id: 'mustard', label: '🌻 Mustard', category: 'Other Allergens', description: 'Mustard seeds and products' },
  { id: 'celery', label: '🥬 Celery', category: 'Other Allergens', description: 'Celery and celeriac' },
  { id: 'lupin', label: '🌸 Lupin', category: 'Other Allergens', description: 'Lupin beans and flour' },
  { id: 'mollusks', label: '🐚 Mollusks', category: 'Other Allergens', description: 'Clams, oysters, scallops' },
];

const SEVERITY_OPTIONS = [
  { 
    id: 'mild', 
    label: '😊 Mild', 
    displayName: 'Mild', 
    description: 'Minor discomfort, digestive upset',
    color: '#FEF3C7',
    textColor: '#92400E'
  },
  { 
    id: 'moderate', 
    label: '😐 Moderate', 
    displayName: 'Moderate', 
    description: 'Noticeable symptoms, skin reactions',
    color: '#FED7AA',
    textColor: '#EA580C'
  },
  { 
    id: 'severe', 
    label: '😰 Severe', 
    displayName: 'Severe', 
    description: 'Strong reaction, respiratory issues',
    color: '#FEE2E2',
    textColor: '#DC2626'
  },
  { 
    id: 'life_threatening', 
    label: '🚨 Life-Threatening', 
    displayName: 'Life threatening', 
    description: 'Anaphylaxis risk, emergency care needed',
    color: '#FEE2E2',
    textColor: '#991B1B'
  },
];

export const AllergyManagement: React.FC<AllergyManagementProps> = ({
  selectedAllergies,
  onAllergyChange,
  disabled = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Major Allergens': true, // Major allergens always expanded by default
  });

  const toggleAllergySelection = (allergenId: string) => {
    const existing = selectedAllergies.find(a => a.allergen === allergenId);
    if (existing) {
      // Remove if already selected
      const updated = selectedAllergies.filter(a => a.allergen !== allergenId);
      onAllergyChange(updated);
    } else {
      // Add with default mild severity
      const updated = [...selectedAllergies, { allergen: allergenId, severity: 'mild' }];
      onAllergyChange(updated);
    }
  };

  const updateAllergySeverity = (allergenId: string, severity: string) => {
    const updated = selectedAllergies.map(a => 
      a.allergen === allergenId ? { ...a, severity } : a
    );
    onAllergyChange(updated);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getSeverityOption = (severityId: string) => {
    return SEVERITY_OPTIONS.find(s => s.id === severityId) || SEVERITY_OPTIONS[0];
  };

  const getCategoryAllergens = (category: string) => {
    return ALLERGY_OPTIONS.filter(option => option.category === category);
  };

  const getAllergenInfo = (allergenId: string) => {
    return ALLERGY_OPTIONS.find(option => option.id === allergenId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>⚠️ Allergies (Critical for Safety)</Text>
      <Text style={styles.sectionDescription}>
        Select all allergies and their severity levels. This information is crucial for safe meal planning.
      </Text>

      {/* Major Allergens - Always Prominent */}
      <View style={styles.allergenCategory}>
        <TouchableOpacity 
          style={styles.categoryHeader}
          onPress={() => toggleSection('Major Allergens')}
          disabled={disabled}
        >
          <View style={styles.categoryHeaderContent}>
            <Text style={styles.categoryTitle}>🚨 Major Allergens (The Big 9)</Text>
            <Text style={styles.categorySubtitle}>Most common and regulated allergens</Text>
          </View>
          <Text style={styles.expandArrow}>
            {expandedSections['Major Allergens'] ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSections['Major Allergens'] && (
          <View style={styles.allergenList}>
            {getCategoryAllergens('Major Allergens').map((option) => {
              const isSelected = selectedAllergies.find(a => a.allergen === option.id);
              const allergenInfo = getAllergenInfo(option.id);
              
              return (
                <View key={option.id} style={styles.allergenItem}>
                  <TouchableOpacity
                    style={[
                      styles.allergenButton,
                      isSelected && styles.allergenButtonSelected
                    ]}
                    onPress={() => toggleAllergySelection(option.id)}
                    disabled={disabled}
                    accessible={true}
                    accessibilityLabel={`${option.label} allergy option`}
                    accessibilityRole="button"
                  >
                    <View style={styles.allergenButtonContent}>
                      <Text style={[
                        styles.allergenButtonText,
                        isSelected && styles.allergenButtonTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      {allergenInfo && (
                        <Text style={styles.allergenDescription}>
                          {allergenInfo.description}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  {isSelected && (
                    <View style={styles.severityContainer}>
                      <Text style={styles.severityLabel}>Severity Level:</Text>
                      <View style={styles.severityButtons}>
                        {SEVERITY_OPTIONS.map((severity) => {
                          const isCurrentSeverity = isSelected.severity === severity.id;
                          const severityStyle = getSeverityOption(severity.id);
                          
                          return (
                            <TouchableOpacity
                              key={severity.id}
                              style={[
                                styles.severityButton,
                                isCurrentSeverity && {
                                  backgroundColor: severityStyle.color,
                                  borderColor: severityStyle.textColor,
                                }
                              ]}
                              onPress={() => updateAllergySeverity(option.id, severity.id)}
                              disabled={disabled}
                              accessible={true}
                              accessibilityLabel={`Set ${severity.displayName} severity for ${option.label}`}
                              accessibilityRole="button"
                            >
                              <Text style={[
                                styles.severityButtonText,
                                isCurrentSeverity && { 
                                  color: severityStyle.textColor,
                                  fontWeight: '600'
                                }
                              ]}>
                                {severity.displayName}
                              </Text>
                              {isCurrentSeverity && (
                                <Text style={[styles.severityDescription, { color: severityStyle.textColor }]}>
                                  {severity.description}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Other Allergens - Collapsible */}
      <View style={styles.allergenCategory}>
        <TouchableOpacity 
          style={styles.categoryHeader}
          onPress={() => toggleSection('Other Allergens')}
          disabled={disabled}
        >
          <View style={styles.categoryHeaderContent}>
            <Text style={styles.categoryTitle}>Other Allergens</Text>
            <Text style={styles.categorySubtitle}>Additional allergens and intolerances</Text>
          </View>
          <Text style={styles.expandArrow}>
            {expandedSections['Other Allergens'] ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSections['Other Allergens'] && (
          <View style={styles.allergenList}>
            {getCategoryAllergens('Other Allergens').map((option) => {
              const isSelected = selectedAllergies.find(a => a.allergen === option.id);
              const allergenInfo = getAllergenInfo(option.id);
              
              return (
                <View key={option.id} style={styles.allergenItem}>
                  <TouchableOpacity
                    style={[
                      styles.allergenButton,
                      isSelected && styles.allergenButtonSelected
                    ]}
                    onPress={() => toggleAllergySelection(option.id)}
                    disabled={disabled}
                  >
                    <View style={styles.allergenButtonContent}>
                      <Text style={[
                        styles.allergenButtonText,
                        isSelected && styles.allergenButtonTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      {allergenInfo && (
                        <Text style={styles.allergenDescription}>
                          {allergenInfo.description}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  {isSelected && (
                    <View style={styles.severityContainer}>
                      <Text style={styles.severityLabel}>Severity Level:</Text>
                      <View style={styles.severityButtons}>
                        {SEVERITY_OPTIONS.map((severity) => {
                          const isCurrentSeverity = isSelected.severity === severity.id;
                          const severityStyle = getSeverityOption(severity.id);
                          
                          return (
                            <TouchableOpacity
                              key={severity.id}
                              style={[
                                styles.severityButton,
                                isCurrentSeverity && {
                                  backgroundColor: severityStyle.color,
                                  borderColor: severityStyle.textColor,
                                }
                              ]}
                              onPress={() => updateAllergySeverity(option.id, severity.id)}
                              disabled={disabled}
                            >
                              <Text style={[
                                styles.severityButtonText,
                                isCurrentSeverity && { 
                                  color: severityStyle.textColor,
                                  fontWeight: '600'
                                }
                              ]}>
                                {severity.displayName}
                              </Text>
                              {isCurrentSeverity && (
                                <Text style={[styles.severityDescription, { color: severityStyle.textColor }]}>
                                  {severity.description}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Selected Allergies Summary */}
      {selectedAllergies.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.selectedSummaryTitle}>Selected Allergies ({selectedAllergies.length})</Text>
          <View style={styles.selectedAllergenList}>
            {selectedAllergies.map((selection, index) => {
              const allergenInfo = getAllergenInfo(selection.allergen);
              const severityInfo = getSeverityOption(selection.severity);
              const isCritical = selection.severity === 'severe' || selection.severity === 'life_threatening';
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.selectedAllergenTag,
                    isCritical && styles.selectedAllergenTagCritical
                  ]}
                >
                  <Text style={[
                    styles.selectedAllergenName,
                    isCritical && styles.selectedAllergenNameCritical
                  ]}>
                    {allergenInfo?.label || selection.allergen}
                  </Text>
                  <Text style={[
                    styles.selectedAllergenSeverity,
                    isCritical && styles.selectedAllergenSeverityCritical
                  ]}>
                    {severityInfo.displayName}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Safety Reminder */}
      <View style={styles.safetyReminder}>
        <Text style={styles.safetyReminderIcon}>🛡️</Text>
        <Text style={styles.safetyReminderText}>
          This information helps Ingred AI generate safer recipes, but always verify ingredients yourself. 
          Life-threatening allergies require extra caution.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  // Category Structure
  allergenCategory: {
    marginBottom: 24,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },

  categoryHeaderContent: {
    flex: 1,
  },

  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  categorySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  expandArrow: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  allergenList: {
    gap: 12,
  },

  // Allergen Items
  allergenItem: {
    marginBottom: 12,
  },

  allergenButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  allergenButtonSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },

  allergenButtonContent: {
    flex: 1,
  },

  allergenButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  allergenButtonTextSelected: {
    color: '#DC2626',
    fontWeight: '600',
  },

  allergenDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Severity Selection
  severityContainer: {
    marginTop: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },

  severityLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    fontFamily: 'Inter',
  },

  severityButtons: {
    gap: 8,
  },

  severityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },

  severityButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  severityDescription: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Inter',
  },

  // Selected Summary
  selectedSummary: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },

  selectedSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  selectedAllergenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  selectedAllergenTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  selectedAllergenTagCritical: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },

  selectedAllergenName: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  selectedAllergenNameCritical: {
    color: '#DC2626',
  },

  selectedAllergenSeverity: {
    fontSize: 9,
    color: '#78350F',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  selectedAllergenSeverityCritical: {
    color: '#991B1B',
    fontWeight: '600',
  },

  // Safety Reminder
  safetyReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },

  safetyReminderIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },

  safetyReminderText: {
    flex: 1,
    fontSize: 12,
    color: '#5B21B6',
    lineHeight: 18,
    fontFamily: 'Inter',
  },
});