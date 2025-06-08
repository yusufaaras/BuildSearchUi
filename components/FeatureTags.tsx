import React from 'react';

interface FeatureTagsProps {
  tags: string[];
  label: string;
}

const FeatureTags: React.FC<FeatureTagsProps> = ({ tags, label }) => {
  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold text-ew-text-secondary mb-2">{label}</h3>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-ew-accent bg-opacity-20 text-ew-accent border border-ew-accent rounded-md text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FeatureTags;
