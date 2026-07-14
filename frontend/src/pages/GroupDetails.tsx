import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, Users, Receipt, CreditCard, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGroupDetails, getGroupBalances } from '../api/groups';
import { approveJoinRequest, rejectJoinRequest } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import type { Group } from '../types';
import ExpenseList from '../components/expenses/ExpenseList';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import SettleUpModal from '../components/settlements/SettleUpModal';
import './GroupDetails.css';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [copied, setCopied] = useState(false);
  
  // Modals State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState(0);

  const fetchDetails = async () => {
    try {
      const [groupData, balanceData] = await Promise.all([
        getGroupDetails(Number(groupId)),
        getGroupBalances(Number(groupId))
      ]);
      setGroup(groupData);
      setBalances(balanceData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchDetails();
  }, [groupId]);

  const copyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExpenseOrSettlementAdded = () => {
    setExpenseRefreshTrigger(prev => prev + 1);
    fetchDetails(); // Refetch balances too
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await approveJoinRequest(Number(groupId), requestId);
      fetchDetails();
    } catch (err) {
      console.error('Failed to approve request', err);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await rejectJoinRequest(Number(groupId), requestId);
      fetchDetails();
    } catch (err) {
      console.error('Failed to reject request', err);
    }
  };

  if (loading) {
    return (
      <div className="group-loading">
        <Loader className="spinner" size={40} />
      </div>
    );
  }

  if (!group || !user) {
    return <div className="error-message">Group not found</div>;
  }

  return (
    <div className="group-details-container">
      <div className="group-header-section">
        <button className="btn-back" onClick={() => navigate('/groups')}>
          <ArrowLeft size={20} /> Back to Groups
        </button>
        <div className="group-title-row">
          <div className="group-title-info">
            <div className="group-icon-large">
              {group.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1>{group.name}</h1>
              <div className="invite-code-pill" onClick={copyInviteCode} title="Click to copy invite code">
                Code: <strong>{group.inviteCode}</strong>
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
              </div>
            </div>
          </div>
          <div className="group-actions">
            <button className="btn-primary" onClick={() => setIsAddExpenseOpen(true)}>
              <Receipt size={18} /> Add Expense
            </button>
            <button className="btn-secondary" onClick={() => setIsSettleUpOpen(true)}>
              <CreditCard size={18} /> Settle Up
            </button>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <Receipt size={18} /> Expenses
          </button>
          <button 
            className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
          >
            <CreditCard size={18} /> Balances
          </button>
          <button 
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={18} /> Members
          </button>
        </div>
      </div>

      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'expenses' && (
            <motion.div 
              key="expenses"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <ExpenseList 
                groupId={group.id} 
                currentUser={user} 
                refreshTrigger={expenseRefreshTrigger} 
              />
            </motion.div>
          )}

          {activeTab === 'balances' && (
            <motion.div 
              key="balances"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              {balances?.simplified?.length > 0 ? (
                <div className="balances-list">
                  {balances.simplified.map((b: any, idx: number) => {
                    const fromUser = group.members?.find(m => m.user.id.toString() === b.from?.toString())?.user;
                    const toUser = group.members?.find(m => m.user.id.toString() === b.to?.toString())?.user;
                    
                    return (
                      <div key={idx} className="balance-item">
                        <span className="payer-name">{fromUser?.name || `User ${b.from}`}</span>
                        <span className="owes-text">owes</span>
                        <span className="payee-name">{toUser?.name || `User ${b.to}`}</span>
                        <span className="amount font-mono text-primary">Rs. {(b.amount / 100).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-tab">
                  <CreditCard size={40} />
                  <p>All settled up! No outstanding balances.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div 
              key="members"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              {group.members?.find(m => m.user.id === user?.id)?.role === 'ADMIN' && group.pendingRequests && group.pendingRequests.length > 0 && (
                <div className="pending-requests-section">
                  <h3>Pending Requests</h3>
                  <div className="members-list" style={{ marginBottom: '2rem' }}>
                    {group.pendingRequests.map((req) => (
                      <div key={req.id} className="member-item pending-item">
                        <div className="member-avatar">{req.user.name.charAt(0).toUpperCase()}</div>
                        <div className="member-info">
                          <h4>{req.user.name}</h4>
                          <p>{req.user.email}</p>
                        </div>
                        <div className="request-actions">
                          <button className="btn-approve" onClick={() => handleApproveRequest(req.id)}><Check size={16} /></button>
                          <button className="btn-reject" onClick={() => handleRejectRequest(req.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3>Group Members</h3>
                </div>
              )}

              <div className="members-list">
                {group.members?.map((member) => (
                  <div key={member.user.id} className="member-item">
                    <div className="member-avatar">{member.user.name.charAt(0).toUpperCase()}</div>
                    <div className="member-info">
                      <h4>{member.user.name}</h4>
                      <p>{member.user.email}</p>
                    </div>
                    <span className="member-role">{member.role}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        group={group}
        currentUser={user}
        onExpenseAdded={handleExpenseOrSettlementAdded}
      />

      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        group={group}
        currentUser={user}
        balances={balances}
        onSettlementAdded={handleExpenseOrSettlementAdded}
      />
    </div>
  );
}
