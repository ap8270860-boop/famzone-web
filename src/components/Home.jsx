import React, { useState, useEffect } from 'react';
import NavigationDrawer from './NavigationDrawer.jsx';
import AuthModal from './AuthModal.jsx';
import EditProfile from './EditProfile.jsx';
import NotificationsView from './NotificationsView.jsx';
import HomeDashboard from './HomeDashboard.jsx';
import MyCircles from './MyCircles.jsx';
import './Home.css';

export default function Home() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    const path = window.location.pathname;
    if (path === '/login') {
      setAuthModal({ isOpen: true, view: 'login' });
    } else if (path === '/register' || path === '/signup') {
      setAuthModal({ isOpen: true, view: 'signup' });
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newPath) => {
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
      setCurrentPath(newPath);
    }
    if (newPath === '/login') {
      setAuthModal({ isOpen: true, view: 'login' });
    } else if (newPath === '/register' || newPath === '/signup') {
      setAuthModal({ isOpen: true, view: 'signup' });
    }
    setMobileSidebarOpen(false);
  };

  const handleModalViewChange = (newView) => {
    const targetPath = newView === 'signup' ? '/register' : '/login';
    navigateTo(targetPath);
    setAuthModal({ isOpen: true, view: newView });
  };

  const handleCloseModal = () => {
    setAuthModal({ isOpen: false, view: 'login' });
    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
      navigateTo('/home');
    }
  };

  const handleAuthSuccess = () => {
    setAuthModal({ isOpen: false, view: 'login' });
    navigateTo('/home');
  };

  // Render view body content based on unique route URL
  const renderViewContent = () => {
    switch (currentPath) {
      case '/profile':
        return <EditProfile onBack={() => navigateTo('/home')} />;
      case '/circles':
        return <MyCircles onBack={() => navigateTo('/home')} />;
      case '/location-sharing':
        return (
          <div className="home-card-view">
            <h2>Location Sharing</h2>
            <p>Real-time GPS tracking and safe zone geofence alerts.</p>
          </div>
        );
      case '/safety-settings':
        return (
          <div className="home-card-view">
            <h2>Safety Settings</h2>
            <p>Configure emergency SOS, speed alerts, and contact access rules.</p>
          </div>
        );
      case '/notifications':
        return <NotificationsView onNavigate={navigateTo} />;
      case '/subscription':
        return (
          <div className="home-card-view">
            <h2>Subscription</h2>
            <p>SFamily Premium Plan status, renewal dates, and feature upgrades.</p>
          </div>
        );
      case '/help':
        return (
          <div className="home-card-view">
            <h2>Help & Support</h2>
            <p>24/7 customer support, safety guides, and FAQs.</p>
          </div>
        );
      case '/privacy-policy':
        return (
          <div className="home-card-view">
            <h2>Privacy Policy</h2>
            <p>Data protection guarantees, encryption protocols, and user rights.</p>
          </div>
        );
      case '/home':
      default:
        return <HomeDashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="home-layout-container">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="home-mobile-overlay" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <div className={`home-sidebar-wrap ${mobileSidebarOpen ? 'open' : ''}`}>
        <NavigationDrawer
          currentPath={currentPath}
          onNavigate={navigateTo}
          isStatic={true}
        />
      </div>

      {/* Right Main Content Panel */}
      <div className="home-main-content">
        <header className="home-top-bar">
          <button 
            className="home-hamburger-btn"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle navigation drawer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="home-top-brand" onClick={() => navigateTo('/home')}>
            <img src="/glowinn-logo.jpeg" alt="Logo" className="home-top-logo" />
            <span>FamZone</span>
          </div>
        </header>

        <main className="home-view-body">
          {renderViewContent()}
        </main>
      </div>

      {/* Auth Modal Embedded */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialView={authModal.view}
        onClose={handleCloseModal}
        onViewChange={handleModalViewChange}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
