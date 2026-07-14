import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle, Loader, Receipt, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/users';
import type { DashboardStats } from '../api/users';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader className="spinner" size={40} />
      </div>
    );
  }

  return (
    <div className="dashboard animate-fade-in">
      <div className="stats-grid">
        <motion.div 
          className="glass-card stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon owes"><AlertCircle /></div>
          <div className="stat-info">
            <span className="text-sm text-secondary">You Owe</span>
            <h3 className="stat-value text-danger">Rs. {((stats?.totalOwes || 0) / 100).toFixed(2)}</h3>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon owed"><TrendingUp /></div>
          <div className="stat-info">
            <span className="text-sm text-secondary">You are Owed</span>
            <h3 className="stat-value text-success">Rs. {((stats?.totalOwed || 0) / 100).toFixed(2)}</h3>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon total"><Users /></div>
          <div className="stat-info">
            <span className="text-sm text-secondary">Total Balance</span>
            <h3 className={`stat-value ${stats?.totalBalance && stats.totalBalance >= 0 ? 'text-gradient' : 'text-danger'}`}>
              {stats?.totalBalance && stats.totalBalance > 0 ? '+' : ''} Rs. {((stats?.totalBalance || 0) / 100).toFixed(2)}
            </h3>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-content">
        <div className="glass-card recent-activity">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, idx) => (
                <div className="activity-item" key={activity.id || idx}>
                  <div className="activity-avatar">
                    {activity.type === 'EXPENSE' ? <Receipt size={16} /> : <CreditCard size={16} />}
                  </div>
                  <div className="activity-details">
                    <span className="activity-title">{activity.description}</span>
                    <span className="activity-group text-xs text-secondary">{activity.groupName} • {activity.actionText}</span>
                  </div>
                  <div className={`activity-amount ${activity.netImpact >= 0 ? 'positive' : 'negative'}`}>
                    {activity.netImpact >= 0 ? '+' : '-'} Rs. {(Math.abs(activity.netImpact) / 100).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary text-sm" style={{ padding: '1rem' }}>No recent activity. Create a group to get started!</p>
            )}
          </div>
        </div>

        <div className="glass-card quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/groups')}>
              <span className="action-icon">👥</span>
              <span>Groups</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/groups')}>
              <span className="action-icon">💸</span>
              <span>Settle Up</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/groups')}>
              <span className="action-icon">🧾</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
