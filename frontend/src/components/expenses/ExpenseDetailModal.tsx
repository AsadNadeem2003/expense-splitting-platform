import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExpenseDetails } from '../../api/expenses';
import { X, Receipt, Loader, Clock, Edit2 } from 'lucide-react';
import type { Group, User } from '../../types';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: number | null;
  group: Group;
  currentUser: User;
  onEditClick: (expense: any) => void;
}

export default function ExpenseDetailModal({ isOpen, onClose, expenseId, group, currentUser, onEditClick }: ExpenseDetailModalProps) {
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && expenseId) {
      fetchExpenseDetails();
    }
  }, [isOpen, expenseId]);

  const fetchExpenseDetails = async () => {
    setLoading(true);
    try {
      const data = await getExpenseDetails(expenseId!);
      setExpense(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden font-['Plus_Jakarta_Sans',_sans-serif]" 
          initial={{ y: 20, scale: 0.95 }} 
          animate={{ y: 0, scale: 1 }} 
          exit={{ y: 20, scale: 0.95 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10 sticky top-0">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Receipt size={22} className="text-blue-600" /> Expense Details
            </h2>
            <button 
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors" 
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          {loading || !expense ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-sm font-medium">Loading details...</p>
            </div>
          ) : (
            <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
              {/* Receipt Hero */}
              <div className="text-center mb-8">
                <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase mb-1">Total Amount</p>
                <h3 className="text-4xl font-extrabold text-slate-900 mb-2">Rs. {(expense.totalAmount / 100).toFixed(2)}</h3>
                <p className="text-base font-bold text-slate-700">{expense.description}</p>
                <p className="text-xs font-medium text-slate-400 mt-2 flex items-center justify-center gap-1">
                  <Clock size={14} /> Added on {new Date(expense.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              {/* Columns: Paid By vs Split Among */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Paid By */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Paid By</h4>
                  <div className="flex flex-col gap-3">
                    {expense.payers?.map((payer: any) => (
                      <div key={payer.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {payer.user?.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{payer.user?.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 font-mono">Rs. {(payer.amountPaid / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Split Among */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Split Among</h4>
                  <div className="flex flex-col gap-4">
                    {expense.participants?.map((p: any) => {
                      const percentage = (p.shareAmount / expense.totalAmount) * 100;
                      return (
                        <div key={p.id} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {p.user?.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-800">{p.user?.name}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-700 font-mono">Rs. {(p.shareAmount / 100).toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Not Involved Section */}
              {(() => {
                const involvedUserIds = new Set([
                  ...(expense.participants?.map((p: any) => p.user?.id) || []),
                  ...(expense.payers?.map((p: any) => p.user?.id) || [])
                ]);

                const nonParticipatingMembers = group.members?.filter(
                  (m: any) => !involvedUserIds.has(m.user.id)
                ) || [];

                if (nonParticipatingMembers.length === 0) return null;

                return (
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-8">
                    <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Not Involved</h4>
                    <div className="flex flex-col gap-3">
                      {nonParticipatingMembers.map((m: any) => (
                        <div key={m.user.id} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {m.user?.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-500">{m.user?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Audit Trail */}
              {expense.editHistory && expense.editHistory.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
                    Audit Trail
                  </h4>
                  <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-[5px] before:w-[2px] before:bg-slate-100">
                    {expense.editHistory.map((history: any) => (
                      <div key={history.id} className="relative pl-5">
                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-300"></div>
                        <div className="text-[11px] font-bold text-slate-400 mb-0.5">{new Date(history.createdAt).toLocaleString()}</div>
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">{history.editedBy?.name || 'Unknown User'}</span> updated this expense <span className="text-slate-400 font-medium">({history.changeType.replace(/_/g, ' ').toLowerCase()})</span>.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          {!loading && expense && (
            <div className="px-6 py-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 sticky bottom-0">
              {group.members?.find((m: any) => m.user.id === currentUser.id) && (
                <button 
                  type="button" 
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-95" 
                  onClick={() => {
                    onClose();
                    onEditClick(expense);
                  }}
                >
                  <Edit2 size={16} /> Edit Expense
                </button>
              )}
              <button 
                type="button" 
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-95" 
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
