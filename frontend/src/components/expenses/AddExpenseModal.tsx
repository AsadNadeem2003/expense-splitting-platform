import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createExpense, updateExpense } from '../../api/expenses';
import { X, Receipt, Loader } from 'lucide-react';
import type { Group, User } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  currentUser: User;
  onExpenseAdded: () => void;
  editExpense?: any; // The expense to edit, if any
}

export default function AddExpenseModal({ isOpen, onClose, group, currentUser, onExpenseAdded, editExpense }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  
  const [payerMode, setPayerMode] = useState<'single' | 'multiple'>('single');
  const [singlePayerId, setSinglePayerId] = useState(currentUser.id.toString());
  const [multiPayers, setMultiPayers] = useState<Record<number, string>>({});

  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset or populate state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editExpense) {
        setDescription(editExpense.description);
        setAmount((editExpense.totalAmount / 100).toString());
        
        // Populate participants
        if (editExpense.participants) {
          setSelectedParticipants(editExpense.participants.map((p: any) => p.userId));
        }

        // Populate payers
        if (editExpense.payers && editExpense.payers.length > 1) {
          setPayerMode('multiple');
          const mp: Record<number, string> = {};
          editExpense.payers.forEach((p: any) => {
            mp[p.userId] = (p.amountPaid / 100).toString();
          });
          setMultiPayers(mp);
        } else if (editExpense.payers && editExpense.payers.length === 1) {
          setPayerMode('single');
          setSinglePayerId(editExpense.payers[0].userId.toString());
        }
      } else {
        // Create mode
        setDescription('');
        setAmount('');
        setPayerMode('single');
        setSinglePayerId(currentUser.id.toString());
        setMultiPayers({});
        if (group?.members) {
          setSelectedParticipants(group.members.map(m => m.user.id));
        }
      }
      setError('');
    }
  }, [isOpen, group, editExpense, currentUser]);

  const toggleParticipant = (userId: number) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleMultiPayerChange = (userId: number, value: string) => {
    setMultiPayers(prev => ({ ...prev, [userId]: value }));
  };

  const parsedAmount = parseFloat(amount) || 0;
  
  const multiPayersSum = useMemo(() => {
    return Object.values(multiPayers).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [multiPayers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || parsedAmount <= 0) {
      setError('Please provide a valid description and amount.');
      return;
    }
    if (selectedParticipants.length === 0) {
      setError('You must select at least one participant to split the bill.');
      return;
    }

    let payersPayload: { userId: number, amountPaid: number }[] = [];

    if (payerMode === 'single') {
      payersPayload = [{ userId: parseInt(singlePayerId, 10), amountPaid: parsedAmount }];
    } else {
      if (Math.abs(multiPayersSum - parsedAmount) > 0.01) {
        setError(`The sum of amounts paid (Rs. ${multiPayersSum.toFixed(2)}) must equal the total expense amount (Rs. ${parsedAmount.toFixed(2)}).`);
        return;
      }
      payersPayload = Object.entries(multiPayers)
        .map(([id, val]) => ({ userId: parseInt(id, 10), amountPaid: parseFloat(val) || 0 }))
        .filter(p => p.amountPaid > 0);
      
      if (payersPayload.length === 0) {
        setError('Please enter amount paid for at least one person.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const splitAmount = Number((parsedAmount / selectedParticipants.length).toFixed(2));
      const participantsPayload = selectedParticipants.map((userId, index) => {
        let finalSplit = splitAmount;
        if (index === selectedParticipants.length - 1) {
            finalSplit = Number((parsedAmount - (splitAmount * (selectedParticipants.length - 1))).toFixed(2));
        }
        return { userId, shareAmount: finalSplit };
      });

      const primaryPayerId = payersPayload.sort((a, b) => b.amountPaid - a.amountPaid)[0].userId;

      const expenseData = {
        groupId: group.id,
        description,
        totalAmount: parsedAmount,
        participants: participantsPayload,
        payers: payersPayload,
        paidById: primaryPayerId
      };

      if (editExpense) {
        await updateExpense(editExpense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      
      setDescription('');
      setAmount('');
      onExpenseAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden font-['Plus_Jakarta_Sans',_sans-serif]" 
            initial={{ y: 20, scale: 0.95 }} 
            animate={{ y: 0, scale: 1 }} 
            exit={{ y: 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt size={22} className="text-blue-600" /> {editExpense ? 'Edit Expense' : 'Add an Expense'}
              </h2>
              <button 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors" 
                onClick={onClose}
                title="Go back"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 text-sm font-medium mb-6">
                  {error}
                </div>
              )}
              
              <form id="add-expense-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Description & Amount */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Description</label>
                    <input 
                      type="text" 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      placeholder="e.g. Dinner at Luigi's"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Total Amount (Rs.)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Who Paid */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-400 tracking-wider uppercase">Who Paid?</label>
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                      <button 
                        type="button" 
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${payerMode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                        onClick={() => setPayerMode('single')}
                      >
                        Single
                      </button>
                      <button 
                        type="button" 
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${payerMode === 'multiple' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
                        onClick={() => setPayerMode('multiple')}
                      >
                        Multiple
                      </button>
                    </div>
                  </div>

                  {payerMode === 'single' ? (
                    <select 
                      value={singlePayerId} 
                      onChange={e => setSinglePayerId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {group.members?.map(m => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.id === currentUser.id ? 'You' : m.user.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {group.members?.map(m => (
                        <div key={m.user.id} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {m.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {m.user.id === currentUser.id ? 'You' : m.user.name}
                            </span>
                          </div>
                          <div className="relative w-28">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              min="0"
                              placeholder="0.00"
                              value={multiPayers[m.user.id] || ''}
                              onChange={(e) => handleMultiPayerChange(m.user.id, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-8 pr-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold">
                        <span className="text-slate-500">Total Accounted:</span>
                        <div className="flex items-center gap-2">
                          <span className={Math.abs(multiPayersSum - parsedAmount) > 0.01 ? 'text-rose-600' : 'text-emerald-600'}>
                            Rs. {multiPayersSum.toFixed(2)}
                          </span>
                          <span className="text-slate-400">/ Rs. {parsedAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* For Whom */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="block text-xs font-bold text-slate-400 tracking-wider uppercase">For Whom?</label>
                    <span className="text-xs text-slate-500 font-medium">Split equally among selected members</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {group.members?.map(m => {
                      const isChecked = selectedParticipants.includes(m.user.id);
                      return (
                        <div 
                          key={m.user.id} 
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isChecked ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                          onClick={() => toggleParticipant(m.user.id)}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300'}`}>
                            {isChecked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className={`text-sm font-semibold truncate ${isChecked ? 'text-blue-900' : 'text-slate-700'}`}>
                            {m.user.id === currentUser.id ? 'You' : m.user.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-2 pt-3 border-t border-slate-100 text-center">
                    <span className="text-sm font-bold text-slate-900">
                      {selectedParticipants.length > 0 ? (
                        `Rs. ${(parsedAmount / selectedParticipants.length).toFixed(2)} / person`
                      ) : (
                        <span className="text-slate-400">No participants selected</span>
                      )}
                    </span>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors" 
                onClick={onClose}
                title="Cancel and go back"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="add-expense-form"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-95 flex items-center justify-center min-w-[120px]" 
              >
                {loading ? <Loader className="animate-spin" size={16} /> : (editExpense ? 'Save Changes' : 'Save Expense')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
