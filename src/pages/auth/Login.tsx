import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useLoginMutation } from '../../api/authApi';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../app/authSlice';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      
      // Store token in localStorage via setCredentials reducer
      dispatch(
        setCredentials({
          token: result.token,
          user: {
            name: email.split('@')[0],
            email: email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
          }
        })
      );
      
      // Navigate to chat
      navigate('/chat');
    } catch (err: any) {
      console.error('Login error:', err);
      const errMsg = err?.data?.error || err?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
    }
  };

  return (
    <div className="glassmorphism p-6 sm:p-8 rounded-3xl w-full border border-slate-800 shadow-2xl relative overflow-hidden select-none animate-fade-in">
      {/* Decorative glass glow inside */}
      <div className="absolute -top-[10%] -right-[10%] w-[120px] h-[120px] bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-[20px] font-bold text-slate-100 text-center tracking-wide mb-6">
        Sign in to your account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 text-[12px] font-semibold text-center animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 focus-within:border-sky-500/50 transition-all duration-200">
            <Mail className="absolute left-3 w-[16px] h-[16px] text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-[13.5px] text-slate-200 placeholder-slate-600 outline-none border-none focus:ring-0"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <a href="#" className="text-[11.5px] font-medium text-sky-400 hover:text-sky-300">
              Forgot?
            </a>
          </div>
          <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 focus-within:border-sky-500/50 transition-all duration-200">
            <Lock className="absolute left-3 w-[16px] h-[16px] text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-transparent text-[13.5px] text-slate-200 placeholder-slate-600 outline-none border-none focus:ring-0"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-[#0b0f19] font-bold text-[13.5px] rounded-xl shadow-lg shadow-sky-500/5 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <div className="w-[18px] h-[18px] border-2 border-[#0b0f19] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register link */}
      <div className="mt-6 text-center select-none">
        <span className="text-[12.5px] text-slate-400">
          New to ChatApp?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-[12.5px] font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            Create an account
          </button>
        </span>
      </div>
    </div>
  );
};

export default Login;
