import React from 'react';
import { FileText, UserPlus, Sparkles, MessageSquare } from 'lucide-react';

interface WelcomePanelProps {
  onQuickAction: (action: string) => void;
}

export const WelcomePanel: React.FC<WelcomePanelProps> = ({ onQuickAction }) => {
  const quickActions = [
    { id: 'send_doc', icon: FileText, text: 'Send document', color: 'text-sky-400 bg-sky-950/40 border-sky-900/30' },
    { id: 'add_contact', icon: UserPlus, text: 'Add contact', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' },
    { id: 'meta_ai', icon: Sparkles, text: 'Ask Meta AI', color: 'text-violet-400 bg-violet-950/40 border-violet-900/30' }
  ];

  return (
    <div className="flex-1 bg-[#0b0f19] flex flex-col justify-center items-center py-12 px-6 h-full relative overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="glow-orb w-[300px] h-[300px] bg-blue-600/10 top-1/4 left-1/3" />
      <div className="glow-orb w-[250px] h-[250px] bg-sky-500/10 bottom-1/4 right-1/4" />

      {/* Core Center Container */}
      <div className="flex flex-col items-center max-w-md text-center z-10 animate-fade-in">
        {/* Device graphic */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Laptop Screen mockup */}
          <div className="w-[180px] h-[110px] bg-slate-800 rounded-lg border-4 border-slate-700 shadow-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1 left-2 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/70" />
            </div>
            
            <div className="w-[60px] h-[60px] bg-slate-900/80 rounded-2xl flex items-center justify-center border border-slate-700">
              <MessageSquare className="w-7 h-7 text-sky-400" />
            </div>
            
            {/* Phone floating on side */}
            <div className="absolute bottom-1 right-2 w-[34px] h-[64px] bg-slate-900 border-2 border-slate-700 rounded-md shadow-2xl flex flex-col justify-between p-1 items-center z-20">
              <div className="w-4 h-0.5 bg-slate-700 rounded-full" />
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
            </div>
          </div>
          {/* Laptop Base */}
          <div className="absolute top-[110px] w-[210px] h-[8px] bg-slate-600 rounded-b-md shadow-md" />
          <div className="absolute top-[118px] w-[40px] h-[3px] bg-slate-700 rounded-b-sm" />
        </div>

        {/* Text Details */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-3 tracking-wide">
          Welcome To The App Applicarion
        </h2>
       

        {/* Download Button */}
        <button 
          onClick={() => onQuickAction('add_contact')}
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-[#0b0f19] font-semibold text-[13.5px] rounded-full transition-all duration-200 shadow-lg shadow-sky-500/10 active:scale-95 cursor-pointer"
        >
          Add Contacts
        </button>
      </div>


    </div>
  );
};
