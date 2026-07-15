import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExpenseDetails } from '../../api/expenses';
import './ExpenseDetailModal.css';
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
      <motion.div className="expense-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="expense-modal-content large" initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}>
          <div className="modal-header">
            <h2>Expense Details</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          {loading || !expense ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
          ) : (
            <div className="receipt-container">
              <div className="receipt-header">
                <div className="receipt-title">{expense.description}</div>
                <div className="receipt-amount font-mono">Rs. {(expense.totalAmount / 100).toFixed(2)}</div>
                <div className="receipt-date">{new Date(expense.createdAt).toLocaleString()}</div>
              </div>

              <div className="receipt-body">
                <div className="receipt-columns">
                  <div className="receipt-section">
                    <h4 className="receipt-section-title">PAID BY</h4>
                    <div className="receipt-list">
                      {expense.payers?.map((payer: any) => (
                        <div key={payer.id} className="receipt-row">
                          <div className="receipt-person">
                            <div className="receipt-avatar">{payer.user?.name.charAt(0).toUpperCase()}</div>
                            <span className="receipt-name">{payer.user?.name}</span>
                          </div>
                          <span className="receipt-row-amount font-mono">Rs. {(payer.amountPaid / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h4 className="receipt-section-title">SPLIT AMONG</h4>
                    <div className="receipt-list">
                      {expense.participants?.map((p: any) => {
                        const percentage = (p.shareAmount / expense.totalAmount) * 100;
                        return (
                          <div key={p.id} className="receipt-split-row">
                            <div className="receipt-row-main">
                              <div className="receipt-person">
                                <div className="receipt-avatar">{p.user?.name.charAt(0).toUpperCase()}</div>
                                <span className="receipt-name">{p.user?.name}</span>
                              </div>
                              <span className="receipt-row-amount font-mono">Rs. {(p.shareAmount / 100).toFixed(2)}</span>
                            </div>
                            <div className="receipt-progress-bg">
                              <div className="receipt-progress-fill" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {expense.editHistory && expense.editHistory.length > 0 && (
                <div className="receipt-audit">
                  <h4 className="receipt-section-title">AUDIT TRAIL</h4>
                  <div className="audit-list">
                    {expense.editHistory.map((history: any) => (
                      <div key={history.id} className="audit-item">
                        <div className="audit-time">{new Date(history.createdAt).toLocaleString()}</div>
                        <div className="audit-action">
                          <strong>{history.editedBy?.name || 'Unknown User'}</strong> made a <strong>{history.changeType}</strong> edit.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="receipt-actions">
                {group.members?.find((m: any) => m.user.id === currentUser.id) && (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      onClose();
                      onEditClick(expense);
                    }}
                  >
                    Edit Expense
                  </button>
                )}
                <button type="button" className="btn-primary" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
