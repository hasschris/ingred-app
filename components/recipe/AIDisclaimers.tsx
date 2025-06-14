import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';

// Types for AI disclaimers
interface AIDisclaimersProps {
  aiGenerated: boolean;
  generationCost?: number;
  generationTime?: number;
  safetyScore?: number;
  displayMode?: 'full' | 'compact' | 'badge-only';
  showCostTransparency?: boolean;
  showLegalLinks?: boolean;
  onLearnMore?: () => void;
  style?: any;
}

export default function AIDisclaimers({
  aiGenerated,
  generationCost,
  generationTime,
  safetyScore,
  displayMode = 'full',
  showCostTransparency = false,
  showLegalLinks = true,
  onLearnMore,
  style,
}: AIDisclaimersProps) {
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Don't show anything if not AI generated
  if (!aiGenerated) {
    return null;
  }

  // Handle learn more about AI
  const handleLearnMoreAI = () => {
    if (onLearnMore) {
      onLearnMore();
      return;
    }

    Alert.alert(
      '🧠 How Ingred AI Works',
      'Ingred uses advanced artificial intelligence to create personalized recipes for your family:\n\n' +
      '• We analyze your family\'s dietary needs, allergies, and preferences\n' +
      '• AI generates recipes optimized for your cooking skill and time\n' +
      '• Every recipe includes comprehensive safety checks\n' +
      '• We detect potential allergens and provide warnings\n\n' +
      'Important: Always verify ingredients for your family\'s safety. Our AI provides suggestions, not medical advice.',
      [
        { text: 'View Privacy Policy', onPress: () => handleLegalLink('privacy') },
        { text: 'Got It', style: 'default' }
      ]
    );
  };

  // Handle safety information
  const handleSafetyInfo = () => {
    Alert.alert(
      '🛡️ AI Safety Features',
      'Ingred prioritizes your family\'s safety:\n\n' +
      '✅ Allergen Detection: AI scans ingredients for common allergens\n' +
      '✅ Family Coordination: Considers each family member\'s needs\n' +
      '✅ Safety Scoring: Recipes rated based on potential risks\n' +
      '✅ Clear Warnings: Prominent alerts for dangerous allergens\n\n' +
      `This recipe has a safety score of ${safetyScore || 'N/A'}%.\n\n` +
      '⚠️ Remember: AI provides assistance, not medical advice. Always verify ingredients and consult healthcare providers for serious allergies.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  // Handle transparency information
  const handleTransparencyInfo = () => {
    Alert.alert(
      '📊 AI Transparency',
      'We believe in complete transparency about our AI:\n\n' +
      `💰 Generation Cost: £${(generationCost || 0).toFixed(6)}\n` +
      `⏱️ Generation Time: ${generationTime || 0}ms\n` +
      `🛡️ Safety Score: ${safetyScore || 'N/A'}%\n\n` +
      'Cost Breakdown:\n' +
      '• AI processing and safety checks\n' +
      '• Allergen detection algorithms\n' +
      '• Family preference optimization\n\n' +
      'We keep costs low to make AI meal planning accessible for all families.',
      [{ text: 'Thanks for Transparency', style: 'default' }]
    );
  };

  // Handle legal links
  const handleLegalLink = async (type: 'privacy' | 'terms' | 'ai-policy') => {
    const urls = {
      privacy: 'https://ingred.app/privacy',
      terms: 'https://ingred.app/terms',
      'ai-policy': 'https://ingred.app/ai-policy'
    };

    try {
      await Linking.openURL(urls[type]);
    } catch (error) {
      Alert.alert(
        'Link Error',
        `We couldn't open the ${type.replace('-', ' ')} page. Please visit ingred.app for more information.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handle detailed AI explanation
  const handleDetailedExplanation = () => {
    Alert.alert(
      '🤖 Detailed AI Information',
      'Recipe Generation Process:\n\n' +
      '1. Family Analysis: AI reviews your household size, cooking skills, dietary restrictions, and individual family member needs\n\n' +
      '2. Safety Processing: Comprehensive allergen scanning and safety verification for each family member\n\n' +
      '3. Recipe Creation: AI generates ingredients and instructions optimized for your preferences\n\n' +
      '4. Quality Assurance: Final safety checks and family compatibility verification\n\n' +
      'Legal Compliance:\n' +
      '• Not medical advice\n' +
      '• User verification required\n' +
      '• Emergency disclaimers included\n' +
      '• Data protection compliant',
      [
        { text: 'View AI Policy', onPress: () => handleLegalLink('ai-policy') },
        { text: 'Close', style: 'default' }
      ]
    );
  };

  // Badge-only mode
  if (displayMode === 'badge-only') {
    return (
      <TouchableOpacity 
        style={[styles.badgeOnly, style]}
        onPress={handleLearnMoreAI}
        accessible={true}
        accessibilityLabel="AI generated content information"
        accessibilityRole="button"
      >
        <Text style={styles.badgeIcon}>🧠</Text>
        <Text style={styles.badgeText}>AI</Text>
      </TouchableOpacity>
    );
  }

  // Compact mode
  if (displayMode === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <TouchableOpacity 
          style={styles.compactDisclaimer}
          onPress={handleLearnMoreAI}
          accessible={true}
          accessibilityLabel="AI generated recipe information"
          accessibilityRole="button"
        >
          <Text style={styles.compactIcon}>🧠</Text>
          <Text style={styles.compactText}>
            AI-generated recipe. Always verify ingredients for safety.
          </Text>
          <Text style={styles.compactLearnMore}>Learn More</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Full mode
  return (
    <View style={[styles.container, style]}>
      {/* Main AI Notice */}
      <View style={styles.mainNotice}>
        <View style={styles.noticeHeader}>
          <Text style={styles.noticeIcon}>🧠</Text>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>AI-Generated Recipe</Text>
            <Text style={styles.noticeSubtitle}>
              Created by artificial intelligence for your family
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={handleLearnMoreAI}
            accessible={true}
            accessibilityLabel="Learn more about AI recipe generation"
            accessibilityRole="button"
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.primaryDisclaimer}>
          This recipe was generated by artificial intelligence based on your family's preferences and dietary needs. 
          Always verify all ingredients for allergies and dietary restrictions before cooking.
        </Text>
      </View>

      {/* Safety Disclaimer */}
      <TouchableOpacity 
        style={styles.safetyDisclaimer}
        onPress={handleSafetyInfo}
        accessible={true}
        accessibilityLabel="AI safety information"
        accessibilityRole="button"
      >
        <View style={styles.disclaimerHeader}>
          <Text style={styles.disclaimerIcon}>🛡️</Text>
          <Text style={styles.disclaimerTitle}>Safety First</Text>
          <Text style={styles.expandIndicator}>→</Text>
        </View>
        <Text style={styles.disclaimerText}>
          AI includes comprehensive safety checks, but human verification is always required for family safety.
        </Text>
      </TouchableOpacity>

      {/* Medical Disclaimer */}
      <View style={styles.medicalDisclaimer}>
        <View style={styles.disclaimerHeader}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerTitle}>Not Medical Advice</Text>
        </View>
        <Text style={styles.disclaimerText}>
          Ingred provides meal suggestions only. For medical dietary requirements, allergies, or health conditions, 
          consult qualified healthcare providers.
        </Text>
      </View>

      {/* Expandable sections */}
      <View style={styles.expandableSections}>
        {/* How AI Works */}
        <TouchableOpacity 
          style={styles.expandableSection}
          onPress={() => setExpandedSection(expandedSection === 'how-ai-works' ? null : 'how-ai-works')}
          accessible={true}
          accessibilityLabel="How AI recipe generation works"
          accessibilityRole="button"
        >
          <View style={styles.expandableHeader}>
            <Text style={styles.expandableTitle}>🤖 How AI Recipe Generation Works</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'how-ai-works' ? '−' : '+'}
            </Text>
          </View>
          {expandedSection === 'how-ai-works' && (
            <View style={styles.expandableContent}>
              <Text style={styles.expandableText}>
                1. <Text style={styles.boldText}>Family Analysis:</Text> AI reviews your household size, cooking skills, 
                and each family member's dietary restrictions and allergies.{'\n\n'}
                
                2. <Text style={styles.boldText}>Safety Processing:</Text> Comprehensive allergen detection and safety 
                verification against your family's specific needs.{'\n\n'}
                
                3. <Text style={styles.boldText}>Recipe Creation:</Text> Generates optimized ingredients and cooking 
                instructions based on your preferences and available time.{'\n\n'}
                
                4. <Text style={styles.boldText}>Quality Assurance:</Text> Final safety checks and family compatibility 
                verification before delivery.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Data & Privacy */}
        <TouchableOpacity 
          style={styles.expandableSection}
          onPress={() => setExpandedSection(expandedSection === 'privacy' ? null : 'privacy')}
          accessible={true}
          accessibilityLabel="Data and privacy information"
          accessibilityRole="button"
        >
          <View style={styles.expandableHeader}>
            <Text style={styles.expandableTitle}>🔒 Data & Privacy</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'privacy' ? '−' : '+'}
            </Text>
          </View>
          {expandedSection === 'privacy' && (
            <View style={styles.expandableContent}>
              <Text style={styles.expandableText}>
                • <Text style={styles.boldText}>Family Data Protection:</Text> Your family's dietary information is encrypted 
                and used only for recipe generation.{'\n\n'}
                
                • <Text style={styles.boldText}>No Data Selling:</Text> We never sell your family's data to third parties.{'\n\n'}
                
                • <Text style={styles.boldText}>Local Processing:</Text> Where possible, AI processing happens on your device 
                for enhanced privacy.{'\n\n'}
                
                • <Text style={styles.boldText}>Data Control:</Text> You can export or delete your family's data at any time.
              </Text>
              
              {showLegalLinks && (
                <View style={styles.legalLinks}>
                  <TouchableOpacity onPress={() => handleLegalLink('privacy')}>
                    <Text style={styles.legalLinkText}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.linkSeparator}>•</Text>
                  <TouchableOpacity onPress={() => handleLegalLink('ai-policy')}>
                    <Text style={styles.legalLinkText}>AI Policy</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Cost Transparency */}
        {showCostTransparency && (generationCost !== undefined || generationTime !== undefined) && (
          <TouchableOpacity 
            style={styles.expandableSection}
            onPress={() => setExpandedSection(expandedSection === 'transparency' ? null : 'transparency')}
            accessible={true}
            accessibilityLabel="AI cost and transparency information"
            accessibilityRole="button"
          >
            <View style={styles.expandableHeader}>
              <Text style={styles.expandableTitle}>📊 Transparency</Text>
              <Text style={styles.expandIcon}>
                {expandedSection === 'transparency' ? '−' : '+'}
              </Text>
            </View>
            {expandedSection === 'transparency' && (
              <View style={styles.expandableContent}>
                <View style={styles.transparencyGrid}>
                  {generationCost !== undefined && (
                    <View style={styles.transparencyItem}>
                      <Text style={styles.transparencyLabel}>Generation Cost</Text>
                      <Text style={styles.transparencyValue}>£{generationCost.toFixed(6)}</Text>
                    </View>
                  )}
                  {generationTime !== undefined && (
                    <View style={styles.transparencyItem}>
                      <Text style={styles.transparencyLabel}>Processing Time</Text>
                      <Text style={styles.transparencyValue}>{generationTime}ms</Text>
                    </View>
                  )}
                  {safetyScore !== undefined && (
                    <View style={styles.transparencyItem}>
                      <Text style={styles.transparencyLabel}>Safety Score</Text>
                      <Text style={styles.transparencyValue}>{safetyScore}%</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.transparencyNote}>
                  We believe in complete transparency about AI costs and processing. 
                  These costs help us maintain high-quality, safe recipe generation for your family.
                </Text>
                <TouchableOpacity onPress={handleTransparencyInfo}>
                  <Text style={styles.transparencyLink}>View Detailed Breakdown</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* User Rights & Control */}
      <View style={styles.userRights}>
        <Text style={styles.userRightsTitle}>👤 Your Rights & Control</Text>
        <View style={styles.userRightsGrid}>
          <TouchableOpacity 
            style={styles.rightButton}
            onPress={handleDetailedExplanation}
            accessible={true}
            accessibilityLabel="View detailed AI explanation"
            accessibilityRole="button"
          >
            <Text style={styles.rightButtonText}>AI Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rightButton}
            onPress={() => Alert.alert(
              'Recipe Feedback',
              'Your feedback helps improve our AI:\n\n• Rate recipes to train better suggestions\n• Report safety concerns immediately\n• Suggest improvements for your family\n\nFeedback helps create safer, more personalized recipes.',
              [{ text: 'Provide Feedback', style: 'default' }]
            )}
            accessible={true}
            accessibilityLabel="Provide feedback about AI recipes"
            accessibilityRole="button"
          >
            <Text style={styles.rightButtonText}>Feedback</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rightButton}
            onPress={() => Alert.alert(
              'Report Issue',
              'Found a safety concern or error in this AI-generated recipe?\n\nWe take safety seriously and will investigate immediately.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report Safety Issue', style: 'destructive' }
              ]
            )}
            accessible={true}
            accessibilityLabel="Report safety issue with AI recipe"
            accessibilityRole="button"
          >
            <Text style={styles.rightButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Footer */}
      <View style={styles.legalFooter}>
        <Text style={styles.legalFooterText}>
          📋 By using AI-generated recipes, you acknowledge that Ingred provides meal suggestions only and is not 
          responsible for adverse reactions. Always verify ingredients and consult healthcare providers for medical dietary needs.
        </Text>
        
        {showLegalLinks && (
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => handleLegalLink('terms')}>
              <Text style={styles.footerLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity onPress={() => handleLegalLink('privacy')}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity onPress={() => handleLegalLink('ai-policy')}>
              <Text style={styles.footerLinkText}>AI Policy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  // Badge only mode
  badgeOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE9FE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  badgeIcon: {
    fontSize: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#7C3AED',
  },

  // Compact mode
  compactContainer: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: 8,
  },
  compactDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactIcon: {
    fontSize: 16,
  },
  compactText: {
    flex: 1,
    fontSize: 12,
    color: '#5B21B6',
    lineHeight: 16,
  },
  compactLearnMore: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },

  // Main notice
  mainNotice: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    padding: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 2,
  },
  noticeSubtitle: {
    fontSize: 12,
    color: '#7C3AED',
  },
  learnMoreButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  learnMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryDisclaimer: {
    fontSize: 13,
    color: '#5B21B6',
    lineHeight: 18,
  },

  // Individual disclaimers
  safetyDisclaimer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 12,
  },
  medicalDisclaimer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    padding: 12,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  disclaimerIcon: {
    fontSize: 14,
  },
  disclaimerTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  expandIndicator: {
    fontSize: 12,
    color: '#6B7280',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },

  // Expandable sections
  expandableSections: {
    gap: 8,
  },
  expandableSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  expandableTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  expandIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  expandableContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  expandableText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '600',
    color: '#374151',
  },

  // Legal links
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  legalLinkText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  linkSeparator: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  // Transparency
  transparencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  transparencyItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  transparencyLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  transparencyValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  transparencyNote: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  transparencyLink: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },

  // User rights
  userRights: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
  },
  userRightsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  userRightsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  rightButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    alignItems: 'center',
  },
  rightButtonText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#166534',
  },

  // Legal footer
  legalFooter: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  legalFooterText: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerLinkText: {
    fontSize: 9,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});