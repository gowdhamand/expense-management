export interface Category {
  categoryId: number;
  name: string;
}

//constants with value starting from 1
const categories = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

// Initialize categories with IDs
const initializedCategories = categories.map((name, index) => ({
  categoryId: index + 1,
  name,
}));

// Export initialized categories
export const categoriesWithIds = initializedCategories;

// Export categories without IDs
export const categoriesWithoutIds = categories;
