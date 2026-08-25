import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Hash, Users, Loader, Calendar, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUserGroups, createGroup, joinGroup } from '../api/groups';
import { getDashboardStats } from '../api/users';
import type { Group } from '../types';

export default function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwes, setTotalOwes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [groupsData, statsData] = await Promise.all([
        getUserGroups(),
        getDashboardStats().catch(() => null)
      ]);
      setGroups(groupsData);
      if (statsData) {
        setTotalOwed(statsData.totalOwed || 0);
        setTotalOwes(statsData.totalOwes || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      const newGroup = await createGroup(newGroupName);
      toast.success('Group created successfully!');
      setGroups([...groups, newGroup]);
      setIsCreateModalOpen(false);
      setNewGroupName('');
      navigate(`/groups/${newGroup.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await joinGroup(inviteCode);
      toast.success('Join request sent! The admin has been alerted to approve.');
      setIsJoinModalOpen(false);
      setInviteCode('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setActionLoading(false);
    }
  };

  // Color palette for group avatars
  const avatarColors = [
    'from-blue-500 to-sky-400',
    'from-violet-500 to-purple-400',
    'from-emerald-500 to-teal-400',
    'from-amber-500 to-orange-400',
    'from-rose-500 to-pink-400',
    'from-indigo-500 to-blue-400',
  ];

  const getGroupColor = (index: number) => avatarColors[index % avatarColors.length];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Groups
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage shared expenses across {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button 
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Hash size={15} /> Join Group
          </button>
          <button 
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs font-bold transition-all hover:shadow-md active:scale-95 cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={15} /> New Group
          </button>
        </div>
      </section>

      {/* Financial Summary Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Active Groups</p>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {groups.length}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Expense sharing circles</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-2">You Are Owed</p>
          <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
            Rs. {(totalOwed / 100).toFixed(2)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Net receivables across groups</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-2">You Owe</p>
          <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
            Rs. {(totalOwes / 100).toFixed(2)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Net payables across groups</p>
        </div>
      </section>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
            <Users size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">No Groups Yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Create a new group or join an existing one using an invite code to start splitting expenses.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 hover:bg-slate-50"
            >
              Join with Code
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 text-xs"
            >
              Create Your First Group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => (
            <motion.div 
              key={group.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] p-5 cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group"
              onClick={() => navigate(`/groups/${group.id}`)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Group Header */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGroupColor(index)} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm`}>
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate leading-tight">{group.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                    <Calendar size={12} />
                    <span className="text-[11px] font-medium">{formatDate(group.createdAt)}</span>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-blue-600 transition-colors mt-0.5">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              {/* Group Meta */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500">
                    {(group as any).members?.length || '--'} members
                  </span>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  View Details
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
              initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-1">Create New Group</h2>
              <p className="text-xs text-slate-400 mb-5">Start a new expense-sharing circle with friends, roommates, or colleagues.</p>
              {error && <div className="bg-rose-50 text-rose-600 text-xs font-semibold p-3 rounded-xl mb-4 border border-rose-100">{error}</div>}
              <form onSubmit={handleCreateGroup}>
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    placeholder="e.g. Flat 204 Roommates"
                    required
                    maxLength={35}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-50 cursor-pointer" 
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setError('');
                      setNewGroupName('');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-70 cursor-pointer" disabled={actionLoading}>
                    {actionLoading ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isJoinModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsJoinModalOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
              initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-1">Join a Group</h2>
              <p className="text-xs text-slate-400 mb-5">Enter the invite code shared by the group admin to join their expense circle.</p>
              {error && <div className="bg-rose-50 text-rose-600 text-xs font-semibold p-3 rounded-xl mb-4 border border-rose-100">{error}</div>}
              <form onSubmit={handleJoinGroup}>
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Invite Code</label>
                  <input 
                    type="text" 
                    value={inviteCode} 
                    onChange={e => setInviteCode(e.target.value.toUpperCase())} 
                    placeholder="e.g. OSF3399C"
                    required
                    maxLength={10}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tracking-widest text-center"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-50" onClick={() => setIsJoinModalOpen(false)}>Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-70" disabled={actionLoading}>
                    {actionLoading ? 'Joining...' : 'Join Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
