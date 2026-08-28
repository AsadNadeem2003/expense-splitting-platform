import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserGroups, getGroupDetails } from '../../api/groups';
import { createExpense } from '../../api/expenses';
import type { Group, User } from '../../types';

interface GlobalAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onExpenseAdded?: () => void;
}

export const GlobalAddExpenseModal: React.FC<GlobalAddExpenseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onExpenseAdded
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerMode, setPayerMode] = useState<'single' | 'multiple'>('single');
  const [singlePayerId, setSinglePayerId] = useState<string>('');
  const [multiPayers, setMultiPayers] = useState<Record<number, string>>({});
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch groups on open
  useEffect(() => {
    if (isOpen) {
      const fetchGroups = async () => {
        try {
          setLoadingGroups(true);
          const list = await getUserGroups();
          setGroups(list);
          if (list.length > 0) {
            setSelectedGroupId(list[0].id);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingGroups(false);
        }
      };
      fetchGroups();
      setDescription('');
      setAmount('');
      setPayerMode('single');
      setError('');
    }
  }, [isOpen]);

  // Fetch group details when selectedGroupId changes
  useEffect(() => {
    if (selectedGroupId) {
      const fetchDetails = async () => {
        try {
          const details = await getGroupDetails(selectedGroupId);
          setGroupDetails(details);
          if (details?.members) {
            setSelectedParticipants(details.members.map(m => m.user.id));
            if (currentUser) {
              setSinglePayerId(currentUser.id.toString());
            } else if (details.members.length > 0) {
              setSinglePayerId(details.members[0].user.id.toString());
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchDetails();
    }
  }, [selectedGroupId, currentUser]);

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
    if (!selectedGroupId) {
      setError('Please select a group.');
      return;
    }
    if (!description.trim() || parsedAmount <= 0) {
      setError('Please provide a valid description and amount.');
      return;
    }
    if (selectedParticipants.length === 0) {
      setError('Select at least one participant.');
      return;
    }

    let payersPayload: { userId: number, amountPaid: number }[] = [];
    if (payerMode === 'single') {
      payersPayload = [{ userId: parseInt(singlePayerId, 10), amountPaid: parsedAmount }];
    } else {
      if (Math.abs(multiPayersSum - parsedAmount) > 0.01) {
        setError(`Payer amounts sum (Rs. ${multiPayersSum.toFixed(2)}) must equal total amount (Rs. ${parsedAmount.toFixed(2)})`);
        return;
      }
      payersPayload = Object.entries(multiPayers)
        .filter(([_, val]) => parseFloat(val) > 0)
        .map(([userId, val]) => ({ userId: parseInt(userId, 10), amountPaid: parseFloat(val) }));
    }

    const share = parsedAmount / selectedParticipants.length;
    const participantsPayload = selectedParticipants.map(id => ({ userId: id, shareAmount: share }));

    try {
      setSubmitting(true);
      setError('');
      await createExpense({
        groupId: selectedGroupId,
        description: description.trim(),
        totalAmount: parsedAmount,
        splitType: 'EQUAL',
        payers: payersPayload,
        participants: participantsPayload,
      });

      toast.success('Expense added successfully');
      if (onExpenseAdded) onExpenseAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs font-['Plus_Jakarta_Sans',_sans-serif]"
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] sm:max-h-[90vh]"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                <Receipt size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900 truncate">Add New Expense</h3>
                <p className="text-xs text-slate-400 truncate">Record a shared expense across your groups</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Form with Scrollable Body and Sticky Pinned Footer */}
          {loadingGroups ? (
            <div className="py-16 flex justify-center text-slate-400 flex-1">
              <Loader size={28} className="animate-spin text-blue-600" />
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm p-6 flex-1">
              No active groups found. Please create or join a group first.
            </div>
          ) : (
            <form id="global-add-expense-form" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-slate-50/50 min-h-0">
                {error && (
                  <div className="text-rose-600 bg-rose-50 p-3.5 rounded-xl text-xs font-semibold border border-rose-100">
                    {error}
                  </div>
                )}

                {/* Select Group */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Group
                  </label>
                  <select
                    value={selectedGroupId || ''}
                    onChange={e => setSelectedGroupId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Dinner, Groceries, Uber, etc."
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Total Amount (PKR)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-sm font-bold text-slate-400 pointer-events-none">
                      Rs.
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Paid By Mode Selection */}
                {groupDetails && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Paid By
                      </label>
                      <button
                        type="button"
                        onClick={() => setPayerMode(prev => prev === 'single' ? 'multiple' : 'single')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        {payerMode === 'multiple' ? '← Single Payer' : 'Multiple Payers?'}
                      </button>
                    </div>

                    {payerMode === 'single' ? (
                      <select
                        value={singlePayerId || ''}
                        onChange={e => setSinglePayerId(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                      >
                        {groupDetails.members?.map(m => (
                          <option key={m.user.id} value={m.user.id.toString()}>
                            {m.user.name} {m.user.id === currentUser?.id ? '(You)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
                        {groupDetails.members?.map(m => (
                          <div key={m.user.id} className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {m.user.name} {m.user.id === currentUser?.id ? '(You)' : ''}
                            </span>
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                                Rs.
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={multiPayers[m.user.id] || ''}
                                onChange={e => handleMultiPayerChange(m.user.id, e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Split With Participants */}
                {groupDetails && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Split With ({selectedParticipants.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedParticipants(groupDetails.members?.map(m => m.user.id) || [])}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Select All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {groupDetails.members?.map(m => {
                        const isChecked = selectedParticipants.includes(m.user.id);
                        return (
                          <button
                            key={m.user.id}
                            type="button"
                            onClick={() => toggleParticipant(m.user.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50/80 border-blue-200 text-blue-700 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center text-white ${
                              isChecked ? 'bg-blue-600' : 'border border-slate-300'
                            }`}>
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </div>
                            <span className="truncate">{m.user.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Pinned Footer Submit */}
              <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2.5 flex-shrink-0 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="global-add-expense-form"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Adding...
                    </>
                  ) : (
                    <>Save Expense</>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalAddExpenseModal;
