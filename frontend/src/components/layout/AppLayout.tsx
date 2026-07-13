import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from 'lucide-react';
import './AppLayout.css';

const AppLayout = () => {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">SE</div>
            <h1 className="logo-text text-gradient">SplitEase</h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/groups" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Groups</span>
          </NavLink>
          <NavLink to="/activity" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard size={20} />
            <span>Activity</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">U</div>
            <div className="user-info">
              <span className="user-name">User Name</span>
              <span className="user-email text-xs text-muted">user@example.com</span>
            </div>
          </div>
          <button className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h2 className="page-title">Dashboard</h2>
          <div className="topbar-actions">
            <button className="btn btn-primary text-sm">+ New Expense</button>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
