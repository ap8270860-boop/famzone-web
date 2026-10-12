import React, { useState, useEffect } from 'react';
import NavigationDrawer from './NavigationDrawer.jsx';
import AuthModal from './AuthModal.jsx';
import { ProfileHub, SavedView, LocationView, SafetyFeatures, ContentView, DeleteAccountView, ModeView, ContactsView, AlarmsView, NearbyView, SosView, RemindersView } from './FeatureViews.jsx';
import NotificationsView from './NotificationsView.jsx';
import HomeDashboard from './HomeDashboard.jsx';
import MyCircles from './MyCircles.jsx';
import { getFamilyMembers } from '../services/sfamilyApi.js';
import './Home.css';
import PostsView from './PostsView.jsx';
import { observeAlarms } from '../services/browserSafety.js';

export default function Home() {
  useEffect(observeAlarms, []);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);

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

  useEffect(() => {
    getFamilyMembers().then(setFamilyMembers).catch(() => setFamilyMembers([]));
  }, []);

  const navigateTo = (newPath) => {
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
      setCurrentPath(newPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
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
    if (currentPath.startsWith('/alarms/')) return <AlarmsView key={currentPath} alarmId={decodeURIComponent(currentPath.slice(8))} />;
    switch (currentPath) {
      case '/profile': return <ProfileHub navigate={navigateTo} />;
      case '/posts': return <PostsView />;
      case '/starred-messages': return <SavedView type="starred" navigate={navigateTo} />;
      case '/check-in-history': return <SavedView type="history" navigate={navigateTo} />;
      case '/blocked-accounts': return <SavedView type="blocks" navigate={navigateTo} />;
      case '/circles': return <MyCircles onBack={() => navigateTo('/home')} members={familyMembers} />;
      case '/location-sharing': return <LocationView />;
      case '/safety-settings': return <SafetyFeatures navigate={navigateTo} />;
      case '/notifications': return <NotificationsView onNavigate={navigateTo} />;
      case '/delete-account': return <DeleteAccountView />;
      case '/mode': return <ModeView />;
      case '/check-in-contacts': return <ContactsView onSaved={() => navigateTo('/home')} />;
      case '/alarms': return <AlarmsView />;
      case '/reminders': return <RemindersView />;
      case '/sos': return <SosView />;
      case '/nearby': return <NearbyView />;
      case '/subscription':
        return (
          <div className="home-card-view">
            <h2>Subscription</h2>
            <p>SFamily Premium Plan status, renewal dates, and feature upgrades.</p>
          </div>
        );
      case '/help': return <ContentView key="help" slug="help-and-support" />;
      case '/privacy-policy': return <ContentView key="privacy" slug="privacy-policy" />;
      case '/terms': return <ContentView key="terms" slug="terms-and-conditions" />;
      case '/home':
      default:
        return <HomeDashboard navigateTo={navigateTo} familyMembers={familyMembers} />;
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
          <React.Fragment key={currentPath}>{renderViewContent()}</React.Fragment>
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
