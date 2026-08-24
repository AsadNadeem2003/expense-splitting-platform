import React from 'react';
import { Users, Plus, Hash, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingGuideProps {
  userName: string;
  onCreateGroupClick: () => void;
  onJoinGroupClick: () => void;
  onAddExpenseClick: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  userName,
  onCreateGroupClick,
  onJoinGroupClick,
  onAddExpenseClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 mb-8 font-['Plus_Jakarta_Sans',_sans-serif] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <span className="inline-block bg-blue-500/25 text-blue-200 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full border border-blue-400/30 mb-3 shadow-xs">
          Quick Start Guide
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Welcome to SplitEase, {userName || 'Friend'}!
        </h2>
        <p className="text-sm text-slate-200 mt-1 max-w-xl font-medium">
          Get started with effortless expense splitting and automated debt simplification in 3 easy steps.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Step 1 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center font-extrabold text-sm mb-3">
              1
            </div>
            <h4 className="text-base font-bold text-white mb-1">Create or Join a Group</h4>
            <p className="text-xs text-slate-200 leading-relaxed mb-4 font-normal">
              Set up a group circle for roommates, a road trip, or office lunches.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateGroupClick}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus size={14} /> New Group
            </button>
            <button
              onClick={onJoinGroupClick}
              className="bg-white/10 hover:bg-white/20 text-slate-100 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 cursor-pointer"
            >
              <Hash size={14} /> Join
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/30 text-violet-300 flex items-center justify-center font-extrabold text-sm mb-3">
              2
            </div>
            <h4 className="text-base font-bold text-white mb-1">Invite Friends</h4>
            <p className="text-xs text-slate-200 leading-relaxed mb-4 font-normal">
              Share your group's unique 6-character invite code for instant 1-click joining.
            </p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            className="w-full bg-white/10 hover:bg-white/20 text-slate-100 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 cursor-pointer"
          >
            <Users size={14} /> View Groups & Codes
          </button>
        </div>

        {/* Step 3 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-extrabold text-sm mb-3">
              3
            </div>
            <h4 className="text-base font-bold text-white mb-1">Log First Expense</h4>
            <p className="text-xs text-slate-200 leading-relaxed mb-4 font-normal">
              Split bills equally or unequally—debts are simplified automatically.
            </p>
          </div>
          <button
            onClick={onAddExpenseClick}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Receipt size={14} /> Add First Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
