import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSettlement } from '../../api/settlements';
import { X, CreditCard, ArrowUpRight, Upload, Image as ImageIcon, CheckCircle2, Loader, Info, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Group, User } from '../../types';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  currentUser: User;
  onSettlementAdded: () => void;
  balances: any;
  initialPayeeId?: string;
  initialAmount?: string;
}

export default function SettleUpModal({ 
  isOpen, 
  onClose, 
  group, 
  currentUser, 
  onSettlementAdded, 
  balances,
  initialPayeeId,
  initialAmount
}: SettleUpModalProps) {
  const [payeeId, setPayeeId] = useState(initialPayeeId || '');
  const [amount, setAmount] = useState(initialAmount || '');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialPayeeId) setPayeeId(initialPayeeId);
      if (initialAmount) setAmount(initialAmount);
    }
  }, [isOpen, initialPayeeId, initialAmount]);

  // Find debts where current user is the debtor
  const oweList = balances?.simplified?.filter((b: any) => b.from?.toString() === currentUser.id.toString()) || [];
  
  // Group members other than current user
  const otherMembers = group.members?.filter(m => m.user.id !== currentUser.id) || [];

  const handleClose = () => {
    onClose();
    setPayeeId('');
    setAmount('');
    setScreenshot(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeId || !amount) {
      setError('Please select a recipient and enter a valid settlement amount.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('groupId', group.id.toString());
      formData.append('payeeId', payeeId);
      formData.append('amount', parsedAmount.toString());
      
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      await createSettlement(formData);
      onSettlementAdded();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  const prefillOwed = (owedAmount: number, toId: string) => {
    setAmount((owedAmount / 100).toFixed(2));
    setPayeeId(toId.toString());
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs font-['Plus_Jakarta_Sans',_sans-serif]"
          onClick={handleClose}
        >
          <motion.div 
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                  <CreditCard size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 truncate">Settle Up</h3>
                  <p className="text-xs text-slate-400 truncate">Record a payment within {group.name}</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="settle-up-form" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-slate-50/50 min-h-0">
                {error && (
                  <div className="text-rose-600 bg-rose-50 p-3.5 rounded-xl text-xs font-semibold border border-rose-100">
                    {error}
                  </div>
                )}

                {/* Suggested Quick Payments */}
                {oweList.length > 0 && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                      <ArrowUpRight size={14} className="text-blue-600" />
                      Quick Settle (You Owe)
                    </div>
                    <div className="space-y-2">
                      {oweList.map((b: any, idx: number) => {
                        const toUser = group.members?.find(m => m.user.id.toString() === b.to?.toString())?.user;
                        const isSelected = payeeId === b.to?.toString();
                        return (
                          <button 
                            key={idx}
                            type="button" 
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                            }`}
                            onClick={() => prefillOwed(b.amount, b.to)}
                          >
                            <span className="truncate pr-2">
                              Pay <strong className="font-bold">{toUser?.name || `User ${b.to}`}</strong>
                            </span>
                            <span className={`font-mono font-bold flex-shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                              Rs. {(b.amount / 100).toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Payee Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Pay To
                  </label>
                  <div className="relative">
                    <select 
                      value={payeeId} 
                      onChange={e => setPayeeId(e.target.value)} 
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                      required
                    >
                      <option value="" disabled>Select recipient</option>
                      {otherMembers.map(m => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.name} ({m.user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recipient's Payment Details (if available) */}
                {(() => {
                  const selectedMember = otherMembers.find(m => m.user.id.toString() === payeeId);
                  const pm = selectedMember?.user && (selectedMember.user as any).paymentMethod;
                  if (!pm) return null;
                  return (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          {selectedMember?.user?.name}'s Receiving Account
                        </span>
                        <p className="text-xs font-mono font-bold text-slate-800 mt-0.5 truncate">
                          {pm}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(pm);
                          toast.success('Account details copied');
                        }}
                        className="flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-blue-50 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  );
                })()}

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Amount (PKR)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-sm font-bold text-slate-400 pointer-events-none">
                      Rs.
                    </span>
                    <input 
                      type="number" 
                      step="1"
                      min="1"
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
                      required
                    />
                  </div>

                  {/* Round-Up Quick Buttons */}
                  {payeeId && parseFloat(amount) > 0 && (() => {
                    const exact = parseFloat(amount);
                    const roundTo10 = Math.ceil(exact / 10) * 10;
                    const roundTo50 = Math.ceil(exact / 50) * 50;
                    const roundTo100 = Math.ceil(exact / 100) * 100;
                    const options = [roundTo10, roundTo50, roundTo100].filter(
                      (val, idx, arr) => val > exact && arr.indexOf(val) === idx
                    );
                    if (options.length === 0) return null;
                    return (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Round up:</span>
                        {options.map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val.toString())}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              parseFloat(amount) === val
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            Rs. {val}
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Overpayment / Underpayment Notice */}
                  {payeeId && parseFloat(amount) > 0 && (() => {
                    const selectedDebt = oweList.find((b: any) => b.to?.toString() === payeeId);
                    if (!selectedDebt) return null;
                    const owedRupees = selectedDebt.amount / 100;
                    const enteredAmount = parseFloat(amount);
                    const diff = enteredAmount - owedRupees;
                    if (Math.abs(diff) < 0.01) return null;
                    if (diff > 0) {
                      return (
                        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 mt-2">
                          <p className="text-[11px] font-semibold text-blue-700 leading-relaxed">
                            You are paying Rs. {diff.toFixed(2)} more than the owed amount. 
                            The extra amount will be automatically credited to your balance — {
                              group.members?.find(m => m.user.id.toString() === payeeId)?.user?.name || 'they'
                            } will owe you Rs. {diff.toFixed(2)} back.
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 mt-2">
                          <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
                            Partial payment. You will still owe Rs. {Math.abs(diff).toFixed(2)} after this settlement.
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Receipt Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Payment Proof / Receipt <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  
                  {screenshot ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <ImageIcon size={18} className="text-emerald-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 truncate">{screenshot.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setScreenshot(null)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl cursor-pointer bg-white hover:bg-emerald-50/30 transition-all shadow-2xs">
                      <Upload size={20} className="text-slate-400 mb-1.5" />
                      <span className="text-xs font-semibold text-slate-600">Click to upload screenshot</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, JPEG up to 5MB</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setScreenshot(e.target.files?.[0] || null)} 
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Notice */}
                <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 flex items-start gap-2.5 shadow-2xs">
                  <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <strong className="font-semibold text-slate-700">Verification Required:</strong> Group balances will update automatically once the payee reviews and confirms receipt of this payment.
                  </p>
                </div>
              </div>

              {/* Sticky Pinned Footer Actions */}
              <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2.5 flex-shrink-0 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="settle-up-form"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Record Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
