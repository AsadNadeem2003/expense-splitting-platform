import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createExpense } from '../../api/expenses';
import type { Group, User } from '../../types';
import './AddExpenseModal.css';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  currentUser: User;
  onExpenseAdded: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, group, currentUser, onExpenseAdded }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState(currentUser.id.toString());
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedAmount = parseFloat(amount); // backend expects rupees
      const expenseData = {
        groupId: group.id,
        description,
        totalAmount: parsedAmount,
        paidById: parseInt(paidById, 10),
        participants: group.members?.map(m => ({
          userId: m.user.id,
          shareAmount: Number((parsedAmount / (group.members?.length || 1)).toFixed(2))
        }))
      };

      await createExpense(expenseData);
      onExpenseAdded();
      onClose();
      // Reset form
      setDescription('');
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="expense-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="expense-modal-content" initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}>
            <div className="modal-header">
              <h2>Add an Expense</h2>
              <button className="close-btn" onClick={onClose}>&times;</button>
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
                <label>Amount (Rs.)</label>
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

              <div className="input-group">
                <label>Paid by</label>
                <select value={paidById} onChange={e => setPaidById(e.target.value)}>
                  {group.members?.map(m => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.id === currentUser.id ? 'You' : m.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="split-summary">
                <p>Split <strong>Equally</strong> between {group.members?.length} people.</p>
                <p className="split-amount">
                  (Rs. {amount ? (parseFloat(amount) / (group.members?.length || 1)).toFixed(2) : '0.00'} / person)
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
