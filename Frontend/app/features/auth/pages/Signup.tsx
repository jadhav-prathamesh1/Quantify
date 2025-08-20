import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '../../../utils/validation';
import { useAuth } from '../../../providers/AuthProvider';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../../../components/Button';

const roleOptions = [
  { value: 'user', label: 'User - Browse and rate stores' },
  { value: 'owner', label: 'Store Owner - Manage your store' },
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
    },
  });

  // Watch form values for debugging
  const watchedValues = watch();
  console.log('Signup form values:', watchedValues);

  const onSubmit = async (data: SignupFormData) => {
    // Transform data to ensure no undefined values
    const cleanedData = {
      name: data.name || '',
      email: data.email || '',
      password: data.password || '',
      address: data.address || '',
      role: data.role || 'user' as 'user' | 'owner',
    };
    
    console.log('Form data:', cleanedData); // Debug log
    try {
      const success = await signup(cleanedData);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Join our store rating platform
          </motion.p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name (20-60 characters)"
              {...register('name')}
              error={errors.name?.message}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              error={errors.email?.message}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="8-16 chars, 1 uppercase, 1 special character"
                {...register('password')}
                error={errors.password?.message}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors z-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>

            <Input
              label="Address"
              placeholder="Enter your address (optional, max 400 characters)"
              {...register('address')}
              error={errors.address?.message}
              multiline
              rows={2}
            />

            <Select
              label="Role"
              options={roleOptions}
              {...register('role')}
              error={errors.role?.message}
              required
              placeholder="Select your role..."
            />

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
