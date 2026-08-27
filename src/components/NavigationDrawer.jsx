import React from 'react';
import NotificationsView from './NotificationsView.jsx';
import './NavigationDrawer.css';

export default function NavigationDrawer({ currentPath, onNavigate, isStatic = false }) {
  const [showNotifPopover, setShowNotifPopover] = React.useState(false);

  const navItems = [
    { label: 'Home', path: '/home', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )},
    { label: 'My profile', path: '/profile', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )},
    { label: 'My circles', path: '/circles', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )},
    { label: 'Location sharing', path: '/location-sharing', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    )},
    { label: 'Safety settings', path: '/safety-settings', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )},
    { label: 'Notifications', path: '/notifications', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    )},
    { label: 'Subscription', path: '/subscription', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      </svg>
    )},
  ];

  const secondaryItems = [
    { label: 'Help & support', path: '/help', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )},
    { label: 'Privacy policy', path: '/privacy-policy', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    )},
  ];

  const handleItemClick = (path) => {
    if (onNavigate) onNavigate(path);
  };

  const handleSignOut = () => {
    localStorage.removeItem('sfamily_token');
    sessionStorage.removeItem('sfamily_token');
    window.location.href = '/';
  };

  return (
    <aside className={`drawer-sidebar ${isStatic ? 'static' : ''}`}>
      {/* User Profile Header */}
      <div className="drawer-profile">
        <div className="drawer-avatar">
          <img src="/glowinn-logo.jpeg" alt="Avatar" />
        </div>
        <div className="drawer-user-info">
          <h3 className="drawer-user-name">Devvratbb</h3>
          <span className="drawer-user-tag">@hsh</span>
        </div>
        <div className="drawer-bell-wrapper">
          <button 
            className="drawer-bell-btn" 
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            title="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="drawer-bell-dot" />
          </button>

          {showNotifPopover && (
            <NotificationsView 
              isPopover={true} 
              onClosePopover={() => setShowNotifPopover(false)}
              onNavigate={(path) => {
                setShowNotifPopover(false);
                handleItemClick(path);
              }}
            />
          )}
        </div>
      </div>

      <div className="drawer-divider" />

      {/* Primary Nav List */}
      <div className="drawer-menu">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`drawer-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path)}
          >
            <span className="drawer-item-icon">{item.icon}</span>
            <span className="drawer-item-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="drawer-divider" />

      {/* Secondary Nav List */}
      <div className="drawer-menu">
        {secondaryItems.map((item) => (
          <button
            key={item.path}
            className={`drawer-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path)}
          >
            <span className="drawer-item-icon">{item.icon}</span>
            <span className="drawer-item-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer Sign Out */}
      <div className="drawer-footer">
        <button className="drawer-signout-btn" onClick={handleSignOut}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
