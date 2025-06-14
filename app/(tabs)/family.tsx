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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

// Import our extracted components
import { FamilyMemberCard, FamilyMember } from '../../components/family/FamilyMemberCard';
import { FamilyMemberModal } from '../../components/family/FamilyMemberModal';
import { SafetyCoordination } from '../../components/family/SafetyCoordination';

/**
 * Enhanced Family Management Screen - Component Architecture
 * 
 * Revolutionary family complexity handling that sets Ingred apart:
 * - Individual dietary profiles with safety coordination
 * - Real-time allergy conflict detection
 * - Cross-family meal planning intelligence
 * - Child-friendly vs adult restriction handling
 * - Emergency allergy information management
 * 
 * Now built with clean, reusable components!
 */

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

      {/* Safety Overview - Now using component! */}
      <SafetyCoordination 
        familyMembers={familyMembers}
      />

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
              Add family members to create personalised meal plans that consider everyone's dietary needs and preferences.
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

      {/* Add/Edit Family Member Modal - Now using component! */}
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
});