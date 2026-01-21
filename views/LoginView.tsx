
import React, { useState } from 'react';
import { AssessmentAPI } from '../services/api';
import { User } from '../types';
import { APP_NAME } from '../constants';

interface LoginViewProps {
  onLogin: (user: User, token: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await AssessmentAPI.getUserByEmail(email);
      if (user) {
        // Mock success
        setTimeout(() => {
          onLogin(user, 'mock-jwt-token-' + Math.random());
          setLoading(false);
        }, 1000);
      } else {
        setError('Invalid credentials or user does not exist.');
        setLoading(false);
      }
    } catch (err) {
      setError('Login service error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-blue-100 mt-2">Sign in to your production assessment portal</p>
        </div>
        
        <form className="p-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm flex items-center">
              <i className="fas fa-exclamation-triangle mr-3"></i>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-3.5 text-slate-400"></i>
              <input 
                type="email" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@edupro.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Hint: admin@edupro.com, jane@edupro.com, john@edupro.com</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-3.5 text-slate-400"></i>
              <input 
                type="password" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <span>Sign In</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </>
            )}
          </button>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
          Managed by EduPro DevOps Team
        </div>
      </div>
    </div>
  );
};

export default LoginView;
