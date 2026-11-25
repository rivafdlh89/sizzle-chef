// Sizzle Chef — ingredients and recipes. An ingredient is raw until a station
// turns it into its cooked form; a recipe is the exact multiset of cooked items
// an order ticket asks for. Nothing here is copied from a commercial game.
export const INGREDIENTS = {
  bun: { label: 'Bun', key: '1', ready: true, color: '#e8a85c', dark: '#b97c33' },
  patty: { label: 'Patty', key: '2', station: 'grill', color: '#c65a4a', dark: '#8f3a2e', cooked: 'grilled-patty' },
  lettuce: { label: 'Lettuce', key: '3', station: 'chop', color: '#7cc24a', dark: '#4e8a2a', cooked: 'chopped-lettuce' },
  tomato: { label: 'Tomato', key: '4', station: 'chop', color: '#e84a3a', dark: '#b02a20', cooked: 'chopped-tomato' },
  cheese: { label: 'Cheese', key: '5', station: 'chop', color: '#f7c948', dark: '#d9a41f', cooked: 'chopped-cheese' },
  noodle: { label: 'Noodle', key: '6', station: 'pot', color: '#f2d06b', dark: '#c9a13a', cooked: 'boiled-noodle' },
  sauce: { label: 'Sauce', key: '7', ready: true, color: '#d63c2f', dark: '#9e2418' },
};

// Cooked forms, keyed by the `cooked` name above. `from` is the raw ingredient.
export const COOKED = {
  'grilled-patty': { label: 'Grilled patty', from: 'patty', color: '#7a4a28', dark: '#54301a' },
  'chopped-lettuce': { label: 'Chopped lettuce', from: 'lettuce', color: '#8ed45f', dark: '#5da336' },
  'chopped-tomato': { label: 'Chopped tomato', from: 'tomato', color: '#f2604d', dark: '#c23a2c' },
  'chopped-cheese': { label: 'Chopped cheese', from: 'cheese', color: '#ffd94d', dark: '#e0b32a' },
  'boiled-noodle': { label: 'Boiled noodle', from: 'noodle', color: '#f7dd85', dark: '#d9b45a' },
};

export const RECIPES = [
  {
    id: 'burger',
    name: 'Classic Burger',
    items: ['bun', 'grilled-patty', 'chopped-lettuce'],
    price: 18,
    weight: 3,
  },
  {
    id: 'pasta',
    name: 'Tomato Pasta',
    items: ['boiled-noodle', 'sauce', 'chopped-cheese'],
    price: 20,
    weight: 3,
  },
  {
    id: 'salad',
    name: 'Garden Salad',
    items: ['chopped-lettuce', 'chopped-tomato', 'chopped-cheese'],
    price: 14,
    weight: 2,
  },
  {
    id: 'melt',
    name: 'Cheesy Melt',
    items: ['bun', 'grilled-patty', 'chopped-cheese'],
    price: 22,
    weight: 2,
  },
];

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) ?? RECIPES[0];
}

/** Short label for a cooked or raw item, for tickets and plates. */
export function itemLabel(item) {
  if (COOKED[item]) return COOKED[item].label;
  return INGREDIENTS[item]?.label ?? item;
}

/** Colour pair for drawing any item, raw or cooked. */
export function itemColors(item) {
  const def = COOKED[item] ?? INGREDIENTS[item];
  return def ? { color: def.color, dark: def.dark } : { color: '#999', dark: '#666' };
}
