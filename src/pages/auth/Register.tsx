import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useRegisterMutation } from '../../api/authApi';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register({
        name,
        username,
        email,
        password
      }).unwrap();

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      const errMsg = err?.data?.error || err?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
    }
  };

  return (
    <div className="glassmorphism p-6 sm:p-8 rounded-3xl w-full border border-slate-800 shadow-2xl relative overflow-hidden select-none animate-fade-in">
      <div className="absolute -top-[10%] -left-[10%] w-[120px] h-[120px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-[20px] font-bold text-slate-100 text-center tracking-wide mb-6">
        Create a new account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 text-[12px] font-semibold text-center animate-pulse">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-emerald-450 text-[12px] font-semibold text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 focus-within:border-sky-500/50 transition-all duration-200">
            <User className="absolute left-3 w-[16px] h-[16px] text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-[13.5px] text-slate-200 placeholder-slate-600 outline-none border-none focus:ring-0"
              placeholder="Arshdeep Singh"
            />
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label className="block text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Username
          </label>
          <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 focus-within:border-sky-500/50 transition-all duration-200">
            <User className="absolute left-3 w-[16px] h-[16px] text-slate-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-[13.5px] text-slate-200 placeholder-slate-600 outline-none border-none focus:ring-0"
              placeholder="arshdeep"
            />
          </div>
        </div>

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
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-[13.5px] text-slate-200 placeholder-slate-600 outline-none border-none focus:ring-0"
              placeholder="arsh@example.com"
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 focus-within:border-sky-500/50 transition-all duration-200">
              <Lock className="absolute left-3 w-[15px] h-[15px] text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-transparent text-[13px] text-slate-200 placeholder-slate-600 outline-none border-none focus:ring-0"
                placeholder="••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Confirm
            </label>
            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 focus-within:border-sky-500/50 transition-all duration-200">
              <Lock className="absolute left-3 w-[15px] h-[15px] text-slate-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-transparent text-[13px] text-slate-200 placeholder-slate-600 outline-none border-none focus:ring-0"
                placeholder="••••••"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-[#0b0f19] font-bold text-[13.5px] rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <div className="w-[18px] h-[18px] border-2 border-[#0b0f19] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign Up <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login Link */}
      <div className="mt-6 text-center select-none">
        <span className="text-[12.5px] text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-[12.5px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </span>
      </div>
    </div>
  );
};

export default Register;
