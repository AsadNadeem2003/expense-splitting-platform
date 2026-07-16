import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Bell } from 'lucide-react';
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
  
  // Light-mode nav classes
  const navClass = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm transition-all duration-200"
      : "flex items-center gap-3 px-5 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm transition-all duration-200";

  return (
    <div className="min-h-screen bg-slate-100 font-['Plus_Jakarta_Sans',_sans-serif] text-slate-900">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[272px] bg-slate-50 border-r border-slate-200 flex flex-col pt-8 pb-4 z-50">
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
              <p className="text-[15px] font-bold text-slate-900 truncate leading-tight mb-0.5">{user?.name || 'User'}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[272px] min-h-screen">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 w-[calc(100%-272px)] h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-40">
          <div className="h-full max-w-5xl mx-auto px-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h2>
            </div>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate('/activity')}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer relative"
              >
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
              </button>
              {showNewExpenseBtn && (
                <button 
                  onClick={() => navigate('/groups')} 
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-600/15"
                >
                  + Add Expense
                </button>
              )}
              <button 
                onClick={() => navigate('/settings')}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-sm hover:ring-2 hover:ring-blue-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Go to Settings"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="pt-28 pb-16 px-10 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
