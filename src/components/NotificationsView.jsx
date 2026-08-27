import React, { useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/sfamilyApi.js';
import './NotificationsView.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Safe Zone Alert',
    message: 'Aarav reached Home Safe Zone',
    time: '5 mins ago',
    type: 'safety',
    unread: true,
    avatar: '🏠',
    iconBg: 'rgba(0, 229, 153, 0.15)',
    iconColor: '#00E599'
  },
  {
    id: 2,
    title: 'Check-in Reminder',
    message: 'Scheduled check-in with Family Circle at 7:00 PM',
    time: '25 mins ago',
    type: 'circle',
    unread: true,
    avatar: '⏰',
    iconBg: 'rgba(56, 189, 248, 0.15)',
    iconColor: '#38bdf8'
  },
  {
    id: 3,
    title: 'Low Battery Alert',
    message: "Dad's phone battery is below 15%",
    time: '1 hour ago',
    type: 'alert',
    unread: false,
    avatar: '🔋',
    iconBg: 'rgba(251, 146, 60, 0.15)',
    iconColor: '#fb923c'
  },
  {
    id: 4,
    title: 'Circle Invite Accepted',
    message: 'Priya joined your "Weekend Family" circle',
    time: '2 hours ago',
    type: 'circle',
    unread: false,
    avatar: '🎉',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#a855f7'
  },
  {
    id: 5,
    title: 'Emergency SOS Test',
    message: 'System SOS test completed successfully',
    time: 'Yesterday',
    type: 'system',
    unread: false,
    avatar: '🛡️',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#6366f1'
  }
];

export default function NotificationsView({ onNavigate, isPopover = false, onClosePopover }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  React.useEffect(() => {
    getNotifications()
      .then((response) => {
        const items = response?.data?.notifications;
        if (!Array.isArray(items)) return;
        setNotifications(items.map((item) => ({
          id: item.id,
          title: item.type?.replaceAll('.', ' ') || 'Notification',
          message: item.message,
          time: item.created_at ? new Date(item.created_at).toLocaleString() : '',
          type: item.type,
          unread: !item.read,
          avatar: item.actor?.avatar_url ? '' : '🔔',
          avatarUrl: item.actor?.avatar_url,
          iconBg: 'rgba(56, 189, 248, 0.15)',
          iconColor: '#38bdf8',
        })));
      })
      .catch(() => {
        // Keep the local empty-state content if the feed is unavailable.
      });
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    markAllNotificationsRead().catch(() => {});
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    markNotificationRead(id).catch(() => {});
  };

  const clearNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  if (isPopover) {
    return (
      <div className="notif-popover">
        <div className="notif-popover-header">
          <div className="notif-popover-title-row">
            <h3>Notifications</h3>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount} new</span>}
          </div>
          <div className="notif-popover-actions">
            {unreadCount > 0 && (
              <button className="notif-text-btn" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
            {onClosePopover && (
              <button className="notif-close-btn" onClick={onClosePopover} title="Close">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="notif-popover-list">
          {filteredNotifications.length === 0 ? (
            <div className="notif-empty-state">
              <span className="notif-empty-icon">🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            filteredNotifications.slice(0, 4).map(item => (
              <div 
                key={item.id} 
                className={`notif-item ${item.unread ? 'unread' : ''}`}
                onClick={() => markAsRead(item.id)}
              >
                <div className="notif-icon-wrap" style={{ background: item.iconBg }}>
                  {item.avatarUrl ? <img src={item.avatarUrl} alt="" /> : <span>{item.avatar}</span>}
                </div>
                <div className="notif-body">
                  <div className="notif-title">{item.title}</div>
                  <div className="notif-msg">{item.message}</div>
                  <div className="notif-time">{item.time}</div>
                </div>
                {item.unread && <span className="notif-unread-dot" />}
              </div>
            ))
          )}
        </div>

        <div className="notif-popover-footer">
          <button 
            className="notif-view-all-btn"
            onClick={() => {
              if (onClosePopover) onClosePopover();
              if (onNavigate) onNavigate('/notifications');
            }}
          >
            View all notifications →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notif-page-container">
      <div className="notif-page-header">
        <div>
          <h1 className="notif-page-title">Notifications</h1>
          <p className="notif-page-sub">Stay updated with circle activity, safety alerts, and system check-ins.</p>
        </div>
        {unreadCount > 0 && (
          <button className="notif-mark-all-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notif-filter-tabs">
        <button 
          className={`notif-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`notif-filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="notif-full-list">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty-full">
            <span className="notif-empty-icon-lg">🎉</span>
            <h3>You're all caught up!</h3>
            <p>No unread notifications at this time.</p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div 
              key={item.id} 
              className={`notif-card ${item.unread ? 'unread' : ''}`}
              onClick={() => markAsRead(item.id)}
            >
              <div className="notif-icon-wrap-lg" style={{ background: item.iconBg }}>
                {item.avatarUrl ? <img src={item.avatarUrl} alt="" /> : <span>{item.avatar}</span>}
              </div>
              <div className="notif-card-content">
                <div className="notif-card-header">
                  <h4 className="notif-card-title">{item.title}</h4>
                  <span className="notif-card-time">{item.time}</span>
                </div>
                <p className="notif-card-msg">{item.message}</p>
              </div>
              <button 
                className="notif-delete-btn"
                onClick={(e) => clearNotification(e, item.id)}
                title="Remove notification"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
