import React, { useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead, respondToFollowRequest, respondToFamilyInvite, respondToAlarmWatch } from '../services/sfamilyApi.js';
import './NotificationsView.css';

export default function NotificationsView({ onNavigate, isPopover = false, onClosePopover }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  React.useEffect(() => {
    getNotifications()
      .then((response) => {
        const items = response?.data?.notifications;
        if (!Array.isArray(items)) return;
        setNotifications(items.map((item) => ({
          id: item.id,
          action: item.action,
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
      .catch(e => setError(e.message || 'Unable to load notifications.'));
  }, []);

  const markAllAsRead = async () => {
    try { await markAllNotificationsRead(); setNotifications(prev => prev.map(n => ({ ...n, unread: false }))); }
    catch(e) { setError(e.message); }
  };
  const markAsRead = async (id) => {
    try { await markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n)); }
    catch(e) { setError(e.message); }
    const action = notifications.find(n => n.id === id)?.action;
    if (action?.alarm_id) { onClosePopover?.(); onNavigate?.(`/alarms/${encodeURIComponent(action.alarm_id)}`); }
  };
  const answerAction = async (item, accept) => {
    if (pending) return; setPending(item.id); setError('');
    try {
      const a = item.action;
      if (a.kind === 'family_invite') await respondToFamilyInvite(a.invite_id,accept);
      else if (a.kind === 'follow_request') await respondToFollowRequest(a.request_id,accept);
      else await respondToAlarmWatch(a.request_id || a.step_id,accept);
      await markNotificationRead(item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? {...n,action:null,unread:false} : n));
    } catch(e) { setError(e.message); } finally { setPending(null); }
  };
  const actionButtons = item => item.action && ['family_invite','follow_request','alarm_watch'].includes(item.action.kind) && <span onClick={e => e.stopPropagation()}><button disabled={pending !== null} onClick={() => answerAction(item,true)}>{item.action.kind === 'alarm_watch' ? "I'll help" : 'Accept'}</button><button disabled={pending !== null} onClick={() => answerAction(item,false)}>{item.action.kind === 'alarm_watch' ? 'Pass on' : 'Decline'}</button></span>;

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

        <div className="notif-popover-list">{error && <p role="alert">{error}</p>}
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
                  <div className="notif-time">{item.time}</div>{actionButtons(item)}
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

      <div className="notif-full-list">{error && <p role="alert">{error}</p>}
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
                <p className="notif-card-msg">{item.message}</p>{actionButtons(item)}
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
