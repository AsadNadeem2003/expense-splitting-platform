import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Hash, Users, ChevronRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserGroups, createGroup, joinGroup } from '../api/groups';
import { getDashboardStats } from '../api/users';
import type { Group } from '../types';

export default function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
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
      setIsJoinModalOpen(false);
      setInviteCode('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setActionLoading(false);
    }
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
      {/* ─── Header Section ─── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Groups
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You are in {groups.length} {groups.length === 1 ? 'group' : 'groups'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Hash size={16} /> Join Group
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-semibold transition-all hover:shadow-md active:scale-95"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} /> New Group
          </button>
        </div>
      </section>

      {/* ─── Top Balance Hero Card ─── */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_8px_30px_rgb(15,23,42,0.04)] border border-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Owed To You</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Rs. {(totalOwed / 100).toFixed(2)}
            </h2>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all hover:shadow-md active:scale-95">
            Settle Up
          </button>
        </div>
      </section>

      {/* ─── Dynamic Groups List ─── */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
            <Users size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">No Groups Yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Create a new group or join an existing one to start splitting expenses with friends.
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm transition-all active:scale-95 text-sm"
          >
            Create your first group
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] overflow-hidden">
          <div className="flex flex-col divide-y divide-slate-100">
            {groups.map((group) => (
              <motion.div 
                key={group.id} 
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-sm">
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">{group.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Created on {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-slate-300 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Modals ─── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
              initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Group</h2>
              {error && <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl mb-4 border border-rose-100">{error}</div>}
              <form onSubmit={handleCreateGroup}>
                <div className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    placeholder="E.g. Goa Trip 2026"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-70" disabled={actionLoading}>
                    {actionLoading ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isJoinModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
              initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">Join Group</h2>
              {error && <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl mb-4 border border-rose-100">{error}</div>}
              <form onSubmit={handleJoinGroup}>
                <div className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">Invite Code</label>
                  <input 
                    type="text" 
                    value={inviteCode} 
                    onChange={e => setInviteCode(e.target.value.toUpperCase())} 
                    placeholder="E.g. ROOM88"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors" onClick={() => setIsJoinModalOpen(false)}>Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-70" disabled={actionLoading}>
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
