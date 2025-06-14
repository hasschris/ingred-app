import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

/**
 * LegalCompliance Component - Data Rights & Legal Document Management
 * 
 * Features:
 * - GDPR Article 17: Right to erasure (account deletion)
 * - Legal document access (Terms, Privacy Policy)
 * - Compliance tracking and audit trail
 * - Data retention information
 * - Legal rights education
 * - Professional legal support access
 */

interface UserConsent {
  user_id: string;
  terms_accepted_version: string;
  privacy_accepted_version: string;
  marketing_consent: boolean;
  analytics_consent: boolean;
  ai_learning_consent: boolean;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
  consent_source: string;
}

interface LegalComplianceProps {
  userConsent: UserConsent | null;
  onAccountDeletion: () => Promise<void>;
}

interface AccountDeletionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading,
}) => {
  const { user } = useAuth();
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState({
    dataLoss: false,
    irreversible: false,
    familyData: false,
    billing: false,
  });

  const handleConfirm = async () => {
    // Validation
    if (confirmationEmail.toLowerCase() !== user?.email?.toLowerCase()) {
      Alert.alert('Email Mismatch', 'Please enter your exact email address to confirm deletion.');
      return;
    }

    const allAcknowledged = Object.values(acknowledgedWarnings).every(Boolean);
    if (!allAcknowledged) {
      Alert.alert('Acknowledgment Required', 'Please acknowledge all warnings before proceeding.');
      return;
    }

    await onConfirm();
  };

  const toggleAcknowledgment = (key: keyof typeof acknowledgedWarnings) => {
    setAcknowledgedWarnings(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Delete Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.deletionWarning}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>This Action Cannot Be Undone</Text>
            <Text style={styles.warningText}>
              Account deletion is permanent and irreversible. Please read carefully 
              before proceeding.
            </Text>
          </View>

          <View style={styles.gdprSection}>
            <Text style={styles.gdprTitle}>🇪🇺 GDPR Article 17: Right to Erasure</Text>
            <Text style={styles.gdprText}>
              Under GDPR and UK data protection laws, you have the right to request 
              deletion of your personal data. This process will permanently remove 
              all your information from our systems within 30 days.
            </Text>
          </View>

          <View style={styles.dataLossSection}>
            <Text style={styles.sectionTitle}>What Will Be Deleted</Text>
            
            <View style={styles.dataItem}>
              <Text style={styles.dataIcon}>👤</Text>
              <View style={styles.dataContent}>
                <Text style={styles.dataName}>Account Information</Text>
                <Text style={styles.dataDesc}>Email, profile, authentication data</Text>
              </View>
            </View>

            <View style={styles.dataItem}>
              <Text style={styles.dataIcon}>👨‍👩‍👧‍👦</Text>
              <View style={styles.dataContent}>
                <Text style={styles.dataName}>Family Data</Text>
                <Text style={styles.dataDesc}>All family members, allergies, dietary restrictions</Text>
              </View>
            </View>

            <View style={styles.dataItem}>
              <Text style={styles.dataIcon}>🍽️</Text>
              <View style={styles.dataContent}>
                <Text style={styles.dataName}>Meal Planning</Text>
                <Text style={styles.dataDesc}>Recipes, meal plans, preferences, shopping lists</Text>
              </View>
            </View>

            <View style={styles.dataItem}>
              <Text style={styles.dataIcon}>📊</Text>
              <View style={styles.dataContent}>
                <Text style={styles.dataName}>Usage Data</Text>
                <Text style={styles.dataDesc}>Analytics, app usage, interaction history</Text>
              </View>
            </View>

            <View style={styles.dataItem}>
              <Text style={styles.dataIcon}>📋</Text>
              <View style={styles.dataContent}>
                <Text style={styles.dataName}>Legal Records</Text>
                <Text style={styles.dataDesc}>Consent history, terms acceptance, privacy settings</Text>
              </View>
            </View>
          </View>

          <View style={styles.acknowledgmentSection}>
            <Text style={styles.sectionTitle}>Required Acknowledgments</Text>
            
            <TouchableOpacity
              style={styles.acknowledgmentItem}
              onPress={() => toggleAcknowledgment('dataLoss')}
            >
              <Text style={styles.checkboxIcon}>
                {acknowledgedWarnings.dataLoss ? '✅' : '⬜'}
              </Text>
              <Text style={styles.acknowledgmentText}>
                I understand that all my family's meal planning data will be permanently lost
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acknowledgmentItem}
              onPress={() => toggleAcknowledgment('irreversible')}
            >
              <Text style={styles.checkboxIcon}>
                {acknowledgedWarnings.irreversible ? '✅' : '⬜'}
              </Text>
              <Text style={styles.acknowledgmentText}>
                I understand this action is irreversible and cannot be undone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acknowledgmentItem}
              onPress={() => toggleAcknowledgment('familyData')}
            >
              <Text style={styles.checkboxIcon}>
                {acknowledgedWarnings.familyData ? '✅' : '⬜'}
              </Text>
              <Text style={styles.acknowledgmentText}>
                I understand that all family member profiles and safety information will be deleted
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acknowledgmentItem}
              onPress={() => toggleAcknowledgment('billing')}
            >
              <Text style={styles.checkboxIcon}>
                {acknowledgedWarnings.billing ? '✅' : '⬜'}
              </Text>
              <Text style={styles.acknowledgmentText}>
                I understand that any active subscriptions will be cancelled
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={styles.sectionTitle}>Final Confirmation</Text>
            <Text style={styles.confirmationLabel}>
              Type your email address to confirm deletion:
            </Text>
            <TextInput
              style={styles.confirmationInput}
              value={confirmationEmail}
              onChangeText={setConfirmationEmail}
              placeholder={user?.email || 'your.email@example.com'}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.alternativeSection}>
            <Text style={styles.alternativeTitle}>🤔 Consider These Alternatives</Text>
            <Text style={styles.alternativeText}>
              Before deleting your account, you might want to:
            </Text>
            
            <View style={styles.alternativesList}>
              <Text style={styles.alternativeItem}>• Export your data for backup</Text>
              <Text style={styles.alternativeItem}>• Just sign out and take a break</Text>
              <Text style={styles.alternativeItem}>• Adjust privacy settings instead</Text>
              <Text style={styles.alternativeItem}>• Contact support with any concerns</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              (!confirmationEmail || !Object.values(acknowledgedWarnings).every(Boolean) || loading) && 
              styles.deleteButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!confirmationEmail || !Object.values(acknowledgedWarnings).every(Boolean) || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.deleteButtonText}>Permanently Delete Account</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

interface LegalDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  documentType: 'terms' | 'privacy';
  version: string;
}

const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  visible,
  onClose,
  documentType,
  version,
}) => {
  const documentTitles = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
  };

  const documentContent = {
    terms: `Last updated: ${version}\n\nWelcome to Ingred! These terms govern your use of our AI-powered meal planning service.\n\n1. Service Description\nIngred provides AI-generated meal planning and recipe suggestions for families.\n\n2. User Responsibilities\n• Verify all recipes for allergies and dietary restrictions\n• Use AI suggestions as guidance only\n• Maintain accurate family safety information\n\n3. AI Content Disclaimer\nOur AI generates recipe suggestions based on your preferences. Always verify ingredients for safety.\n\n4. Privacy and Data\nYour privacy is important to us. See our Privacy Policy for details.\n\n5. Limitation of Liability\nIngred is not responsible for allergic reactions or dietary issues.\n\n[This is a sample - full legal documents will be available in production]`,
    
    privacy: `Last updated: ${version}\n\nThis Privacy Policy explains how Ingred collects, uses, and protects your information.\n\n1. Information We Collect\n• Account information (email, preferences)\n• Family dietary information\n• Recipe generation data\n• Usage analytics (with consent)\n\n2. How We Use Information\n• Provide personalised meal planning\n• Improve our AI recommendations\n• Send important safety notifications\n• Comply with legal obligations\n\n3. Data Sharing\nWe don't sell your data. We only share as necessary for service delivery.\n\n4. Your Rights (GDPR)\n• Access your data\n• Correct inaccuracies\n• Delete your data\n• Data portability\n• Withdraw consent\n\n5. Data Security\nWe use industry-standard security measures to protect your family's information.\n\n[This is a sample - full legal documents will be available in production]`
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{documentTitles[documentType]}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.documentHeader}>
            <Text style={styles.documentTitle}>{documentTitles[documentType]}</Text>
            <Text style={styles.documentVersion}>Version: {version}</Text>
          </View>

          <View style={styles.documentContent}>
            <Text style={styles.documentText}>{documentContent[documentType]}</Text>
          </View>

          <View style={styles.documentFooter}>
            <Text style={styles.footerText}>
              📧 Questions about this document? Contact legal@ingred.app
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const LegalCompliance: React.FC<LegalComplianceProps> = ({
  userConsent,
  onAccountDeletion,
}) => {
  const [showAccountDeletion, setShowAccountDeletion] = useState(false);
  const [showLegalDocument, setShowLegalDocument] = useState<{
    visible: boolean;
    type: 'terms' | 'privacy';
  }>({ visible: false, type: 'terms' });
  const [deletionLoading, setDeletionLoading] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const handleTermsOfService = () => {
    setShowLegalDocument({ visible: true, type: 'terms' });
  };

  const handlePrivacyPolicy = () => {
    setShowLegalDocument({ visible: true, type: 'privacy' });
  };

  const handleDataRetention = () => {
    Alert.alert(
      '📋 Data Retention Policy',
      '⏰ How long we keep your data:\n\n• Account data: Until account deletion\n• Family safety info: Until you remove it\n• Recipe history: 2 years after last use\n• Analytics data: 13 months (if consented)\n• Legal consent records: 7 years\n• Deleted data: Permanently removed within 30 days\n\n🔒 All data is securely stored and protected according to UK and EU standards.\n\n📧 Questions? Contact privacy@ingred.app',
      [{ text: 'Understood' }]
    );
  };

  const handleRegulatoryCompliance = () => {
    Alert.alert(
      '🏛️ Regulatory Compliance',
      '✅ Ingred complies with:\n\n🇪🇺 GDPR (General Data Protection Regulation)\n🇬🇧 UK Data Protection Act 2018\n🇬🇧 UK GDPR\n🍽️ Food information regulations\n🛡️ Consumer protection laws\n\n📊 Regular compliance audits\n🔍 Data protection impact assessments\n👨‍💼 Dedicated data protection officer\n📋 Transparent privacy practices\n\n🏛️ Regulatory oversight: Information Commissioner\'s Office (ICO)',
      [
        { text: 'Good to know' },
        { 
          text: 'Learn More', 
          onPress: () => {
            Alert.alert(
              'Compliance Details',
              '📞 Information Commissioner\'s Office (ICO):\nWebsite: ico.org.uk\nHelpline: 0303 123 1113\n\n📧 Our Data Protection Officer:\nEmail: dpo@ingred.app\n\n📋 Compliance certifications and audit reports available upon request.'
            );
          }
        }
      ]
    );
  };

  const handleLegalSupport = () => {
    Alert.alert(
      '⚖️ Legal Support',
      '📧 For legal questions or concerns:\n\nGeneral legal: legal@ingred.app\nData protection: privacy@ingred.app\nCompliance: compliance@ingred.app\n\n📞 Legal helpline: +44 20 1234 5678\n🕐 Available: Mon-Fri 9am-5pm GMT\n\n📋 We provide:\n• Legal document explanations\n• Data rights assistance\n• Compliance guidance\n• Dispute resolution support',
      [{ text: 'Got it!' }]
    );
  };

  const handleAccountDeletion = async () => {
    setDeletionLoading(true);
    
    try {
      await onAccountDeletion();
      setShowAccountDeletion(false);
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert('Deletion Failed', 'Unable to delete account. Please try again or contact support.');
    } finally {
      setDeletionLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Terms of Service */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleTermsOfService}
        accessible={true}
        accessibilityLabel="Terms of service"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>📋</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Terms of Service</Text>
            <Text style={styles.settingsSubtitle}>
              {userConsent ? `Accepted version: ${userConsent.terms_accepted_version}` : 'Loading...'}
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handlePrivacyPolicy}
        accessible={true}
        accessibilityLabel="Privacy policy"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>🔐</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Privacy Policy</Text>
            <Text style={styles.settingsSubtitle}>
              {userConsent ? `Accepted version: ${userConsent.privacy_accepted_version}` : 'Loading...'}
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Data Retention Policy */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleDataRetention}
        accessible={true}
        accessibilityLabel="Data retention policy"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>⏰</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Data Retention Policy</Text>
            <Text style={styles.settingsSubtitle}>
              How long we keep your family's information
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Regulatory Compliance */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleRegulatoryCompliance}
        accessible={true}
        accessibilityLabel="Regulatory compliance information"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>🏛️</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Regulatory Compliance</Text>
            <Text style={styles.settingsSubtitle}>
              GDPR, UK Data Protection Act, and food safety compliance
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Legal Support */}
      <TouchableOpacity
        style={styles.settingsRow}
        onPress={handleLegalSupport}
        accessible={true}
        accessibilityLabel="Legal support and assistance"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={styles.settingsIcon}>⚖️</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>Legal Support</Text>
            <Text style={styles.settingsSubtitle}>
              Get help with legal questions and data rights
            </Text>
          </View>
        </View>
        <Text style={styles.settingsArrow}>›</Text>
      </TouchableOpacity>

      {/* Account Deletion */}
      <TouchableOpacity
        style={[styles.settingsRow, styles.lastRow, styles.dangerRow]}
        onPress={() => setShowAccountDeletion(true)}
        accessible={true}
        accessibilityLabel="Delete account permanently"
        accessibilityRole="button"
      >
        <View style={styles.settingsRowLeft}>
          <Text style={[styles.settingsIcon, styles.dangerIcon]}>🗑️</Text>
          <View style={styles.settingsTextContainer}>
            <Text style={[styles.settingsTitle, styles.dangerTitle]}>Delete Account</Text>
            <Text style={styles.settingsSubtitle}>
              Permanently delete your account and all data (GDPR Article 17)
            </Text>
          </View>
        </View>
        <Text style={[styles.settingsArrow, styles.dangerArrow]}>›</Text>
      </TouchableOpacity>

      {/* Account Deletion Modal */}
      <AccountDeletionModal
        visible={showAccountDeletion}
        onClose={() => setShowAccountDeletion(false)}
        onConfirm={handleAccountDeletion}
        loading={deletionLoading}
      />

      {/* Legal Document Modal */}
      <LegalDocumentModal
        visible={showLegalDocument.visible}
        onClose={() => setShowLegalDocument({ visible: false, type: 'terms' })}
        documentType={showLegalDocument.type}
        version={
          showLegalDocument.type === 'terms' 
            ? userConsent?.terms_accepted_version || '1.0'
            : userConsent?.privacy_accepted_version || '1.0'
        }
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

  dangerRow: {
    backgroundColor: '#FEF2F2',
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

  dangerIcon: {
    opacity: 0.8,
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

  dangerTitle: {
    color: '#DC2626',
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

  dangerArrow: {
    color: '#DC2626',
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
    padding: 16,
  },

  // Account Deletion Modal
  deletionWarning: {
    backgroundColor: '#FEE2E2',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 24,
    alignItems: 'center',
  },

  warningIcon: {
    fontSize: 32,
    marginBottom: 12,
  },

  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter',
  },

  warningText: {
    fontSize: 16,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter',
  },

  gdprSection: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 24,
  },

  gdprTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  gdprText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  dataLossSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Inter',
  },

  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },

  dataIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  dataContent: {
    flex: 1,
  },

  dataName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Inter',
  },

  dataDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  acknowledgmentSection: {
    marginBottom: 24,
  },

  acknowledgmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },

  checkboxIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },

  acknowledgmentText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'Inter',
  },

  confirmationSection: {
    marginBottom: 24,
  },

  confirmationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  confirmationInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
  },

  alternativeSection: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },

  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  alternativeText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  alternativesList: {
    gap: 4,
  },

  alternativeItem: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'Inter',
  },

  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },

  deleteButtonDisabled: {
    opacity: 0.6,
  },

  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },

  // Legal Document Modal
  documentHeader: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },

  documentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  documentVersion: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter',
  },

  documentContent: {
    marginBottom: 24,
  },

  documentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontFamily: 'Inter',
  },

  documentFooter: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },

  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});

/**
 * LegalCompliance Component Features:
 * 
 * GDPR Article 17 Implementation:
 * - Comprehensive account deletion process
 * - Multi-step confirmation with warnings
 * - Clear data loss explanation
 * - 30-day deletion timeline
 * - Professional legal compliance
 * 
 * Legal Document Access:
 * - Terms of Service with version tracking
 * - Privacy Policy with consent history
 * - Professional document presentation
 * - Version history and updates
 * 
 * Compliance Features:
 * - Data retention policy explanation
 * - Regulatory compliance overview
 * - Legal support access points
 * - Professional audit trail
 * 
 * Account Deletion Process:
 * - Email confirmation requirement
 * - Multi-step acknowledgment process
 * - Clear data loss warnings
 * - Alternative suggestions
 * - Professional user experience
 * 
 * User Experience:
 * - Trust-building design
 * - Clear legal language
 * - Professional presentation
 * - Comprehensive information
 * - Accessible design throughout
 */