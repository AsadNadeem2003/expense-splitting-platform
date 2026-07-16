import React from 'react';
import { X, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BreakdownItem {
  groupId: number;
  groupName: string;
  type: 'OWES' | 'OWED';
  otherUserId: number;
  otherUserName: string;
  amount: number;
}

interface BalancesBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'OWES' | 'OWED';
  breakdown: BreakdownItem[];
}

const BalancesBreakdownModal: React.FC<BalancesBreakdownModalProps> = ({ isOpen, onClose, type, breakdown }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredBreakdown = breakdown.filter(item => item.type === type);

  // Group by groupId
  const grouped = filteredBreakdown.reduce((acc, item) => {
    if (!acc[item.groupId]) {
      acc[item.groupId] = {
        groupName: item.groupName,
        items: []
      };
    }
    acc[item.groupId].items.push(item);
    return acc;
  }, {} as Record<number, { groupName: string, items: BreakdownItem[] }>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {type === 'OWES' ? 'People You Owe' : 'People Who Owe You'}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {type === 'OWES' ? 'Your outstanding debts across all groups' : 'Outstanding balances owed to you'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <h4 className="text-slate-900 font-bold text-lg mb-2">You're all settled up!</h4>
              <p className="text-slate-500 text-sm">No pending balances found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(grouped).map(group => (
                <div key={group.groupName} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-slate-100/50 px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <Users size={16} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{group.groupName}</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'OWES' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {type === 'OWES' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {type === 'OWES' ? `You owe ${item.otherUserName}` : `${item.otherUserName} owes you`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold font-mono ${type === 'OWES' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            Rs. {(item.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      onClose();
                      navigate(`/groups/${group.items[0].groupId}`);
                    }}
                    className="w-full py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 transition-colors border-t border-slate-100"
                  >
                    View Group
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalancesBreakdownModal;
