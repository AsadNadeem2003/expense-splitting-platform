import { useState, useEffect } from 'react';
import { DollarSign, UserPlus, ArrowUpRight, Wallet, Loader, MoveUpRight, MoveDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../api/users';
import type { DashboardStats } from '../api/users';
import BalancesBreakdownModal from '../components/dashboard/BalancesBreakdownModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [breakdownModalState, setBreakdownModalState] = useState<{ isOpen: boolean, type: 'OWES' | 'OWED' }>({ isOpen: false, type: 'OWES' });

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
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'User';

  // Extract initials from a name string like "Abdullah Sheikh" → "AS"
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return words[0]?.substring(0, 2).toUpperCase() || '??';
  };

  // Extract the participant name from activity data
  const getParticipantName = (activity: any): string => {
    // actionText examples: "You paid", "Abdullah Sheikh paid", "You paid the full bill",
    //                       "You settled up with Ali Raza", "Ali Raza settled up with you"
    // description examples: "You paid Abdullah Sheikh", "Ali Raza paid you", "Groceries"
    const sources = [activity.actionText, activity.description].filter(Boolean);
    
    for (const text of sources) {
      // Pattern 1: "X paid..." or "X settled..." — name before the verb
      const beforeVerb = text.match(/^(.+?)\s+(?:paid|settled)/i);
      if (beforeVerb) {
        const name = beforeVerb[1].trim();
        if (name.toLowerCase() !== 'you' && !name.toLowerCase().includes('multiple')) return name;
      }
      // Pattern 2: "...paid X" or "...with X" — name after the verb
      const afterVerb = text.match(/(?:paid|with)\s+(.+?)$/i);
      if (afterVerb) {
        const name = afterVerb[1].trim();
        // Skip generic suffixes like "the full bill" or "your share" or "you"
        if (name.toLowerCase() !== 'you' && !name.includes('bill') && !name.includes('share')) return name;
      }
    }
    return firstName; // fallback to current user
  };

  // 3-way balance subtext color
  const balanceSubtextColor = (() => {
    const bal = stats?.totalBalance || 0;
    if (bal > 0) return 'text-emerald-600';
    if (bal < 0) return 'text-rose-600';
    return 'text-slate-400';
  })();

  return (
    <div className="animate-fade-in w-full font-['Plus_Jakarta_Sans',_sans-serif]">

      <BalancesBreakdownModal 
        isOpen={breakdownModalState.isOpen}
        onClose={() => setBreakdownModalState({ ...breakdownModalState, isOpen: false })}
        type={breakdownModalState.type}
        breakdown={stats?.balancesBreakdown || []}
      />

      {/* ─── Hero Card: Total Balance ─── */}
      <section className="mb-8">
        <div className="relative overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] rounded-3xl p-8">
          {/* Radial mesh gradient background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[160%] bg-[radial-gradient(ellipse_at_center,rgba(96,165,250,0.15),rgba(56,189,248,0.08),transparent_70%)] blur-3xl"></div>
            <div className="absolute bottom-[-40%] left-[-10%] w-[50%] h-[140%] bg-[radial-gradient(ellipse_at_center,rgba(147,197,253,0.1),transparent_70%)] blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Wallet className="text-slate-500" size={16} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Balance</span>
            </div>
            <h2 className="text-5xl font-extrabold tracking-tight text-slate-900">
              {stats?.totalBalance && stats.totalBalance > 0 ? '+' : ''}Rs. {((stats?.totalBalance || 0) / 100).toFixed(2)}
            </h2>
            <p className={`text-xs mt-2 font-medium ${balanceSubtextColor}`}>
              Net position across all groups
            </p>
          </div>
        </div>
      </section>

      {/* ─── Stat Cards: You Owe / You Are Owed ─── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* You Owe */}
        <button 
          onClick={() => setBreakdownModalState({ isOpen: true, type: 'OWES' })}
          className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] rounded-3xl p-6 flex items-center gap-5 transition-all hover:shadow-[0_8px_30px_rgb(15,23,42,0.07)] hover:-translate-y-1 text-left w-full cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <MoveUpRight className="text-rose-600" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">You Owe</p>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Rs. {((stats?.totalOwes || 0) / 100).toFixed(2)}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full whitespace-nowrap">
            View Details
          </span>
        </button>

        {/* You Are Owed */}
        <button 
          onClick={() => setBreakdownModalState({ isOpen: true, type: 'OWED' })}
          className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] rounded-3xl p-6 flex items-center gap-5 transition-all hover:shadow-[0_8px_30px_rgb(15,23,42,0.07)] hover:-translate-y-1 text-left w-full cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <MoveDownLeft className="text-emerald-600" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">You Are Owed</p>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Rs. {((stats?.totalOwed || 0) / 100).toFixed(2)}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap">
            View Details
          </span>
        </button>
      </section>

      {/* ─── Quick Actions Row ─── */}
      <section className="mb-10">
        <div className="flex items-center gap-6">
          {[
            { icon: DollarSign, label: 'Pay', color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => navigate('/groups') },
            { icon: UserPlus, label: 'Request', color: 'text-violet-600', bg: 'bg-violet-50', onClick: () => navigate('/groups') },
            { icon: ArrowUpRight, label: 'Split', color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => navigate('/groups') },
            { icon: Wallet, label: 'Balance', color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => navigate('/activity') },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-full ${action.bg} flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-sm`}>
                <action.icon className={action.color} size={22} />
              </div>
              <span className="text-xs font-semibold text-slate-600">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Activity Feed ─── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-slate-900">Recent Activity</h3>
          <button
            className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer"
            onClick={() => navigate('/activity')}
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, idx) => (
              <div
                key={activity.id || idx}
                className="bg-white border border-slate-100 shadow-[0_4px_20px_rgb(15,23,42,0.03)] rounded-2xl p-4 flex items-center gap-4 hover:shadow-[0_8px_30px_rgb(15,23,42,0.06)] transition-all duration-200"
              >
                {/* Avatar with participant initials */}
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-bold text-slate-500 leading-none">
                    {getInitials(getParticipantName(activity))}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{activity.description}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(activity.createdAt || Date.now()).toLocaleDateString()} · <span className="text-slate-500 font-medium">{activity.groupName}</span>
                  </p>
                </div>

                {/* Amount Badge */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-bold inline-block px-3 py-1 rounded-xl ${
                    activity.netImpact >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {activity.netImpact > 0 ? '+' : ''}Rs. {(Math.abs(activity.netImpact) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm">No recent activity found. Create a group to start tracking expenses!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
