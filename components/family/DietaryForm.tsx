import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DietaryFormProps {
  selectedRestrictions: string[];
  selectedDislikes: string[];
  onRestrictionsChange: (restrictions: string[]) => void;
  onDislikesChange: (dislikes: string[]) => void;
  disabled?: boolean;
}

// Comprehensive dietary restrictions
const DIETARY_RESTRICTIONS = [
  // Medical Restrictions
  { id: 'gluten_free', label: 'Gluten-Free', category: 'Medical', description: 'No wheat, barley, rye, or malt' },
  { id: 'dairy_free', label: 'Dairy-Free', category: 'Medical', description: 'No milk, cheese, or dairy products' },
  { id: 'nut_free', label: 'Nut-Free', category: 'Medical', description: 'No tree nuts or peanuts' },
  { id: 'diabetic_friendly', label: 'Diabetic-Friendly', category: 'Medical', description: 'Low sugar, controlled carbs' },
  { id: 'low_sodium', label: 'Low-Sodium', category: 'Medical', description: 'Reduced salt intake' },
  { id: 'low_fodmap', label: 'Low-FODMAP', category: 'Medical', description: 'For digestive sensitivities' },
  { id: 'heart_healthy', label: 'Heart-Healthy', category: 'Medical', description: 'Low cholesterol and saturated fat' },
  { id: 'kidney_friendly', label: 'Kidney-Friendly', category: 'Medical', description: 'Reduced potassium and phosphorus' },

  // Lifestyle Restrictions
  { id: 'vegetarian', label: 'Vegetarian', category: 'Lifestyle', description: 'No meat, fish, or poultry' },
  { id: 'vegan', label: 'Vegan', category: 'Lifestyle', description: 'No animal products at all' },
  { id: 'pescatarian', label: 'Pescatarian', category: 'Lifestyle', description: 'Fish OK, but no other meat' },
  { id: 'keto', label: 'Ketogenic', category: 'Lifestyle', description: 'Very low carb, high fat' },
  { id: 'paleo', label: 'Paleo', category: 'Lifestyle', description: 'No grains, dairy, or legumes' },
  { id: 'low_carb', label: 'Low-Carb', category: 'Lifestyle', description: 'Reduced carbohydrate intake' },
  { id: 'whole30', label: 'Whole30', category: 'Lifestyle', description: 'No sugar, grains, dairy, or legumes' },
  { id: 'mediterranean', label: 'Mediterranean', category: 'Lifestyle', description: 'Focus on olive oil, fish, vegetables' },
  { id: 'raw_food', label: 'Raw Food', category: 'Lifestyle', description: 'No cooked foods above 118°F' },
  { id: 'carnivore', label: 'Carnivore', category: 'Lifestyle', description: 'Only animal products' },

  // Religious Restrictions
  { id: 'halal', label: 'Halal', category: 'Religious', description: 'Islamic dietary laws' },
  { id: 'kosher', label: 'Kosher', category: 'Religious', description: 'Jewish dietary laws' },
  { id: 'hindu_vegetarian', label: 'Hindu Vegetarian', category: 'Religious', description: 'No meat, often no eggs' },
  { id: 'jain', label: 'Jain', category: 'Religious', description: 'No root vegetables or violence to plants' },
];

// Comprehensive food dislikes categories
const FOOD_DISLIKES_CATEGORIES = {
  vegetables: {
    title: '🥬 Vegetables',
    items: [
      { id: 'mushrooms', label: 'Mushrooms' },
      { id: 'onions', label: 'Onions' },
      { id: 'garlic', label: 'Garlic' },
      { id: 'bell_peppers', label: 'Bell Peppers' },
      { id: 'hot_peppers', label: 'Hot Peppers' },
      { id: 'broccoli', label: 'Broccoli' },
      { id: 'brussels_sprouts', label: 'Brussels Sprouts' },
      { id: 'cauliflower', label: 'Cauliflower' },
      { id: 'spinach', label: 'Spinach' },
      { id: 'kale', label: 'Kale' },
      { id: 'lettuce', label: 'Lettuce' },
      { id: 'tomatoes', label: 'Tomatoes' },
      { id: 'carrots', label: 'Carrots' },
      { id: 'celery', label: 'Celery' },
      { id: 'asparagus', label: 'Asparagus' },
      { id: 'artichokes', label: 'Artichokes' },
      { id: 'eggplant', label: 'Eggplant' },
      { id: 'zucchini', label: 'Courgette/Zucchini' },
      { id: 'cucumber', label: 'Cucumber' },
      { id: 'beetroot', label: 'Beetroot' },
      { id: 'radishes', label: 'Radishes' },
      { id: 'cabbage', label: 'Cabbage' },
      { id: 'leeks', label: 'Leeks' },
    ]
  },
  proteins: {
    title: '🥩 Proteins',
    items: [
      { id: 'beef', label: 'Beef' },
      { id: 'pork', label: 'Pork' },
      { id: 'lamb', label: 'Lamb' },
      { id: 'chicken', label: 'Chicken' },
      { id: 'turkey', label: 'Turkey' },
      { id: 'duck', label: 'Duck' },
      { id: 'white_fish', label: 'White Fish' },
      { id: 'oily_fish', label: 'Oily Fish' },
      { id: 'shellfish', label: 'Shellfish' },
      { id: 'prawns', label: 'Prawns' },
      { id: 'crab', label: 'Crab' },
      { id: 'lobster', label: 'Lobster' },
      { id: 'mussels', label: 'Mussels' },
      { id: 'oysters', label: 'Oysters' },
      { id: 'tofu', label: 'Tofu' },
      { id: 'tempeh', label: 'Tempeh' },
      { id: 'beans', label: 'Beans' },
      { id: 'lentils', label: 'Lentils' },
      { id: 'chickpeas', label: 'Chickpeas' },
      { id: 'liver', label: 'Liver' },
      { id: 'organ_meats', label: 'Organ Meats' },
    ]
  },
  dairy: {
    title: '🧀 Dairy & Alternatives',
    items: [
      { id: 'milk', label: 'Milk' },
      { id: 'mild_cheese', label: 'Mild Cheese' },
      { id: 'strong_cheese', label: 'Strong Cheese' },
      { id: 'blue_cheese', label: 'Blue Cheese' },
      { id: 'goat_cheese', label: 'Goat Cheese' },
      { id: 'yogurt', label: 'Yoghurt' },
      { id: 'cream', label: 'Cream' },
      { id: 'butter', label: 'Butter' },
      { id: 'non_dairy_milk', label: 'Non-Dairy Milk' },
      { id: 'vegan_cheese', label: 'Vegan Cheese' },
    ]
  },
  grains: {
    title: '🌾 Grains & Starches',
    items: [
      { id: 'rice', label: 'Rice' },
      { id: 'pasta', label: 'Pasta' },
      { id: 'bread', label: 'Bread' },
      { id: 'quinoa', label: 'Quinoa' },
      { id: 'oats', label: 'Oats' },
      { id: 'barley', label: 'Barley' },
      { id: 'potatoes', label: 'Potatoes' },
      { id: 'sweet_potatoes', label: 'Sweet Potatoes' },
      { id: 'couscous', label: 'Couscous' },
      { id: 'bulgur', label: 'Bulgur' },
    ]
  },
  fruits: {
    title: '🍎 Fruits',
    items: [
      { id: 'avocado', label: 'Avocado' },
      { id: 'coconut', label: 'Coconut' },
      { id: 'olives', label: 'Olives' },
      { id: 'citrus_fruits', label: 'Citrus Fruits' },
      { id: 'berries', label: 'Berries' },
      { id: 'bananas', label: 'Bananas' },
      { id: 'apples', label: 'Apples' },
      { id: 'stone_fruits', label: 'Stone Fruits' },
      { id: 'tropical_fruits', label: 'Tropical Fruits' },
      { id: 'dried_fruits', label: 'Dried Fruits' },
      { id: 'grapes', label: 'Grapes' },
    ]
  },
  flavors: {
    title: '🌶️ Flavours & Spices',
    items: [
      { id: 'spicy_food', label: 'Spicy Food' },
      { id: 'garlic_flavor', label: 'Garlic Flavour' },
      { id: 'cilantro', label: 'Coriander/Cilantro' },
      { id: 'mint', label: 'Mint' },
      { id: 'basil', label: 'Basil' },
      { id: 'oregano', label: 'Oregano' },
      { id: 'cumin', label: 'Cumin' },
      { id: 'curry_spices', label: 'Curry Spices' },
      { id: 'ginger', label: 'Ginger' },
      { id: 'licorice', label: 'Liquorice' },
      { id: 'dill', label: 'Dill' },
      { id: 'rosemary', label: 'Rosemary' },
      { id: 'thyme', label: 'Thyme' },
      { id: 'paprika', label: 'Paprika' },
      { id: 'cinnamon', label: 'Cinnamon' },
    ]
  },
  textures: {
    title: '🤲 Textures & Preparations',
    items: [
      { id: 'slimy_textures', label: 'Slimy Textures' },
      { id: 'crunchy_foods', label: 'Crunchy Foods' },
      { id: 'soft_foods', label: 'Very Soft Foods' },
      { id: 'fried_foods', label: 'Fried Foods' },
      { id: 'raw_foods', label: 'Raw Foods' },
      { id: 'very_hot_foods', label: 'Very Hot Foods' },
      { id: 'cold_foods', label: 'Cold Foods' },
      { id: 'chewy_foods', label: 'Chewy Foods' },
      { id: 'creamy_foods', label: 'Creamy Foods' },
      { id: 'lumpy_foods', label: 'Lumpy Foods' },
    ]
  },
  condiments: {
    title: '🍯 Condiments & Extras',
    items: [
      { id: 'mayonnaise', label: 'Mayonnaise' },
      { id: 'mustard_condiment', label: 'Mustard' },
      { id: 'ketchup', label: 'Ketchup' },
      { id: 'pickles', label: 'Pickles' },
      { id: 'vinegar', label: 'Vinegar' },
      { id: 'hot_sauce', label: 'Hot Sauce' },
      { id: 'soy_sauce', label: 'Soy Sauce' },
      { id: 'fish_sauce', label: 'Fish Sauce' },
      { id: 'honey', label: 'Honey' },
      { id: 'nuts_condiment', label: 'Nuts' },
      { id: 'seeds', label: 'Seeds' },
      { id: 'olive_oil', label: 'Olive Oil' },
    ]
  }
};

export const DietaryForm: React.FC<DietaryFormProps> = ({
  selectedRestrictions,
  selectedDislikes,
  onRestrictionsChange,
  onDislikesChange,
  disabled = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Medical': false,
    'Lifestyle': false,
    'Religious': false,
    // Dislikes sections
    ...Object.keys(FOOD_DISLIKES_CATEGORIES).reduce((acc, key) => ({
      ...acc,
      [`dislikes_${key}`]: false
    }), {})
  });

  const toggleRestriction = (restrictionId: string) => {
    if (selectedRestrictions.includes(restrictionId)) {
      onRestrictionsChange(selectedRestrictions.filter(r => r !== restrictionId));
    } else {
      onRestrictionsChange([...selectedRestrictions, restrictionId]);
    }
  };

  const toggleDislike = (dislikeId: string) => {
    if (selectedDislikes.includes(dislikeId)) {
      onDislikesChange(selectedDislikes.filter(d => d !== dislikeId));
    } else {
      onDislikesChange([...selectedDislikes, dislikeId]);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getCategoryRestrictions = (category: string) => {
    return DIETARY_RESTRICTIONS.filter(restriction => restriction.category === category);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Medical': '🏥',
      'Lifestyle': '🌱',
      'Religious': '🕊️'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  return (
    <View style={styles.container}>
      
      {/* Dietary Restrictions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
        <Text style={styles.sectionDescription}>
          Select any dietary requirements that must be followed for health, lifestyle, or religious reasons.
        </Text>
        
        {(['Medical', 'Lifestyle', 'Religious'] as const).map((category) => (
          <View key={category} style={styles.restrictionCategory}>
            <TouchableOpacity 
              style={styles.categoryHeader}
              onPress={() => toggleSection(category)}
              disabled={disabled}
            >
              <View style={styles.categoryHeaderContent}>
                <Text style={styles.categoryTitle}>
                  {getCategoryIcon(category)} {category} Restrictions
                </Text>
                <Text style={styles.categorySubtitle}>
                  {getCategoryRestrictions(category).length} options available
                </Text>
              </View>
              <Text style={styles.expandArrow}>
                {expandedSections[category] ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {expandedSections[category] && (
              <View style={styles.restrictionList}>
                {getCategoryRestrictions(category).map((restriction) => (
                  <TouchableOpacity
                    key={restriction.id}
                    style={[
                      styles.restrictionButton,
                      selectedRestrictions.includes(restriction.id) && styles.restrictionButtonSelected
                    ]}
                    onPress={() => toggleRestriction(restriction.id)}
                    disabled={disabled}
                    accessible={true}
                    accessibilityLabel={`${restriction.label} dietary restriction`}
                    accessibilityRole="button"
                  >
                    <View style={styles.restrictionButtonContent}>
                      <Text style={[
                        styles.restrictionButtonText,
                        selectedRestrictions.includes(restriction.id) && styles.restrictionButtonTextSelected
                      ]}>
                        {restriction.label}
                      </Text>
                      <Text style={[
                        styles.restrictionDescription,
                        selectedRestrictions.includes(restriction.id) && styles.restrictionDescriptionSelected
                      ]}>
                        {restriction.description}
                      </Text>
                    </View>
                    {selectedRestrictions.includes(restriction.id) && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Selected Restrictions Summary */}
        {selectedRestrictions.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.selectedSummaryTitle}>
              Active Restrictions ({selectedRestrictions.length})
            </Text>
            <View style={styles.selectedItemsList}>
              {selectedRestrictions.map((restrictionId, index) => {
                const restriction = DIETARY_RESTRICTIONS.find(r => r.id === restrictionId);
                return (
                  <View key={index} style={styles.selectedItem}>
                    <Text style={styles.selectedItemText}>
                      {getCategoryIcon(restriction?.category || '')} {restriction?.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Food Dislikes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Food Dislikes</Text>
        <Text style={styles.sectionDescription}>
          Select specific foods this family member prefers to avoid. This helps create more enjoyable meals.
        </Text>
        
        {Object.entries(FOOD_DISLIKES_CATEGORIES).map(([categoryKey, category]) => (
          <View key={categoryKey} style={styles.dislikeCategory}>
            <TouchableOpacity 
              style={styles.categoryHeader}
              onPress={() => toggleSection(`dislikes_${categoryKey}`)}
              disabled={disabled}
            >
              <View style={styles.categoryHeaderContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>
                  {category.items.length} items • {selectedDislikes.filter(d => 
                    category.items.some(item => item.id === d)
                  ).length} selected
                </Text>
              </View>
              <Text style={styles.expandArrow}>
                {expandedSections[`dislikes_${categoryKey}`] ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {expandedSections[`dislikes_${categoryKey}`] && (
              <View style={styles.dislikeGrid}>
                {category.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dislikeOption,
                      selectedDislikes.includes(item.id) && styles.dislikeOptionSelected
                    ]}
                    onPress={() => toggleDislike(item.id)}
                    disabled={disabled}
                    accessible={true}
                    accessibilityLabel={`${item.label} food dislike`}
                    accessibilityRole="button"
                  >
                    <Text style={[
                      styles.dislikeOptionText,
                      selectedDislikes.includes(item.id) && styles.dislikeOptionTextSelected
                    ]}>
                      {item.label}
                    </Text>
                    {selectedDislikes.includes(item.id) && (
                      <View style={styles.dislikeSelectedIndicator}>
                        <Text style={styles.dislikeSelectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Selected Dislikes Summary */}
        {selectedDislikes.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.selectedSummaryTitle}>
              Selected Dislikes ({selectedDislikes.length})
            </Text>
            <Text style={styles.selectedSummarySubtitle}>
              These foods will be avoided when generating recipes
            </Text>
            <View style={styles.selectedDislikesList}>
              {selectedDislikes.slice(0, 10).map((dislikeId, index) => {
                // Find the item across all categories
                let itemLabel = dislikeId;
                Object.values(FOOD_DISLIKES_CATEGORIES).forEach(category => {
                  const foundItem = category.items.find(item => item.id === dislikeId);
                  if (foundItem) itemLabel = foundItem.label;
                });
                
                return (
                  <View key={index} style={styles.selectedDislikeTag}>
                    <Text style={styles.selectedDislikeTagText}>{itemLabel}</Text>
                  </View>
                );
              })}
              {selectedDislikes.length > 10 && (
                <Text style={styles.selectedDislikesMore}>
                  +{selectedDislikes.length - 10} more
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Preference Guidance */}
      <View style={styles.guidanceBox}>
        <Text style={styles.guidanceIcon}>💡</Text>
        <Text style={styles.guidanceText}>
          These preferences help create meals everyone will enjoy. You can always update them later as tastes change.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },

  section: {
    marginBottom: 32,
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
  restrictionCategory: {
    marginBottom: 20,
  },

  dislikeCategory: {
    marginBottom: 20,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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

  // Restriction Items
  restrictionList: {
    gap: 8,
    marginBottom: 12,
  },

  restrictionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  restrictionButtonSelected: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },

  restrictionButtonContent: {
    flex: 1,
  },

  restrictionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  restrictionButtonTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  restrictionDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter',
  },

  restrictionDescriptionSelected: {
    color: '#3B82F6',
  },

  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  // Food Dislikes Grid
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
    position: 'relative',
    minWidth: 80,
    alignItems: 'center',
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
    textAlign: 'center',
  },

  dislikeOptionTextSelected: {
    color: '#92400E',
    fontWeight: '600',
  },

  dislikeSelectedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dislikeSelectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },

  // Selected Summaries
  selectedSummary: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 16,
  },

  selectedSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
    fontFamily: 'Inter',
  },

  selectedSummarySubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  selectedItemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  selectedItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },

  selectedItemText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  selectedDislikesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  selectedDislikeTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  selectedDislikeTagText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  selectedDislikesMore: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    alignSelf: 'center',
    marginTop: 4,
  },

  // Guidance Box
  guidanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginTop: 16,
  },

  guidanceIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },

  guidanceText: {
    flex: 1,
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
    fontFamily: 'Inter',
  },
});