import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityFeed } from '../api/users';
import { Receipt, Loader, CreditCard, Search, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ActivityItem {
  id: string;
  type: 'EXPENSE' | 'SETTLEMENT';
  amount: number;
  netImpact: number;
  description: string;
  groupName: string;
  groupId: number;
  createdAt: string;
  actionText: string;
}

const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'SETTLEMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getActivityFeed(100);
        setActivities(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return words[0]?.substring(0, 2).toUpperCase() || '??';
  };

  const getParticipantName = (activity: ActivityItem): string => {
    const sources = [activity.actionText, activity.description].filter(Boolean);
    for (const text of sources) {
      const beforeVerb = text.match(/^(.+?)\s+(?:paid|settled)/i);
      if (beforeVerb) {
        const name = beforeVerb[1].trim();
        if (name.toLowerCase() !== 'you') return name;
      }
      const afterVerb = text.match(/(?:paid|with)\s+(.+?)$/i);
      if (afterVerb) {
        const name = afterVerb[1].trim();
        if (name.toLowerCase() !== 'you' && !name.includes('bill') && !name.includes('share')) return name;
      }
    }
    return firstName;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Analytics Metrics
  const metrics = useMemo(() => {
    let totalSettledPaisa = 0;
    let totalExpensesPaisa = 0;
    const groupSet = new Set<number>();

    activities.forEach(a => {
      if (a.groupId) groupSet.add(a.groupId);
      if (a.type === 'SETTLEMENT') {
        totalSettledPaisa += a.amount;
      } else if (a.type === 'EXPENSE') {
        totalExpensesPaisa += Math.abs(a.netImpact);
      }
    });

    return {
      totalSettled: (totalSettledPaisa / 100).toFixed(2),
      totalExpenses: (totalExpensesPaisa / 100).toFixed(2),
      activeGroupsCount: groupSet.size,
      totalCount: activities.length
    };
  }, [activities]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesType = filterType === 'ALL' || a.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        a.description?.toLowerCase().includes(q) ||
        a.groupName?.toLowerCase().includes(q) ||
        a.actionText?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [activities, filterType, searchQuery]);

  const renderNaturalText = (activity: ActivityItem) => {
    if (activity.type === 'EXPENSE') {
      const actor = activity.actionText.toLowerCase().startsWith('you') ? 'You' : getParticipantName(activity);
      const action = actor === 'You' ? 'added' : 'paid for';
      return (
        <span>
          <strong className="font-semibold text-slate-900">{actor}</strong> {action} <span className="font-semibold text-slate-900">{activity.description}</span> in {activity.groupName}
        </span>
      );
    } else {
      return <span className="text-slate-900 font-medium">{activity.description}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl border border-rose-100">{error}</div>;
  }

  return (
    <div className="animate-fade-in w-full font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Activity & History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete audit trail of all expenses and settlements across your groups
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-2xs self-start sm:self-auto">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </section>

      {/* Analytics Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <CreditCard size={16} className="text-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Settled</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
            Rs. {metrics.totalSettled}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Direct payments completed</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Receipt size={16} className="text-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Your Shared Volume</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
            Rs. {metrics.totalExpenses}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Net financial participation</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Layers size={16} className="text-violet-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Involvements</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {metrics.activeGroupsCount} {metrics.activeGroupsCount === 1 ? 'Group' : 'Groups'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{metrics.totalCount} total audit transactions</p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'EXPENSE', 'SETTLEMENT'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'All Transactions' : type === 'EXPENSE' ? 'Expenses' : 'Settlements'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </section>

      {/* Activities List Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] overflow-hidden">
        {filteredActivities.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
              <Receipt size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">No matching activity</h2>
            <p className="text-sm text-slate-500">No transactions found for the selected filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((activity) => {
              const participantName = getParticipantName(activity);
              const initials = getInitials(participantName);
              const amountFormatted = `Rs. ${(Math.abs(activity.netImpact) / 100).toFixed(2)}`;

              return (
                <div 
                  key={activity.id} 
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/groups/${activity.groupId}`)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Left: Avatar Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {initials}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-600">
                        {activity.groupName.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Center: Details */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs sm:text-sm text-slate-800 leading-snug truncate">
                        {renderNaturalText(activity)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          {activity.type}
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-400">
                          {getRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Net Impact */}
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[11px] sm:text-xs font-mono font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl inline-block ${
                      activity.netImpact > 0 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : activity.netImpact < 0 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {activity.netImpact > 0 ? '+' : activity.netImpact < 0 ? '-' : ''}{amountFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
