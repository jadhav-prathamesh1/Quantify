import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface BaseInputProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface RegularInputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  multiline?: false;
}

interface TextAreaProps extends BaseInputProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  multiline: true;
}

type InputProps = RegularInputProps | TextAreaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  label,
  error,
  required = false,
  className = '',
  multiline = false,
  ...props
}, ref) => {
  const inputClasses = `w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white placeholder-gray-500 ${
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
      
      {multiline ? (
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          className={inputClasses}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          className={inputClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      
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

Input.displayName = 'Input';
