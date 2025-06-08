import React from 'react';

interface CategoryPillsProps {
  categories: string[];
  label: string;
  onCategorySelect: (category: string) => void;
  isLoading: boolean;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, label, onCategorySelect, isLoading }) => {
  return (
    <div className="my-4">
      <h3 className="text-lg font-semibold text-ew-text-secondary mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className="px-4 py-2 bg-ew-card border border-ew-primary text-ew-primary rounded-full text-sm hover:bg-ew-primary hover:text-ew-background transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading}
            title={category} // Show full category name on hover if it might be truncated or translated
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPills;
