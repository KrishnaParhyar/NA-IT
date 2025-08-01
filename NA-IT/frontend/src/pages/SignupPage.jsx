import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline'; // Using Heroicons

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [role, setRole] = useState('Operator');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.signup(formData.username, formData.password, role);
      setApiSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-gray-600 mt-2">for the National Assembly Inventory System</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
            {apiSuccess && <p className="text-sm text-green-600 text-center">{apiSuccess}</p>}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200 ${errors.username ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400 focus:ring-blue-500'}`} placeholder="Enter your username" />
              {errors.username && <p className="mt-1 text-sm text-red-600 flex items-center"><ExclamationCircleIcon className="h-4 w-4 mr-1" />{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200 ${errors.password ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400 focus:ring-blue-500'}`} placeholder="Create a password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 flex items-center"><ExclamationCircleIcon className="h-4 w-4 mr-1" />{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200 ${errors.confirmPassword ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400 focus:ring-blue-500'}`} placeholder="Confirm your password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 flex items-center"><ExclamationCircleIcon className="h-4 w-4 mr-1" />{errors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Operator</option>
                <option>Management</option>
                <option>Admin</option>
              </select>
            </div>

            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating account...
                </>
              ) : (
                <div className="flex items-center">
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Sign up
                </div>
              )}
            </button>
          </form>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 