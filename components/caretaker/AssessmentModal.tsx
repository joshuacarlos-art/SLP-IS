import React from 'react';

interface AssessmentUIProps {
  children?: React.ReactNode;
  className?: string;
}

export const AssessmentUI: React.FC<AssessmentUIProps> = ({ children, className }) => {
  return (
    <div className={`assessment-ui ${className || ''}`}>
      {children}
    </div>
  );
};

export const AssessmentForm: React.FC<AssessmentUIProps> = ({ children, className }) => {
  return (
    <form className={`space-y-4 ${className || ''}`}>
      {children}
    </form>
  );
};

interface AssessmentFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const AssessmentField: React.FC<AssessmentFieldProps> = ({ label, children, className }) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
};

// Star Rating Component
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  className = ''
}) => {
  const stars = Array.from({ length: maxRating }, (_, index) => index + 1);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
        >
          <svg
            className={`w-6 h-6 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

// Category Bar Component
interface CategoryBarProps {
  categories: string[];
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  currentCategory,
  onCategoryChange,
  className = ''
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentCategory === category
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default AssessmentUI;