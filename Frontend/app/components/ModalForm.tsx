import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  KeyIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea';
  icon?: React.ComponentType<any>;
  emoji?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  loading?: boolean;
}

export function ModalForm({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  initialData = {},
  loading = false
}: ModalFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
    // Debug: Log form changes
    console.log('Form field changed:', { name, value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'email' && formData[field.name] && 
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])) {
        newErrors[field.name] = 'Please enter a valid email address';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative inline-block transform overflow-hidden rounded-lg bg-white px-6 pt-6 pb-6 text-left align-middle shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-8"
            >
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Fill out the form below with the required information.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-md p-3"
                      >
                        <p className="text-sm text-red-600">{errors.general}</p>
                      </motion.div>
                    )}

                    {fields && fields.length > 0 && fields.map((field) => {
                      if (!field || !field.name) return null;
                      
                      const Icon = field.icon;
                      
                      return (
                        <motion.div
                          key={field.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: fields.indexOf(field) * 0.1 }}
                          className="space-y-1"
                        >
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            {field.emoji && <span>{field.emoji}</span>}
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>
                              {field.label || field.name}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </label>
                          
                          {field.type === 'select' ? (
                            <select
                              value={formData[field.name] || ''}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-3 text-gray-900 text-base ${
                                errors[field.name] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                              }`}
                            >
                              <option value="" className="text-gray-500">Select {field.label}</option>
                              {field.options && field.options.filter(option => option && option.value !== null && option.label !== null).map((option) => (
                                <option key={option.value} value={option.value} className="text-gray-900">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              rows={4}
                              value={formData[field.name] || ''}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              placeholder={field.placeholder}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-3 text-gray-900 text-base placeholder-gray-400 ${
                                errors[field.name] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                              }`}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={formData[field.name] || ''}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              placeholder={field.placeholder}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-3 text-gray-900 text-base placeholder-gray-400 ${
                                errors[field.name] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                              }`}
                            />
                          )}
                          
                          {errors[field.name] && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-sm text-red-600"
                            >
                              {errors[field.name]}
                            </motion.p>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Actions */}
                    <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </motion.button>
                      
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
