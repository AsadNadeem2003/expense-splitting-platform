import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Hash, Users, ArrowRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserGroups, createGroup, joinGroup } from '../api/groups';
import type { Group } from '../types';
import './GroupsList.css';

export default function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const data = await getUserGroups();
      setGroups(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
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
      // It might be a pending request or immediate join depending on backend logic
      // But we refetch to be safe or show a message
      setIsJoinModalOpen(false);
      setInviteCode('');
      fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="groups-loading">
        <Loader className="spinner" size={40} />
      </div>
    );
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>Your Groups</h1>
        <div className="groups-actions">
          <button className="btn-secondary" onClick={() => setIsJoinModalOpen(true)}>
            <Hash size={18} /> Join Group
          </button>
          <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} /> New Group
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h2>No Groups Yet</h2>
          <p>Create a new group or join an existing one to start splitting expenses.</p>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <motion.div 
              key={group.id} 
              className="group-card"
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="group-card-icon">
                {group.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="group-card-content">
                <h3>{group.name}</h3>
                <p>Created on {new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
              <ArrowRight className="group-card-arrow" />
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
              <h2>Create New Group</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleCreateGroup}>
                <div className="input-group">
                  <label>Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    placeholder="E.g. Goa Trip 2026"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-text" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={actionLoading}>
                    {actionLoading ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isJoinModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
              <h2>Join Group</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleJoinGroup}>
                <div className="input-group">
                  <label>Invite Code</label>
                  <input 
                    type="text" 
                    value={inviteCode} 
                    onChange={e => setInviteCode(e.target.value.toUpperCase())} 
                    placeholder="E.g. ROOM88"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-text" onClick={() => setIsJoinModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={actionLoading}>
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
