import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, ArrowRight, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

interface AlgorithmExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmExplainerModal: React.FC<AlgorithmExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-['Plus_Jakarta_Sans',_sans-serif]"
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Network size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">How SplitEase Simplifies Debts</h3>
                <p className="text-xs text-slate-400">Algorithmic graph theory & greedy debt optimization</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Visual Comparison Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Without SplitEase */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                    Without SplitEase
                  </span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                    6 Transactions
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Multiple overlapping debts create chaotic cross-payments among friends:
                </p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="bg-white/80 p-2 rounded-lg text-slate-700 flex justify-between border border-rose-100/50">
                    <span>Ahsan → Nouman</span> <span className="font-bold text-rose-600">Rs. 500</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg text-slate-700 flex justify-between border border-rose-100/50">
                    <span>Nouman → Zain</span> <span className="font-bold text-rose-600">Rs. 300</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg text-slate-700 flex justify-between border border-rose-100/50">
                    <span>Abdullah → Ahsan</span> <span className="font-bold text-rose-600">Rs. 400</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg text-slate-700 flex justify-between border border-rose-100/50">
                    <span>Zain → Abdullah</span> <span className="font-bold text-rose-600">Rs. 200</span>
                  </div>
                </div>
              </div>

              {/* With SplitEase */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    With SplitEase Optimization
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Only 2 Transfers
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Our greedy graph algorithm eliminates redundant transfers instantly:
                </p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="bg-white/80 p-2 rounded-lg text-slate-800 flex justify-between border border-emerald-100 shadow-2xs">
                    <span>Abdullah → Nouman</span> <span className="font-bold text-emerald-600">Rs. 200</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg text-slate-800 flex justify-between border border-emerald-100 shadow-2xs">
                    <span>Abdullah → Zain</span> <span className="font-bold text-emerald-600">Rs. 100</span>
                  </div>
                </div>
                <div className="mt-3 bg-emerald-100/60 p-2.5 rounded-xl text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                  <ArrowRight size={14} className="flex-shrink-0" />
                  <span>67% fewer transfers needed. Zero debt confusion.</span>
                </div>
              </div>
            </div>

            {/* Core Mathematical Foundations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Core Engineering Foundations
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mb-2.5">
                    <RefreshCw size={16} />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1">Conservation of Balances</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All net balances within any group strictly sum to zero, guaranteeing that no money is ever created or lost.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs mb-2.5">
                    <Cpu size={16} />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1">Greedy Edge Reduction</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Matches the largest debtor with the largest creditor at each step, collapsing N(N-1) potential cross-debts to at most N-1 payments.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mb-2.5">
                    <ShieldCheck size={16} />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1">Zero Rounding Error</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All financial values are stored in PostgreSQL as 64-bit integer paisa (1 PKR = 100 Paisa), preventing binary float inaccuracies.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              SplitEase Graph Theory Engine
            </span>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AlgorithmExplainerModal;
