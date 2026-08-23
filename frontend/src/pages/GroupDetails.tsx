import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, Users, Receipt, CreditCard, Copy, Check, Bell, UserPlus, X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGroupDetails, getGroupBalances } from '../api/groups';
import { approveJoinRequest, rejectJoinRequest, inviteUser, removeMember, leaveGroup } from '../api/groups';
import { getGroupSettlements, confirmSettlement, rejectSettlement, sendReminder } from '../api/settlements';
import { searchUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import type { Group } from '../types';
import ExpenseList from '../components/expenses/ExpenseList';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import SettleUpModal from '../components/settlements/SettleUpModal';
import ExpenseDetailModal from '../components/expenses/ExpenseDetailModal';
import './GroupDetails.css';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [balances, setBalances] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [copied, setCopied] = useState(false);
  
  // Modals State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [isExpenseDetailOpen, setIsExpenseDetailOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [editExpenseData, setEditExpenseData] = useState<any>(null);
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState(0);
  const [sendingReminderId, setSendingReminderId] = useState<number | null>(null);

  // Invite Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const fetchDetails = async () => {
    try {
      const [groupData, balanceData, settlementsData] = await Promise.all([
        getGroupDetails(Number(groupId)),
        getGroupBalances(Number(groupId)),
        getGroupSettlements(Number(groupId))
      ]);
      setGroup(groupData);
      setBalances(balanceData);
      setSettlements(settlementsData);
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

  const copyInviteLink = () => {
    if (group?.inviteCode) {
      const link = `${window.location.origin}/login?inviteCode=${group.inviteCode}`;
      navigator.clipboard.writeText(link);
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

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMember(Number(groupId), userId);
      toast.success('Member removed successfully');
      fetchDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await leaveGroup(Number(groupId));
      toast.success('Left group successfully');
      navigate('/groups');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleConfirmSettlement = async (settlementId: number) => {
    try {
      await confirmSettlement(settlementId);
      toast.success('Settlement confirmed!');
      fetchDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm settlement');
    }
  };

  const handleRejectSettlement = async (settlementId: number) => {
    if (!window.confirm("Are you sure you want to reject this settlement?")) return;
    try {
      await rejectSettlement(settlementId);
      toast.success('Settlement rejected');
      fetchDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject settlement');
    }
  };

  const handleSendReminder = async (debtorId: number, debtorName: string) => {
    setSendingReminderId(debtorId);
    try {
      await sendReminder(Number(groupId), debtorId);
      toast.success(`Reminder email sent to ${debtorName}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reminder email');
    } finally {
      setSendingReminderId(null);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery.trim());
        // filter out existing members
        const filtered = results.filter((u: any) => !group?.members?.some(m => m.user.id === u.id));
        setSearchResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, group]);

  const handleInviteUser = async (email: string) => {
    try {
      setInviteError('');
      setInviteSuccess('');
      await inviteUser(Number(groupId), email);
      setInviteSuccess('User added successfully!');
      setSearchQuery('');
      setSearchResults([]);
      fetchDetails();
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to add user');
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
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]" 
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Receipt size={16} /> Add Expense
            </button>
            <button 
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]" 
              onClick={() => setIsSettleUpOpen(true)}
            >
              <CreditCard size={16} /> Settle Up
            </button>
          </div>
        </div>
      </div>

      {/* Global Pending Settlements Section */}
      {settlements.filter(s => s.status === 'AWAITING_VERIFICATION').length > 0 && (
        <div className="mb-6 p-5 bg-amber-50/80 border border-amber-200/90 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-900 font-bold text-sm sm:text-base flex items-center gap-2">
              <CreditCard size={18} className="text-amber-600" /> Pending Settlements Awaiting Verification
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100/90 text-amber-800 px-3 py-1 rounded-full">
              {settlements.filter(s => s.status === 'AWAITING_VERIFICATION').length} Pending
            </span>
          </div>
          <div className="space-y-3">
            {settlements.filter(s => s.status === 'AWAITING_VERIFICATION').map((s) => (
              <div key={s.id} className="bg-white border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-semibold text-slate-800 break-words leading-relaxed">
                    <span className="font-bold text-slate-900 break-all">{s.payer.name}</span> paid{' '}
                    <span className="font-bold text-slate-900 break-all">{s.payee.name}</span>{' '}
                    <span className="font-mono text-emerald-600 font-bold ml-1">Rs. {(s.amount / 100).toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                  {s.screenshotUrl && (
                    <a href={`http://localhost:4000${s.screenshotUrl}`} target="_blank" rel="noreferrer" className="inline-block mt-2">
                      <img 
                        src={`http://localhost:4000${s.screenshotUrl}`} 
                        alt="Payment Screenshot" 
                        className="max-h-24 rounded-lg border border-slate-200 object-cover hover:opacity-90 transition-opacity" 
                        title="Click to view full size"
                      />
                    </a>
                  )}
                </div>
                
                {s.payee.id?.toString() === user?.id?.toString() ? (
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5" 
                      onClick={() => handleConfirmSettlement(s.id)}
                    >
                      <Check size={14} /> Confirm
                    </button>
                    <button 
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95" 
                      onClick={() => handleRejectSettlement(s.id)}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-xl self-start sm:self-auto break-words">
                    Awaiting <span className="font-bold break-all">{s.payee.name}</span>'s verification
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                onExpenseClick={(id) => {
                  setSelectedExpenseId(id);
                  setIsExpenseDetailOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'balances' && (
            <motion.div 
              key="balances"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              {balances?.simplified?.length > 0 ? (
                <div className="balances-list-pro">
                  {balances.simplified.map((b: any, idx: number) => {
                    const fromUser = group.members?.find(m => m.user.id.toString() === b.from?.toString())?.user;
                    const toUser = group.members?.find(m => m.user.id.toString() === b.to?.toString())?.user;
                    const amount = (b.amount / 100).toFixed(2);
                    const isCurrentUserOwes = user?.id?.toString() === b.from?.toString();
                    const isCurrentUserOwed = user?.id?.toString() === b.to?.toString();
                    
                    return (
                      <div key={idx} className={`balance-card-pro ${isCurrentUserOwes ? 'highlight-owe' : ''}`}>
                        <div className="balance-person">
                          <div className="balance-avatar from-avatar">
                            {fromUser?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="balance-name break-words break-all max-w-[120px]">{fromUser?.name || `User ${b.from}`}</span>
                        </div>
                        
                        <div className="balance-connection">
                          <div className="balance-amount font-mono">Rs. {amount}</div>
                          <div className="balance-line"></div>
                          <span className="balance-label">owes</span>
                        </div>

                        <div className="balance-person">
                          <div className="balance-avatar to-avatar">
                            {toUser?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="balance-name break-words break-all max-w-[120px]">{toUser?.name || `User ${b.to}`}</span>
                        </div>
                        
                        {isCurrentUserOwes && (
                          <div className="balance-action">
                            <button 
                              className="btn-primary settle-btn-pro" 
                              onClick={() => setIsSettleUpOpen(true)}
                            >
                              Settle
                            </button>
                          </div>
                        )}

                        {isCurrentUserOwed && (
                          <div className="balance-action">
                            <button 
                              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50" 
                              onClick={() => handleSendReminder(b.from, fromUser?.name || 'Member')}
                              disabled={sendingReminderId === b.from}
                            >
                              <Bell size={14} className="text-amber-600" />
                              {sendingReminderId === b.from ? 'Sending...' : 'Remind'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-tab-pro">
                  <div className="empty-avatar-circle">✓</div>
                  <h3>All settled up</h3>
                  <p>There are no outstanding balances in this group.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div 
              key="members"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6 pb-20"
            >
              {/* Admin Pending Requests */}
              {group.members?.find(m => m.user.id === user?.id)?.role === 'ADMIN' && group.pendingRequests && group.pendingRequests.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Requests</h3>
                  <div className="flex flex-col gap-3">
                    {group.pendingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white text-amber-600 font-bold flex items-center justify-center border border-amber-200 shadow-sm">
                            {req.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{req.user.name}</h4>
                            <p className="text-xs text-slate-500">{req.user.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveRequest(req.id)} className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleRejectRequest(req.id)} className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Group Members */}
              {group.members?.some(m => m.user.id === user?.id) && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Active Members ({group.members?.length})</h3>
                      <p className="text-xs text-slate-400">People currently in this group</p>
                    </div>
                    {group.members?.find(m => m.user.id === user?.id)?.role === 'ADMIN' && (
                      <button 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
                      >
                        <UserPlus size={15} /> Invite Member
                      </button>
                    )}
                  </div>
                <div className="flex flex-col gap-3">
                  {group.members?.map((member) => (
                    <div key={member.user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200 gap-4 sm:gap-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white text-slate-600 font-bold flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {member.user.name} {member.user.id === user?.id && <span className="text-blue-500 ml-1">(You)</span>}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                          {member.role}
                        </span>
                        {group.members?.find(m => m.user.id === user?.id)?.role === 'ADMIN' && member.user.id !== user?.id && (
                          <button 
                            onClick={() => handleRemoveMember(member.user.id)}
                            className="text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                          >
                            Remove
                          </button>
                        )}
                        {member.user.id === user?.id && (
                          <button 
                            onClick={handleLeaveGroup}
                            className="text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                          >
                            Leave Group
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Former Members */}
              {(group as any).formerMembers && (group as any).formerMembers.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm opacity-80">
                  <h3 className="text-lg font-bold text-slate-400 mb-4">Former Members</h3>
                  <div className="flex flex-col gap-3">
                    {(group as any).formerMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center border border-slate-200 flex-shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-500">{member.name}</h4>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          Left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditExpenseData(null);
        }}
        group={group}
        currentUser={user}
        onExpenseAdded={handleExpenseOrSettlementAdded}
        editExpense={editExpenseData}
      />

      <ExpenseDetailModal
        isOpen={isExpenseDetailOpen}
        onClose={() => setIsExpenseDetailOpen(false)}
        expenseId={selectedExpenseId}
        group={group}
        currentUser={user}
        onEditClick={(expenseData) => {
          setEditExpenseData(expenseData);
          setIsAddExpenseOpen(true);
        }}
        onDeleteComplete={() => {
          setIsExpenseDetailOpen(false);
          handleExpenseOrSettlementAdded();
        }}
      />

      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        group={group}
        currentUser={user}
        balances={balances}
        onSettlementAdded={handleExpenseOrSettlementAdded}
      />

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          onClick={() => {
            setIsInviteModalOpen(false);
            setSearchQuery('');
            setSearchResults([]);
            setInviteError('');
            setInviteSuccess('');
          }}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Invite Members</h3>
                  <p className="text-xs text-slate-400">Add people to {group.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setInviteError('');
                  setInviteSuccess('');
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {inviteError && (
                <div className="text-rose-600 bg-rose-50 p-3.5 rounded-xl text-xs font-semibold border border-rose-100">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="text-emerald-600 bg-emerald-50 p-3.5 rounded-xl text-xs font-semibold border border-emerald-100">
                  {inviteSuccess}
                </div>
              )}

              {/* Search Registered Users */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Search Registered Users
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    autoFocus
                  />
                  {searching && (
                    <div className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                      Searching...
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-3 bg-white rounded-2xl border border-slate-100 shadow-md divide-y divide-slate-100 max-h-52 overflow-y-auto">
                    {searchResults.map(u => (
                      <div key={u.id} className="flex justify-between items-center p-3.5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{u.name}</div>
                            <div className="text-xs text-slate-400 truncate">{u.email}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleInviteUser(u.email)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length > 0 && !searching && searchResults.length === 0 && (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    No matching users found. Share the link below to invite them!
                  </p>
                )}
              </div>

              {/* Share Code & Link */}
              <div className="pt-5 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Share Group Invite Code
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-slate-800 tracking-wider">
                    {group.inviteCode}
                  </div>
                  <button 
                    onClick={copyInviteCode}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <button 
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                  onClick={copyInviteLink}
                >
                  <Mail size={14} />
                  {copied ? 'Link Copied!' : 'Copy Direct Invite Link'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setInviteError('');
                  setInviteSuccess('');
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
