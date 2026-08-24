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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Plus_Jakarta_Sans',_sans-serif]"
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Receipt size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Expense</h3>
                <p className="text-xs text-slate-400">Record a shared expense across your groups</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            {error && (
              <div className="text-rose-600 bg-rose-50 p-3.5 rounded-xl text-xs font-semibold border border-rose-100">
                {error}
              </div>
            )}

            {loadingGroups ? (
              <div className="py-10 flex justify-center text-slate-400">
                <Loader size={24} className="animate-spin text-blue-600" />
              </div>
            ) : groups.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No active groups found. Please create or join a group first.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Group */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Group
                  </label>
                  <select
                    value={selectedGroupId || ''}
                    onChange={e => setSelectedGroupId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
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
                    placeholder="e.g. Dinner, Groceries, Utilities"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={100}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Amount (PKR)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-sm font-bold text-slate-400 pointer-events-none">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Payers Selection */}
                {groupDetails?.members && groupDetails.members.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Paid By
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPayerMode('single')}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                            payerMode === 'single' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Single
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayerMode('multiple')}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                            payerMode === 'multiple' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Multiple
                        </button>
                      </div>
                    </div>

                    {payerMode === 'single' ? (
                      <select
                        value={singlePayerId}
                        onChange={e => setSinglePayerId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        {groupDetails.members.map(m => (
                          <option key={m.user.id} value={m.user.id}>
                            {m.user.name} {m.user.id === currentUser?.id ? '(You)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {groupDetails.members.map(m => (
                          <div key={m.user.id} className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold text-slate-700 truncate">{m.user.name}</span>
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-2 text-[11px] font-bold text-slate-400">Rs.</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={multiPayers[m.user.id] || ''}
                                onChange={e => handleMultiPayerChange(m.user.id, e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs font-mono font-bold"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Split Participants */}
                {groupDetails?.members && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Split Between ({selectedParticipants.length} people)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {groupDetails.members.map(m => {
                        const isChecked = selectedParticipants.includes(m.user.id);
                        return (
                          <button
                            key={m.user.id}
                            type="button"
                            onClick={() => toggleParticipant(m.user.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              isChecked
                                ? 'bg-blue-50/80 border-blue-200 text-blue-700'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
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

                {/* Footer Submit */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalAddExpenseModal;
