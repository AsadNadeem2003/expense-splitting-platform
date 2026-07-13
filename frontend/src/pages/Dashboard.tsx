import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
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
            <h3 className="stat-value text-danger">₹2,450.00</h3>
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
            <h3 className="stat-value text-success">₹4,120.00</h3>
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
            <h3 className="stat-value text-gradient">+ ₹1,670.00</h3>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-content">
        <div className="glass-card recent-activity">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-avatar">🍕</div>
              <div className="activity-details">
                <span className="activity-title">Dinner at Luigi's</span>
                <span className="activity-group text-xs text-secondary">Goa Trip 2026</span>
              </div>
              <div className="activity-amount negative">- ₹450.00</div>
            </div>
            
            <div className="activity-item">
              <div className="activity-avatar">🚕</div>
              <div className="activity-details">
                <span className="activity-title">Uber to Airport</span>
                <span className="activity-group text-xs text-secondary">Roommates</span>
              </div>
              <div className="activity-amount positive">+ ₹200.00</div>
            </div>
          </div>
        </div>

        <div className="glass-card quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn">
              <span className="action-icon">💸</span>
              <span>Settle Up</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">👥</span>
              <span>New Group</span>
            </button>
            <button className="action-btn">
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
