import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Plus, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPopover from './NotificationsPopover';
import GlobalAddExpenseModal from '../expenses/GlobalAddExpenseModal';
import { AlgorithmExplainerModal } from '../modals/AlgorithmExplainerModal';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGlobalExpenseOpen, setIsGlobalExpenseOpen] = useState(false);
  const [isAlgorithmModalOpen, setIsAlgorithmModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showNewExpenseBtn = location.pathname === '/' || location.pathname === '/groups';
  
  // Desktop nav link classes
  const navClass = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm transition-all duration-200"
      : "flex items-center gap-3 px-5 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm transition-all duration-200";

  // Mobile bottom nav link classes
  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
      isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 font-['Plus_Jakarta_Sans',_sans-serif] text-slate-900">

      {/* Global Add Expense Modal */}
      <GlobalAddExpenseModal
        isOpen={isGlobalExpenseOpen}
        onClose={() => setIsGlobalExpenseOpen(false)}
        currentUser={user}
      />

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[272px] bg-slate-50 border-r border-slate-200 flex-col pt-8 pb-4 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            SplitEase
          </h1>
          <p className="text-[11px] text-slate-400 font-semibold tracking-widest mt-1 uppercase">Expense Splitting</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavLink to="/" className={navClass} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/groups" className={navClass}>
            <Users size={20} />
            <span>Groups</span>
          </NavLink>
          <NavLink to="/activity" className={navClass}>
            <CreditCard size={20} />
            <span>Activity</span>
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="px-4 mt-auto">
          <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgb(15,23,42,0.03)] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[14px] font-bold text-slate-900 truncate leading-tight mb-0.5">{user?.name || 'User'}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-[272px] min-h-screen pb-24 md:pb-16">
        {/* Top Header */}
        <header className="fixed top-0 right-0 w-full md:w-[calc(100%-272px)] h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-40">
          <div className="h-full max-w-5xl mx-auto px-4 sm:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="md:hidden w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                SE
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                Welcome, {user?.name?.split(' ')[0] || 'User'}
              </h2>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Algorithm Explainer Help Button */}
              <button
                onClick={() => setIsAlgorithmModalOpen(true)}
                className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-slate-100 relative cursor-pointer"
                title="How Debt Simplification Works"
              >
                <HelpCircle size={20} />
              </button>

              {/* Interactive Notifications Popover */}
              <NotificationsPopover />

              {showNewExpenseBtn && (
                <button 
                  onClick={() => setIsGlobalExpenseOpen(true)} 
                  className="hidden sm:flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-600/15 cursor-pointer"
                >
                  <Plus size={15} /> Add Expense
                </button>
              )}
              <button 
                onClick={() => navigate('/settings')}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-sm hover:ring-2 hover:ring-blue-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Account Settings"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* Global Modals */}
        <AlgorithmExplainerModal 
          isOpen={isAlgorithmModalOpen} 
          onClose={() => setIsAlgorithmModalOpen(false)} 
        />

        {/* Canvas Area */}
        <div className="pt-24 px-4 sm:px-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-50 flex items-center justify-around md:hidden px-3 shadow-lg">
        <NavLink to="/" className={mobileNavClass} end>
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Dashboard</span>
        </NavLink>
        <NavLink to="/groups" className={mobileNavClass}>
          <Users size={20} />
          <span className="text-[10px]">Groups</span>
        </NavLink>
        
        {/* Center Floating Quick Add Button */}
        <button 
          onClick={() => setIsGlobalExpenseOpen(true)}
          className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-90 transition-all -mt-3 border-2 border-white"
          title="Add Expense"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>

        <NavLink to="/activity" className={mobileNavClass}>
          <CreditCard size={20} />
          <span className="text-[10px]">Activity</span>
        </NavLink>
        <NavLink to="/settings" className={mobileNavClass}>
          <Settings size={20} />
          <span className="text-[10px]">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AppLayout;
