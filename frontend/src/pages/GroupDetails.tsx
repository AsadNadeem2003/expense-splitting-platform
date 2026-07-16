import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, Users, Receipt, CreditCard, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGroupDetails, getGroupBalances } from '../api/groups';
import { approveJoinRequest, rejectJoinRequest, inviteUser, removeMember, leaveGroup } from '../api/groups';
import { getGroupSettlements, confirmSettlement, rejectSettlement } from '../api/settlements';
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
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [editExpenseData, setEditExpenseData] = useState<any>(null);
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState(0);

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery);
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
        <div className="pending-settlements-section" style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, color: 'orange', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <CreditCard size={18} /> Pending Settlements Awaiting Verification
          </h3>
          <div className="settlements-list">
            {settlements.filter(s => s.status === 'AWAITING_VERIFICATION').map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <div>
                  <strong>{s.payer.name}</strong> paid <strong>{s.payee.name}</strong> 
                  <span className="font-mono text-primary" style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>Rs. {(s.amount / 100).toFixed(2)}</span>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.25rem' }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                  {s.screenshotUrl && (
                    <a href={`http://localhost:4000${s.screenshotUrl}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '0.75rem' }}>
                      <img 
                        src={`http://localhost:4000${s.screenshotUrl}`} 
                        alt="Payment Screenshot" 
                        style={{ maxHeight: '120px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover' }} 
                        title="Click to view full size"
                      />
                    </a>
                  )}
                </div>
                
                {s.payee.id?.toString() === user?.id?.toString() ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleConfirmSettlement(s.id)}>Confirm</button>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleRejectSettlement(s.id)}>Reject</button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'orange', fontStyle: 'italic' }}>
                    Awaiting {s.payee.name}'s verification
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
                    
                    return (
                      <div key={idx} className={`balance-card-pro ${isCurrentUserOwes ? 'highlight-owe' : ''}`}>
                        <div className="balance-person">
                          <div className="balance-avatar from-avatar">
                            {fromUser?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="balance-name">{fromUser?.name || `User ${b.from}`}</span>
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
                          <span className="balance-name">{toUser?.name || `User ${b.to}`}</span>
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

              {/* Admin Invite Section */}
              {group.members?.find(m => m.user.id === user?.id)?.role === 'ADMIN' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Invite New Members</h3>
                  
                  {inviteError && <div className="text-rose-500 bg-rose-50 p-3 rounded-xl text-sm font-medium mb-4 border border-rose-100">{inviteError}</div>}
                  {inviteSuccess && <div className="text-emerald-500 bg-emerald-50 p-3 rounded-xl text-sm font-medium mb-4 border border-emerald-100">{inviteSuccess}</div>}
                  
                  <div className="flex flex-col gap-2 relative">
                    <input 
                      type="text" 
                      placeholder="Search by name or email..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    
                    {searching && <div className="text-sm text-slate-400 mt-1">Searching...</div>}
                    
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                        {searchResults.map(u => (
                          <div key={u.id} className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                            <div>
                              <div className="text-sm font-bold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </div>
                            <button 
                              onClick={() => handleInviteUser(u.email)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery.length > 0 && !searching && searchResults.length === 0 && (
                      <div className="text-sm text-slate-400 mt-1">No matching registered users found.</div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">User not registered?</h4>
                    <p className="text-xs text-slate-500 mb-3">Copy and share this link for them to register and join automatically.</p>
                    <button 
                      className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
                      onClick={copyInviteLink}
                    >
                      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      {copied ? 'Link Copied!' : 'Copy Invite Link'}
                    </button>
                  </div>
                </div>
              )}

              {/* Active Group Members */}
              {group.members?.some(m => m.user.id === user?.id) && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Active Members ({group.members?.length})</h3>
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
