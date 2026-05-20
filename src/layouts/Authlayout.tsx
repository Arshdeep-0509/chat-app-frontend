import React from 'react';
import { MessageSquare } from 'lucide-react';

interface AuthlayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const Authlayout: React.FC<AuthlayoutProps> = ({ 
  children,
  title = "ChatApp",
  subtitle = "Connect instantly with colleagues, friends, and family."
}) => {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Background Glowing Orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-blue-600/10 -top-40 -left-20" />
      <div className="glow-orb w-[350px] h-[350px] bg-indigo-500/10 -bottom-20 -right-20" />
      <div className="glow-orb w-[300px] h-[300px] bg-sky-500/5 top-1/3 right-1/4" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center border border-slate-700/50 shadow-xl shadow-indigo-500/10 mb-4 hover:scale-105 transition-transform duration-200">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-indigo-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-[12.5px] text-slate-400 mt-2 max-w-xs leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Content Slot */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Authlayout;
