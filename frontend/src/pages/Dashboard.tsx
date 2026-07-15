import { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertCircle, Loader, Receipt, CreditCard, Wallet, MoveUpRight, MoveDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/users';
import type { DashboardStats } from '../api/users';

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
      <div className="animate-fade-in flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      {/* Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {/* Total Balance */}
        <div className={`glass-card p-6 rounded-xl luminous-border-top ${stats?.totalBalance && stats.totalBalance >= 0 ? 'glow-emerald' : 'glow-coral'} flex flex-col justify-between h-40 transition-all`}>
          <div className="flex justify-between items-start">
            <span className="text-on-secondary-container text-xs font-semibold tracking-widest uppercase">Total Balance</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats?.totalBalance && stats.totalBalance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <h3 className="font-numeric-lg text-4xl font-medium text-on-surface">
              {stats?.totalBalance && stats.totalBalance > 0 ? '+' : ''}Rs. {((stats?.totalBalance || 0) / 100).toFixed(2)}
            </h3>
            <p className={`text-[10px] mt-1 flex items-center gap-1 ${stats?.totalBalance && stats.totalBalance >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
              Net position across all groups
            </p>
          </div>
        </div>

        {/* You Owe */}
        <div className="glass-card p-6 rounded-xl luminous-border-top glow-coral flex flex-col justify-between h-40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-on-secondary-container text-xs font-semibold tracking-widest uppercase">You Owe</span>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <MoveUpRight className="text-red-500" size={16} />
            </div>
          </div>
          <div>
            <h3 className="font-numeric-lg text-4xl font-medium text-on-surface">Rs. {((stats?.totalOwes || 0) / 100).toFixed(2)}</h3>
            <p className="text-[10px] text-red-500/70 mt-1">Pending payments</p>
          </div>
        </div>

        {/* You are Owed */}
        <div className="glass-card p-6 rounded-xl luminous-border-top glow-emerald flex flex-col justify-between h-40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-on-secondary-container text-xs font-semibold tracking-widest uppercase">You Are Owed</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <MoveDownLeft className="text-emerald-500" size={16} />
            </div>
          </div>
          <div>
            <h3 className="font-numeric-lg text-4xl font-medium text-on-surface">Rs. {((stats?.totalOwed || 0) / 100).toFixed(2)}</h3>
            <p className="text-[10px] text-emerald-500/70 mt-1">Pending collections</p>
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 gap-12 items-start">
        {/* Recent Activity (Vertical List) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-2xl font-semibold text-on-surface">Recent Activity</h3>
            <button className="text-primary text-xs font-semibold hover:underline" onClick={() => navigate('/activity')}>View All</button>
          </div>
          <div className="space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, idx) => (
                <div key={activity.id || idx} className={`glass-card p-4 rounded-xl flex items-center gap-6 hover:translate-x-1 transition-transform ${activity.netImpact < 0 ? 'border-l-4 border-l-red-500/40' : ''}`}>
                  <div className="w-12 h-12 rounded-full glass-card border-none flex items-center justify-center">
                    {activity.type === 'EXPENSE' ? <Receipt className="text-primary" size={20} /> : <CreditCard className="text-primary" size={20} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-body-md text-base font-semibold text-on-surface">{activity.description}</h4>
                    <p className="text-xs text-on-secondary-container opacity-60">
                      {new Date(activity.createdAt || Date.now()).toLocaleDateString()} • Group: <span className="text-primary/80 font-medium">{activity.groupName}</span>
                    </p>
                    <p className="text-[10px] text-on-secondary-container opacity-40 mt-0.5">{activity.actionText}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-numeric-lg text-lg font-medium ${activity.netImpact >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {activity.netImpact >= 0 ? '+' : '-'}Rs. {(Math.abs(activity.netImpact) / 100).toFixed(2)}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${activity.netImpact >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {activity.type === 'EXPENSE' ? 'Pending' : 'Settled'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-on-secondary-container text-sm p-4">No recent activity found. Create a group to start tracking expenses!</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
