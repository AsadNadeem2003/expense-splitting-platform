import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityFeed } from '../api/users';
import { Receipt, Loader } from 'lucide-react';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getActivityFeed(50);
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

  // Extract initials
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return words[0]?.substring(0, 2).toUpperCase() || '??';
  };

  // Participant name extractor
  const getParticipantName = (activity: ActivityItem): string => {
    const sources = [activity.actionText, activity.description].filter(Boolean);
    for (const text of sources) {
      const beforeVerb = text.match(/^(.+?)\s+(?:paid|settled)/i);
      if (beforeVerb) {
        const name = beforeVerb[1].trim();
        if (name.toLowerCase() !== 'you' && !name.toLowerCase().includes('multiple')) return name;
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
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const renderNaturalText = (activity: ActivityItem) => {
    if (activity.type === 'EXPENSE') {
      const actor = activity.actionText.toLowerCase().startsWith('you') ? 'You' : getParticipantName(activity);
      const action = actor === 'You' ? 'added' : 'paid for';
      return (
        <span>
          <span className="font-semibold text-slate-900">{actor}</span> {action} <span className="font-semibold text-slate-900">{activity.description}</span> in {activity.groupName}
        </span>
      );
    } else {
      // Settlement
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
      {/* ─── Header Section ─── */}
      <section className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Activities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Let's take care of payments!
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </section>

      {/* ─── Activities List Card ─── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
              <Receipt size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">No activity yet</h2>
            <p className="text-sm text-slate-500">You haven't participated in any expenses or settlements yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {activities.map((activity, idx) => {
              const participantName = getParticipantName(activity);
              const initials = getInitials(participantName);
              const isLast = idx === activities.length - 1;
              const isPositive = activity.netImpact > 0;
              const amountFormatted = `Rs. ${(Math.abs(activity.netImpact) / 100).toFixed(2)}`;

              return (
                <div 
                  key={activity.id} 
                  className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${!isLast ? 'border-b border-slate-100' : ''}`}
                  onClick={() => navigate(`/groups/${activity.groupId}`)}
                >
                  {/* Left: Dual Avatar */}
                  <div className="relative flex-shrink-0 mt-1">
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {initials}
                    </div>
                    {/* Nested group indicator badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-600">
                      {activity.groupName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Center: Activity Text */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[14px] text-slate-700 leading-snug truncate">
                      {renderNaturalText(activity)}
                    </p>
                    {/* Subtext Outcome */}
                    {activity.netImpact !== 0 ? (
                      <p className={`text-xs mt-1 font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? `+ You get back ${amountFormatted}` : `- You paid ${amountFormatted}`}
                      </p>
                    ) : (
                      <p className="text-xs mt-1 font-medium text-slate-400">
                        No balance impact
                      </p>
                    )}
                  </div>

                  {/* Right: Relative Time */}
                  <div className="flex-shrink-0 pt-1">
                    <span className="text-xs font-medium text-slate-400">
                      {getRelativeTime(activity.createdAt)}
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
