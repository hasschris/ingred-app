import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Tab Navigation Layout - Main app interface after onboarding completion
 * 
 * Five core tabs:
 * 🏠 Home - Dashboard with user stats and quick actions
 * 📅 Plan - Weekly meal planning calendar
 * 👨‍👩‍👧‍👦 Family - Family member management
 * ⚙️ Settings - Account, preferences, legal controls
 * 
 * Design principles:
 * - Premium visual quality matching HelloFresh standards
 * - Family-friendly warm design
 * - Accessibility-first with proper labels and contrast
 * - British spellings and metric units
 */

interface TabBarIconProps {
  icon: string;
  color: string;
  focused: boolean;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ icon, color, focused }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.tabIconContainer,
      focused && styles.tabIconContainerFocused
    ]}>
      <Text 
        style={[
          styles.tabIcon, 
          { color },
          focused && styles.tabIconFocused
        ]}
        accessibilityElementsHidden={true}
      >
        {icon}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6', // Ingred primary purple
        tabBarInactiveTintColor: '#6B7280', // Neutral gray for inactive
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            height: 60 + Math.max(insets.bottom, 8),
          }
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false, // Individual screens will handle their own headers
        tabBarAccessibilityLabel: 'Main navigation',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon="🏠" color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Home dashboard - View your meal planning dashboard and quick actions',
        }}
      />
      
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon="📅" color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Weekly meal planning - Plan and organise your family meals for the week',
        }}
      />
      
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon="👨‍👩‍👧‍👦" color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Family management - Manage family members and their dietary preferences',
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon="⚙️" color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: 'Settings and account - Access account settings, preferences, and privacy controls',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Tab bar container - Premium design with subtle elevation
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  // Individual tab item container
  tabBarItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  // Tab label typography - Clear and readable
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
    fontFamily: 'Inter', // Premium typography
  },

  // Tab icon container with focus states
  tabIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 2,
  },

  tabIconContainerFocused: {
    backgroundColor: '#F4F3FF', // Light purple background for focused state
  },

  // Tab icon styling
  tabIcon: {
    fontSize: 20,
    textAlign: 'center',
  },

  tabIconFocused: {
    transform: [{ scale: 1.1 }], // Subtle scale for active state
  },
});

// Type definitions for better TypeScript support
export type TabParamList = {
  index: undefined;
  plan: undefined;
  family: undefined;
  settings: undefined;
};

/**
 * Accessibility Features:
 * - Proper ARIA labels and hints for each tab
 * - High contrast colours meeting WCAG AA standards
 * - Touch targets meeting 44px minimum requirement
 * - Screen reader friendly navigation structure
 * - Focus indicators with sufficient contrast
 * 
 * Design Features:
 * - Premium visual quality with subtle shadows and elevation
 * - Consistent spacing using 8-point grid system
 * - Family-friendly emoji icons with British sensibility
 * - Responsive design adapting to safe area insets
 * - Professional typography hierarchy
 * 
 * Legal & Safety Integration:
 * - Settings tab provides access to privacy controls
 * - Family tab includes safety and allergen management
 * - All navigation respects user's legal preferences
 * - Accessible design ensures legal compliance for all users
 */