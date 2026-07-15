import { useEffect, useState } from 'react';
import { getGroupExpenses } from '../../api/expenses';
import type { Expense, User } from '../../types';
import { Receipt } from 'lucide-react';
import './ExpenseList.css';

interface ExpenseListProps {
  groupId: number;
  currentUser: User;
  refreshTrigger: number;
  onExpenseClick: (expenseId: number) => void;
}

export default function ExpenseList({ groupId, currentUser, refreshTrigger, onExpenseClick }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getGroupExpenses(groupId);
        setExpenses(data);
      } catch (err) {
        console.error('Failed to fetch expenses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [groupId, refreshTrigger]);

  if (loading) {
    return <div className="p-4 text-center">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="empty-tab">
        <Receipt size={40} />
        <p>No expenses yet. Click "Add Expense" to start.</p>
      </div>
    );
  }

  return (
    <div className="expenses-feed">
      {expenses.map(expense => {
        const isPayer = expense.paidById === currentUser.id;
        const myShare = expense.participants?.find(p => p.user.id === currentUser.id)?.shareAmount || 0;
        
        return (
          <div key={expense.id} className="expense-item clickable" onClick={() => onExpenseClick(expense.id)} style={{ cursor: 'pointer' }}>
            <div className="expense-date">
              <span className="month">{new Date(expense.createdAt).toLocaleDateString('en-US', { month: 'short' })}</span>
              <span className="day">{new Date(expense.createdAt).getDate()}</span>
            </div>
            
            <div className="expense-icon">
              <Receipt size={20} />
            </div>
            
            <div className="expense-details">
              <h4>{expense.description}</h4>
              <p>
                {isPayer ? 'You' : expense.paidBy?.name} paid <span className="font-mono font-semibold">Rs. {(expense.totalAmount / 100).toFixed(2)}</span>
              </p>
            </div>
            
            <div className={`expense-user-share ${isPayer ? 'lent' : 'borrowed'}`}>
              <p className="share-label">{isPayer ? 'You lent' : 'You borrowed'}</p>
              <p className="share-amount font-mono">
                {isPayer 
                  ? `Rs. ${((expense.totalAmount - myShare) / 100).toFixed(2)}` 
                  : `Rs. ${(myShare / 100).toFixed(2)}`
                }
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
