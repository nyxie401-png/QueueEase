import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  Stethoscope,
  Users,
  Calendar,
  Volume2,
  Trash2,
  Filter,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { apiGet, apiPut } from '../../services/api';
import { useSocket } from '../../hooks';

interface NotificationItem {
  _id: string;
  userId: string;
  type: 'queue-update' | 'your-turn' | 'turn-approaching' | 'emergency-alert' | 'appointment-reminder' | 'appointment-confirmed' | 'appointment-cancelled' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'queue' | 'appointment' | 'emergency'>('all');
  const [error, setError] = useState('');

  useSocket({
    'notification': (data: NotificationItem) => {
      setNotifications((prev) => [data, ...prev]);
    },
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGet<any>('/notifications');
      setNotifications(data.data?.notifications || []);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiPut(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPut('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'your-turn': return <Stethoscope className="w-5 h-5 text-teal-400" />;
      case 'turn-approaching': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'queue-update': return <Users className="w-5 h-5 text-blue-400" />;
      case 'emergency-alert': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'appointment-reminder': return <Calendar className="w-5 h-5 text-purple-400" />;
      case 'appointment-confirmed': return <Check className="w-5 h-5 text-green-400" />;
      case 'appointment-cancelled': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'your-turn': return 'bg-teal-500/10';
      case 'turn-approaching': return 'bg-yellow-500/10';
      case 'queue-update': return 'bg-blue-500/10';
      case 'emergency-alert': return 'bg-red-500/10';
      case 'appointment-reminder': return 'bg-purple-500/10';
      case 'appointment-confirmed': return 'bg-green-500/10';
      case 'appointment-cancelled': return 'bg-orange-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    if (filter === 'queue') return ['queue-update', 'your-turn', 'turn-approaching'].includes(n.type);
    if (filter === 'appointment') return n.type.startsWith('appointment');
    if (filter === 'emergency') return n.type === 'emergency-alert';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Stay updated on your queue status</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllAsRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'queue', label: 'Queue' },
          { key: 'appointment', label: 'Appointments' },
          { key: 'emergency', label: 'Emergency' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[48px] ${
              filter === tab.key
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<BellOff className="w-12 h-12" />}
          title="No notifications"
          description={
            filter === 'unread'
              ? "You're all caught up!"
              : filter === 'all'
              ? 'You have no notifications yet'
              : `No ${filter} notifications`
          }
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                className={`relative rounded-xl transition-all cursor-pointer ${
                  notification.isRead
                    ? 'bg-white/[0.02] hover:bg-white/5'
                    : 'bg-white/5 hover:bg-white/[0.08] border-l-2 border-l-teal-500'
                }`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl ${getTypeBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 ${notification.isRead ? 'text-gray-500' : 'text-gray-400'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-500 text-xs">{getTimeAgo(notification.createdAt)}</span>
                      <Badge
                        variant={
                          notification.type === 'emergency-alert' ? 'emergency' :
                          notification.type === 'your-turn' ? 'in-consultation' :
                          notification.type.startsWith('appointment') ? 'info' : 'waiting'
                        }
                      >
                        {notification.type.replace(/-/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-gray-500 hover:text-teal-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load More */}
      {filteredNotifications.length > 0 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={fetchNotifications}>
            Refresh Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
