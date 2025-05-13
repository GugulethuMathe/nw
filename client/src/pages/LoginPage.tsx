import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/AuthService';
import logoPath from "@assets/logo.png";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log('handleSubmit: Attempting login with', { username, password });
  
    try {
      console.log('handleSubmit: Calling AuthService.login');
      const result = await AuthService.login({ username, password });
      console.log('handleSubmit: AuthService.login success', result);
      login(result.token, result.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('handleSubmit: CATCH BLOCK - Error during login:', err); // Log the whole error object
      // More robust error message display:
      let errorMessage = 'An unexpected error occurred.';
      if (err && err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      console.log('handleSubmit: Setting error message:', errorMessage);
      setError(errorMessage);
    } finally { // Use finally to ensure isLoading is always reset
      console.log('handleSubmit: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <img src={logoPath} alt="College Site Tracker Logo" className="h-16 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-center text-primary-600 mb-6">
          Welcome Back
        </h2>
        
        {error && (
          <div className="bg-error-lightest text-error-dark p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;