import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSettlement } from '../../api/settlements';
import type { Group, User } from '../../types';
import './SettleUpModal.css';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  currentUser: User;
  onSettlementAdded: () => void;
  balances: any; // We'll pass down the balances to know who owes whom
}

export default function SettleUpModal({ isOpen, onClose, group, currentUser, onSettlementAdded, balances }: SettleUpModalProps) {
  const [payeeId, setPayeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Find people the current user owes
  const oweList = balances?.simplified?.filter((b: any) => b.from === currentUser.id.toString()) || [];
  
  // Find users in the group that aren't the current user to allow paying anyone
  const otherMembers = group.members?.filter(m => m.user.id !== currentUser.id) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeId || !amount) {
      setError('Please select a person and enter an amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedAmount = parseFloat(amount); // backend expects rupees
      
      const formData = new FormData();
      formData.append('groupId', group.id.toString());
      formData.append('payeeId', payeeId);
      formData.append('amount', parsedAmount.toString());
      
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      await createSettlement(formData);
      onSettlementAdded();
      onClose();
      // Reset
      setPayeeId('');
      setAmount('');
      setScreenshot(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  const prefillOwed = (owedAmount: number, toId: string) => {
    setAmount((owedAmount / 100).toFixed(2));
    setPayeeId(toId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="settle-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="settle-modal-content" initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}>
            <div className="modal-header">
              <h2>Settle Up</h2>
              <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}

            {oweList.length > 0 && (
              <div className="suggested-payments">
                <p>You owe:</p>
                {oweList.map((b: any, idx: number) => {
                  const toUser = group.members?.find(m => m.user.id.toString() === b.to?.toString())?.user;
                  return (
                    <button 
                      key={idx}
                      type="button" 
                      className="suggested-payment-btn"
                      onClick={() => prefillOwed(b.amount, b.to)}
                    >
                      Pay {toUser?.name || `User ${b.to}`} <strong>Rs. {(b.amount / 100).toFixed(2)}</strong>
                    </button>
                  );
                })}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Pay To</label>
                <select value={payeeId} onChange={e => setPayeeId(e.target.value)} required>
                  <option value="" disabled>Select a person</option>
                  {otherMembers.map(m => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group amount-group">
                <label>Amount (Rs.)</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">Rs.</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Screenshot / Receipt (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setScreenshot(e.target.files?.[0] || null)} 
                  className="file-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
