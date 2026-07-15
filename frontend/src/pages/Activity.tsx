import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityFeed } from '../api/users';
import { Receipt, CreditCard, Loader } from 'lucide-react';
import './Activity.css';

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

  if (loading) {
    return (
      <div className="activity-loading">
        <Loader className="spinner" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="activity-error">{error}</div>;
  }

  return (
    <div className="activity-container">
      {activities.length === 0 ? (
        <div className="empty-state">
          <Receipt size={60} />
          <h3>No activity yet</h3>
          <p>You haven't participated in any expenses or settlements yet.</p>
        </div>
      ) : (
        <div className="activity-timeline">
          {activities.map(activity => (
            <div 
              key={activity.id} 
              className={`activity-card ${activity.type.toLowerCase()}`}
              onClick={() => navigate(`/groups/${activity.groupId}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="activity-icon">
                {activity.type === 'EXPENSE' ? <Receipt size={24} /> : <CreditCard size={24} />}
              </div>
              <div className="activity-details">
                <h4>{activity.description}</h4>
                <p className="meta-text">
                  <span>{activity.groupName}</span> • <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="action-text">{activity.actionText}</p>
              </div>
              <div className="activity-amount">
                <span className={activity.netImpact > 0 ? 'positive' : activity.netImpact < 0 ? 'negative' : 'neutral'}>
                  {activity.netImpact > 0 ? '+' : activity.netImpact < 0 ? '-' : ''} Rs. {(Math.abs(activity.netImpact) / 100).toFixed(2)}
                </span>
                <span className="total-amount">Total: Rs. {(activity.amount / 100).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activity;
