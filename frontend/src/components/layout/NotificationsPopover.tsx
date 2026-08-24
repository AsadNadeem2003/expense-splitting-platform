import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CreditCard, Receipt, ArrowRight, Loader, AlertCircle, Clock } from 'lucide-react';
import { getDashboardStats } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

interface NotificationsPopoverProps {
  onNotificationCountChange?: (count: number) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onNotificationCountChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      if (data?.recentActivity) {
        setActivities(data.recentActivity.slice(0, 6));
      }
      if (data?.remindersReceived) {
        setReminders(data.remindersReceived);
      }
      if (data?.pendingVerifications) {
        setPendingVerifications(data.pendingVerifications);
      }
      
      const totalAlerts = (data?.remindersReceived?.length || 0) + (data?.pendingVerifications?.length || 0);
      if (onNotificationCountChange) {
        onNotificationCountChange(totalAlerts);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const totalUnread = reminders.length + pendingVerifications.length;

  const formatRelative = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-100 relative cursor-pointer"
        title="Notifications"
      >
        <Bell size={20} />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white animate-pulse">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Floating Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-fade-in font-['Plus_Jakarta_Sans',_sans-serif]">
          {/* Popover Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Notifications & Alerts</h4>
              {totalUnread > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalUnread} New
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xs"
            >
              <X size={16} />
            </button>
          </div>

          {/* Notifications Body */}
          <div className="max-h-[390px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 flex items-center justify-center text-slate-400">
                <Loader size={20} className="animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* 1. Payment Reminders Received */}
                {reminders.length > 0 && (
                  <div className="bg-amber-50/40 p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 px-2 flex items-center gap-1">
                      <Clock size={12} /> Payment Reminders
                    </span>
                    {reminders.map(rem => (
                      <div
                        key={rem.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/groups/${rem.groupId}`);
                        }}
                        className="bg-white border border-amber-200/80 rounded-2xl p-3.5 shadow-2xs hover:border-amber-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {rem.creditor?.name} reminded you to pay
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              In {rem.group?.name} · {formatRelative(rem.sentAt)}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                            Rs. {(rem.amount / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400">7-day debt nudge</span>
                          <span className="text-[11px] font-bold text-blue-600 hover:underline">Settle Up →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Pending Verification Requests */}
                {pendingVerifications.length > 0 && (
                  <div className="bg-blue-50/30 p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 flex items-center gap-1">
                      <AlertCircle size={12} /> Awaiting Your Confirmation
                    </span>
                    {pendingVerifications.map(pv => (
                      <div
                        key={pv.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/groups/${pv.groupId}`);
                        }}
                        className="bg-white border border-blue-200/80 rounded-2xl p-3.5 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {pv.payer?.name} recorded a payment
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              In {pv.group?.name} · {formatRelative(pv.createdAt)}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                            Rs. {(pv.amount / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400">Review proof receipt</span>
                          <span className="text-[11px] font-bold text-blue-600 hover:underline">Verify Payment →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Recent Activity Stream */}
                {activities.length > 0 ? (
                  activities.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer"
                      onClick={() => {
                        setIsOpen(false);
                        if (item.groupId) {
                          navigate(`/groups/${item.groupId}`);
                        } else {
                          navigate('/activity');
                        }
                      }}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        item.type === 'SETTLEMENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {item.type === 'SETTLEMENT' ? <CreditCard size={15} /> : <Receipt size={15} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.groupName} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-[11px] font-mono font-bold ${
                          item.netImpact >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {item.netImpact > 0 ? '+' : ''}Rs. {(Math.abs(item.netImpact) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  reminders.length === 0 && pendingVerifications.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No notifications found.
                    </div>
                  )
                )}
              </>
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/80 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/activity');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 w-full py-1.5 transition-colors"
            >
              View Full Activity Feed <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPopover;
