import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
  name?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  className = '',
  name,
  placeholder = 'Select an option...',
}, ref) => {
  const selectClasses = `w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 ${
    error ? 'border-red-500 focus:ring-red-500' : ''
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-1 ${className}`}
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={selectClasses}
      >
        <option value="" className="text-gray-500">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
});

Select.displayName = 'Select';
