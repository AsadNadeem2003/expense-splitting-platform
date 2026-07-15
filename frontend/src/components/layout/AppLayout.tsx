import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showNewExpenseBtn = location.pathname === '/';
  
  // Custom NavLink classes
  const navClass = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "flex items-center gap-4 px-6 py-4 bg-primary/10 text-primary border-r-2 border-primary transition-all duration-300 active:scale-95 group"
      : "flex items-center gap-4 px-6 py-4 text-on-secondary-container hover:text-primary hover:bg-primary/5 transition-all duration-300 active:scale-95";

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      <div className="ambient-glow"></div>
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] backdrop-blur-xl bg-secondary-container/60 border-r border-white/10 shadow-2xl flex flex-col py-8 z-50">
        <div className="px-6 mb-12">
          <h1 className="font-display-lg text-4xl font-bold text-primary drop-shadow-[0_0_15px_rgba(200,198,197,0.4)] tracking-tighter">
            SplitEase
          </h1>
          <p className="text-on-secondary-container text-xs font-semibold tracking-widest mt-1 opacity-60 uppercase">Expense Splitting</p>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink to="/" className={navClass} end>
            <LayoutDashboard size={24} />
            <span className="font-body-md font-semibold">Dashboard</span>
          </NavLink>
          <NavLink to="/groups" className={navClass}>
            <Users size={24} />
            <span className="font-body-md font-semibold">Groups</span>
          </NavLink>
          <NavLink to="/activity" className={navClass}>
            <CreditCard size={24} />
            <span className="font-body-md font-semibold">Activity</span>
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            <Settings size={24} />
            <span className="font-body-md font-semibold">Settings</span>
          </NavLink>
        </nav>

        <div className="px-6 mt-auto">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden flex items-center justify-center bg-primary-container text-primary font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-label-sm text-on-surface text-sm truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-on-secondary-container opacity-60 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-on-secondary-container hover:text-red-400 transition-colors cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] min-h-screen">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-20 backdrop-blur-md bg-background/80 border-b border-white/10 shadow-sm flex justify-between items-center px-12 z-40">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-2xl font-semibold text-on-background">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden"></div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/activity')}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80 relative"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-background"></span>
              </button>
              {showNewExpenseBtn && (
                <button 
                  onClick={() => navigate('/groups')} 
                  className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-sm text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(200,198,197,0.3)]"
                >
                  Add Expense
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="pt-32 pb-20 px-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
