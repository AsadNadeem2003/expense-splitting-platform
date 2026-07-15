import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createExpense, updateExpense } from '../../api/expenses';
import type { Group, User, Expense } from '../../types';
import './AddExpenseModal.css';

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
        <motion.div className="expense-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="expense-modal-content large" initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}>
            <div className="modal-header">
              <h2>{editExpense ? 'Edit Expense' : 'Add an Expense'}</h2>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="e.g. Dinner at Luigi's"
                  required
                />
              </div>

              <div className="input-group amount-group">
                <label>Total Amount (Rs.)</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">Rs.</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="payers-section">
                <div className="section-header-flex">
                  <label>Who paid?</label>
                  <div className="mode-toggle">
                    <button type="button" className={`toggle-btn ${payerMode === 'single' ? 'active' : ''}`} onClick={() => setPayerMode('single')}>Single Payer</button>
                    <button type="button" className={`toggle-btn ${payerMode === 'multiple' ? 'active' : ''}`} onClick={() => setPayerMode('multiple')}>Multiple Payers</button>
                  </div>
                </div>

                {payerMode === 'single' ? (
                  <select value={singlePayerId} onChange={e => setSinglePayerId(e.target.value)}>
                    {group.members?.map(m => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.id === currentUser.id ? 'You' : m.user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="multi-payer-list">
                    {group.members?.map(m => (
                      <div key={m.user.id} className="multi-payer-row">
                        <span>{m.user.id === currentUser.id ? 'You' : m.user.name}</span>
                        <div className="small-amount-input">
                          <span>Rs.</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00"
                            value={multiPayers[m.user.id] || ''}
                            onChange={(e) => handleMultiPayerChange(m.user.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="multi-payer-summary">
                      Sum: Rs. {multiPayersSum.toFixed(2)} / {parsedAmount.toFixed(2)}
                      {Math.abs(multiPayersSum - parsedAmount) > 0.01 && (
                        <span className="text-red-400 text-sm ml-2">(Mismatch)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="participants-section mt-4">
                <label>For Whom? (Split equally among checked)</label>
                <div className="participants-grid">
                  {group.members?.map(m => (
                    <label key={m.user.id} className="participant-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedParticipants.includes(m.user.id)}
                        onChange={() => toggleParticipant(m.user.id)}
                      />
                      <span className="checkmark"></span>
                      {m.user.id === currentUser.id ? 'You' : m.user.name}
                    </label>
                  ))}
                </div>
                <div className="split-summary">
                  <p className="split-amount">
                    {selectedParticipants.length > 0 ? (
                      `Rs. ${(parsedAmount / selectedParticipants.length).toFixed(2)} / person`
                    ) : (
                      'No participants selected'
                    )}
                  </p>
                </div>
              </div>

              <div className="modal-actions mt-6">
                <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Saving...' : editExpense ? 'Save Changes' : 'Save Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
