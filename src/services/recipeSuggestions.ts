export interface RecipeIdea {
  id: string;
  ingredientMatch: string[];
  title: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium';
  description: string;
  steps: string[];
}

export const ZERO_WASTE_RECIPES: RecipeIdea[] = [
  {
    id: 'r_banana_bread',
    ingredientMatch: ['banana', 'bananas'],
    title: '🍌 Zero-Waste Quick Banana Bread / Pancakes',
    prepTime: '20 mins',
    difficulty: 'Easy',
    description: 'Perfect for overripe or brown bananas instead of discarding them.',
    steps: [
      'Mash 2-3 bananas in a mixing bowl with a fork.',
      'Add 1 egg, 2 tbsp melted butter or oil, 1 cup flour, and 1 tsp baking powder.',
      'Pour into muffin tray or skillet to make golden pancakes!'
    ]
  },
  {
    id: 'r_milk_pancakes',
    ingredientMatch: ['milk', 'dairy'],
    title: '🥞 Fluffy Golden Pancakes or Ricotta Cheese',
    prepTime: '15 mins',
    difficulty: 'Easy',
    description: 'Use up remaining cups of milk before the expiration date.',
    steps: [
      'Mix 1 cup milk with 1 cup flour, 1 egg, and 1 tbsp sugar.',
      'Heat a lightly buttered pan on medium heat.',
      'Cook until bubbles form, flip, and serve with honey or fruit.'
    ]
  },
  {
    id: 'r_spinach_frittata',
    ingredientMatch: ['spinach', 'eggs', 'egg', 'cheese'],
    title: '🍳 Clean-out-the-Fridge Cheesy Frittata',
    prepTime: '15 mins',
    difficulty: 'Easy',
    description: 'Whisk eggs with wilting greens and leftover cheese for a nutritious meal.',
    steps: [
      'Sauté spinach and any leftover veggies in an oven-safe skillet.',
      'Whisk 4 eggs with salt, pepper, and shredded cheese.',
      'Pour over greens, cook until set on bottom, then broil for 3 minutes.'
    ]
  },
  {
    id: 'r_stale_bread_croutons',
    ingredientMatch: ['bread', 'loaf', 'sourdough'],
    title: '🥖 Crispy Garlic & Herb Croutons',
    prepTime: '10 mins',
    difficulty: 'Easy',
    description: 'Transform day-old or dry bread into crunchy gourmet croutons.',
    steps: [
      'Cut bread into bite-sized cubes.',
      'Toss generously with olive oil, garlic powder, dried oregano, and salt.',
      'Bake at 375°F (190°C) for 10-12 minutes until deeply golden and crispy.'
    ]
  },
  {
    id: 'r_yogurt_smoothie',
    ingredientMatch: ['yogurt', 'curd', 'berry', 'berries', 'apple', 'juice'],
    title: '🥤 Antioxidant Breakfast Smoothie Bowl',
    prepTime: '5 mins',
    difficulty: 'Easy',
    description: 'Blend expiring yogurt with fruit and honey for a refreshing boost.',
    steps: [
      'Add yogurt, fresh or frozen fruit, and a splash of milk or water to blender.',
      'Blend on high until silky smooth.',
      'Top with nuts, seeds, or granola.'
    ]
  },
  {
    id: 'r_veggie_soup_stock',
    ingredientMatch: ['carrot', 'potato', 'onion', 'garlic', 'tomato', 'celery'],
    title: '🍲 Hearty Everything Veggie Soup',
    prepTime: '25 mins',
    difficulty: 'Easy',
    description: 'Simmer vegetable odds and ends into a savory homemade broth.',
    steps: [
      'Chop all remaining vegetables into uniform pieces.',
      'Sauté in a pot with olive oil and spices for 5 minutes.',
      'Add 4 cups water or vegetable broth, bring to boil, and simmer for 20 mins.'
    ]
  }
];

export function findRecipesForExpiringItems(productNames: string[]): RecipeIdea[] {
  const matched: RecipeIdea[] = [];
  const lowerNames = productNames.map(n => n.toLowerCase());

  for (const recipe of ZERO_WASTE_RECIPES) {
    const hasMatch = recipe.ingredientMatch.some(ingredient => 
      lowerNames.some(name => name.includes(ingredient))
    );
    if (hasMatch) {
      matched.push(recipe);
    }
  }

  // If no direct matches, return general top zero-waste tips
  if (matched.length === 0) {
    return [ZERO_WASTE_RECIPES[2], ZERO_WASTE_RECIPES[3]];
  }

  return matched;
}
