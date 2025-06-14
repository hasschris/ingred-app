import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

// Types for safety warnings
interface DetectedAllergen {
  name: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  icon: string;
  warning_text: string;
}

interface FamilyMember {
  id: string;
  name: string;
  age_group: 'child' | 'teen' | 'adult' | 'senior';
  dietary_restrictions: string[];
  allergies: string[];
  allergy_severity: string[];
}

interface SafetyWarningsProps {
  detectedAllergens: DetectedAllergen[];
  safetyWarnings: string[];
  safetyScore: number;
  allergenConsiderations?: string;
  familyMembers?: FamilyMember[];
  displayMode?: 'full' | 'compact' | 'critical-only';
  onEmergencyContact?: () => void;
  style?: any;
}

export default function SafetyWarnings({
  detectedAllergens,
  safetyWarnings,
  safetyScore,
  allergenConsiderations,
  familyMembers,
  displayMode = 'full',
  onEmergencyContact,
  style,
}: SafetyWarningsProps) {
  
  const [expandedWarnings, setExpandedWarnings] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(1));

  // Filter allergens by severity
  const criticalAllergens = detectedAllergens.filter(
    a => a.severity === 'severe' || a.severity === 'life_threatening'
  );
  const generalAllergens = detectedAllergens.filter(
    a => a.severity !== 'severe' && a.severity !== 'life_threatening'
  );

  // Check if any family members have matching allergies
  const getFamilyAllergenMatches = (allergenName: string) => {
    if (!familyMembers) return [];
    
    return familyMembers.filter(member => 
      member.allergies?.some(allergy => 
        allergy.toLowerCase().includes(allergenName.toLowerCase()) ||
        allergenName.toLowerCase().includes(allergy.toLowerCase())
      )
    );
  };

  // Get safety score styling
  const getSafetyScoreStyle = () => {
    if (safetyScore >= 90) return styles.safetyScoreHigh;
    if (safetyScore >= 70) return styles.safetyScoreMedium;
    return styles.safetyScoreLow;
  };

  // Start pulse animation for critical warnings
  React.useEffect(() => {
    if (criticalAllergens.length > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [criticalAllergens.length]);

  // Handle emergency allergen info
  const handleEmergencyInfo = () => {
    Alert.alert(
      '🚨 Emergency Allergen Information',
      `Critical allergens detected: ${criticalAllergens.map(a => a.name).join(', ')}\n\n` +
      '• Stop cooking immediately if unsure about ingredients\n' +
      '• Check all ingredient labels carefully\n' +
      '• Consult with family members about their specific allergies\n' +
      '• When in doubt, choose a different recipe\n\n' +
      'This app provides AI-generated suggestions only. Always prioritize family safety.',
      [
        { text: 'Contact Emergency Services', style: 'destructive', onPress: onEmergencyContact },
        { text: 'I Understand', style: 'default' }
      ]
    );
  };

  // Handle detailed warning info
  const handleDetailedWarnings = () => {
    const warningDetails = [
      ...safetyWarnings,
      ...detectedAllergens.map(a => `${a.icon} ${a.name}: ${a.warning_text}`)
    ].join('\n\n');

    Alert.alert(
      'Detailed Safety Information',
      warningDetails || 'No specific warnings detected for this recipe.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Return early for compact mode with no warnings
  if (displayMode === 'compact' && criticalAllergens.length === 0 && safetyWarnings.length === 0) {
    return (
      <View style={[styles.compactSafe, style]}>
        <Text style={styles.compactSafeIcon}>✅</Text>
        <Text style={styles.compactSafeText}>Safety Verified</Text>
        <View style={[styles.safetyScoreBadge, getSafetyScoreStyle()]}>
          <Text style={styles.safetyScoreText}>{safetyScore}%</Text>
        </View>
      </View>
    );
  }

  // Return only critical warnings for critical-only mode
  if (displayMode === 'critical-only' && criticalAllergens.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Critical Allergen Warnings */}
      {criticalAllergens.length > 0 && (
        <Animated.View 
          style={[
            styles.criticalSection,
            { transform: [{ scale: pulseAnimation }] }
          ]}
        >
          <View style={styles.criticalHeader}>
            <Text style={styles.criticalIcon}>🚨</Text>
            <View style={styles.criticalContent}>
              <Text style={styles.criticalTitle}>CRITICAL ALLERGEN WARNING</Text>
              <Text style={styles.criticalSubtitle}>
                Dangerous allergens detected for your family
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={handleEmergencyInfo}
              accessible={true}
              accessibilityLabel="Emergency allergen information"
              accessibilityRole="button"
            >
              <Text style={styles.emergencyText}>!</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.criticalAllergensList}>
            {criticalAllergens.map((allergen, index) => {
              const familyMatches = getFamilyAllergenMatches(allergen.name);
              
              return (
                <View key={index} style={styles.criticalAllergenItem}>
                  <View style={styles.allergenHeader}>
                    <Text style={styles.allergenIcon}>{allergen.icon}</Text>
                    <Text style={styles.allergenName}>{allergen.name}</Text>
                    <View style={styles.severityBadge}>
                      <Text style={styles.severityText}>
                        {allergen.severity === 'life_threatening' ? 'LIFE THREATENING' : 'SEVERE'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.allergenWarning}>{allergen.warning_text}</Text>
                  
                  {familyMatches.length > 0 && (
                    <View style={styles.familyMatchSection}>
                      <Text style={styles.familyMatchTitle}>⚠️ Affects Family Members:</Text>
                      {familyMatches.map(member => (
                        <Text key={member.id} style={styles.familyMatchName}>
                          • {member.name} ({member.age_group})
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.criticalActions}>
            <TouchableOpacity 
              style={styles.stopCookingButton}
              onPress={() => Alert.alert(
                'Recipe Safety Check',
                'We recommend choosing a different recipe that\'s safer for your family. Would you like to generate a new recipe?',
                [
                  { text: 'Keep This Recipe', style: 'cancel' },
                  { text: 'Choose Different Recipe', style: 'default' }
                ]
              )}
              accessible={true}
              accessibilityLabel="Choose a different recipe for safety"
              accessibilityRole="button"
            >
              <Text style={styles.stopCookingText}>🔄 Choose Safer Recipe</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* General Safety Information */}
      {displayMode === 'full' && (generalAllergens.length > 0 || safetyWarnings.length > 0) && (
        <View style={styles.generalSection}>
          <View style={styles.generalHeader}>
            <Text style={styles.generalTitle}>🛡️ Safety Information</Text>
            <View style={[styles.safetyScoreBadge, getSafetyScoreStyle()]}>
              <Text style={styles.safetyScoreText}>{safetyScore}%</Text>
            </View>
          </View>

          {/* General Allergens */}
          {generalAllergens.length > 0 && (
            <View style={styles.allergenSection}>
              <Text style={styles.allergenSectionTitle}>Detected Allergens:</Text>
              <View style={styles.allergenGrid}>
                {generalAllergens.map((allergen, index) => {
                  const familyMatches = getFamilyAllergenMatches(allergen.name);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.allergenChip,
                        familyMatches.length > 0 && styles.allergenChipFamilyMatch
                      ]}
                      onPress={() => Alert.alert(
                        `${allergen.icon} ${allergen.name}`,
                        `${allergen.warning_text}\n\n` +
                        `Confidence: ${Math.round(allergen.confidence * 100)}%\n` +
                        `Severity: ${allergen.severity}\n\n` +
                        (familyMatches.length > 0 
                          ? `⚠️ This affects: ${familyMatches.map(m => m.name).join(', ')}`
                          : 'No family members specifically affected.'),
                        [{ text: 'OK', style: 'default' }]
                      )}
                      accessible={true}
                      accessibilityLabel={`${allergen.name} allergen information`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.allergenChipIcon}>{allergen.icon}</Text>
                      <Text style={styles.allergenChipText}>{allergen.name}</Text>
                      {familyMatches.length > 0 && (
                        <Text style={styles.familyMatchIndicator}>⚠️</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Safety Warnings */}
          {safetyWarnings.length > 0 && (
            <View style={styles.warningsSection}>
              <TouchableOpacity
                style={styles.warningsHeader}
                onPress={() => setExpandedWarnings(!expandedWarnings)}
                accessible={true}
                accessibilityLabel={`${expandedWarnings ? 'Hide' : 'Show'} detailed safety warnings`}
                accessibilityRole="button"
              >
                <Text style={styles.warningsTitle}>
                  Safety Reminders ({safetyWarnings.length})
                </Text>
                <Text style={styles.expandIcon}>
                  {expandedWarnings ? '−' : '+'}
                </Text>
              </TouchableOpacity>

              {(expandedWarnings || safetyWarnings.length <= 2) && (
                <View style={styles.warningsList}>
                  {safetyWarnings.slice(0, expandedWarnings ? undefined : 2).map((warning, index) => (
                    <View key={index} style={styles.warningItem}>
                      <Text style={styles.warningIcon}>⚠️</Text>
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                  {!expandedWarnings && safetyWarnings.length > 2 && (
                    <TouchableOpacity
                      style={styles.showMoreWarnings}
                      onPress={() => setExpandedWarnings(true)}
                    >
                      <Text style={styles.showMoreText}>
                        Show {safetyWarnings.length - 2} more warnings...
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Allergen Considerations */}
          {allergenConsiderations && (
            <View style={styles.considerationsSection}>
              <Text style={styles.considerationsTitle}>Additional Notes:</Text>
              <Text style={styles.considerationsText}>{allergenConsiderations}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.generalActions}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={handleDetailedWarnings}
              accessible={true}
              accessibilityLabel="View detailed safety information"
              accessibilityRole="button"
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
            
            {familyMembers && familyMembers.length > 0 && (
              <TouchableOpacity
                style={styles.familyButton}
                onPress={() => Alert.alert(
                  'Family Safety Coordination',
                  `This recipe has been checked against ${familyMembers.length} family member${familyMembers.length !== 1 ? 's' : ''}:\n\n` +
                  familyMembers.map(member => 
                    `• ${member.name} (${member.age_group})${member.allergies?.length ? ` - Allergies: ${member.allergies.join(', ')}` : ''}`
                  ).join('\n') +
                  '\n\nAlways verify ingredients with each family member before cooking.',
                  [{ text: 'Understood', style: 'default' }]
                )}
                accessible={true}
                accessibilityLabel="Family safety coordination information"
                accessibilityRole="button"
              >
                <Text style={styles.familyButtonText}>👨‍👩‍👧‍👦 Family Safety</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Compact Display for High Safety Recipes */}
      {displayMode === 'full' && 
       criticalAllergens.length === 0 && 
       generalAllergens.length === 0 && 
       safetyWarnings.length === 0 && (
        <View style={styles.safeRecipeSection}>
          <Text style={styles.safeRecipeIcon}>✅</Text>
          <View style={styles.safeRecipeContent}>
            <Text style={styles.safeRecipeTitle}>Recipe Safety Verified</Text>
            <Text style={styles.safeRecipeText}>
              No allergens detected. Always verify ingredients for safety.
            </Text>
          </View>
          <View style={[styles.safetyScoreBadge, getSafetyScoreStyle()]}>
            <Text style={styles.safetyScoreText}>{safetyScore}%</Text>
          </View>
        </View>
      )}

      {/* Universal Safety Reminder */}
      <View style={styles.universalReminder}>
        <Text style={styles.universalReminderIcon}>🧠</Text>
        <Text style={styles.universalReminderText}>
          AI-generated safety check. Always verify all ingredients for your family's specific needs.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  // Compact safe display
  compactSafe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  compactSafeIcon: {
    fontSize: 16,
  },
  compactSafeText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },

  // Critical allergen section
  criticalSection: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    padding: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  criticalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  criticalIcon: {
    fontSize: 24,
  },
  criticalContent: {
    flex: 1,
  },
  criticalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  criticalSubtitle: {
    fontSize: 12,
    color: '#DC2626',
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Critical allergens list
  criticalAllergensList: {
    gap: 12,
    marginBottom: 12,
  },
  criticalAllergenItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  allergenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  allergenIcon: {
    fontSize: 16,
  },
  allergenName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  severityBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  allergenWarning: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 16,
    marginBottom: 8,
  },
  familyMatchSection: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  familyMatchTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  familyMatchName: {
    fontSize: 11,
    color: '#DC2626',
  },

  // Critical actions
  criticalActions: {
    alignItems: 'center',
  },
  stopCookingButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopCookingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // General safety section
  generalSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 16,
  },
  generalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  generalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },

  // Safety score badge
  safetyScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
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

  // Allergen section
  allergenSection: {
    marginBottom: 12,
  },
  allergenSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 4,
  },
  allergenChipFamilyMatch: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  allergenChipIcon: {
    fontSize: 12,
  },
  allergenChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
  },
  familyMatchIndicator: {
    fontSize: 10,
  },

  // Warnings section
  warningsSection: {
    marginBottom: 12,
  },
  warningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  expandIcon: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  warningsList: {
    gap: 6,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  warningIcon: {
    fontSize: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  showMoreWarnings: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  showMoreText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },

  // Considerations section
  considerationsSection: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 12,
  },
  considerationsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  considerationsText: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 14,
  },

  // General actions
  generalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
  },
  familyButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  familyButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Safe recipe section
  safeRecipeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  safeRecipeIcon: {
    fontSize: 20,
  },
  safeRecipeContent: {
    flex: 1,
  },
  safeRecipeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 2,
  },
  safeRecipeText: {
    fontSize: 11,
    color: '#15803D',
  },

  // Universal reminder
  universalReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  universalReminderIcon: {
    fontSize: 12,
  },
  universalReminderText: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
  },
});