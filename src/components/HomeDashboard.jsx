import React, { useEffect, useState } from 'react';
import SosModal from './SosModal.jsx';
import { checkIn, getSafetyStatus } from '../services/sfamilyApi.js';
import './HomeDashboard.css';

export default function HomeDashboard({ navigateTo, familyMembers = [] }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [statusDetail, setStatusDetail] = useState('Check in before 9:00 PM.');
  const [checkInLoading, setCheckInLoading] = useState(false);

  const applySafetyStatus = (response) => {
    const status = response?.data;
    const checkInStatus = status?.check_in;
    if (!status || !checkInStatus) return;
    setIsCheckedIn(Boolean(checkInStatus.done_today));
    setStreakCount(checkInStatus.streak?.current || 0);
    setStatusDetail(status.detail || 'Check in before 9:00 PM.');
  };

  useEffect(() => {
    getSafetyStatus()
      .then(applySafetyStatus)
      .catch(() => {
        // Keep the dashboard usable if the status request is temporarily unavailable.
      });
  }, []);

  const handleCheckIn = async () => {
    if (isCheckedIn || checkInLoading) return;
    setCheckInLoading(true);
    try {
      const response = await checkIn({
        note: 'Home safe.',
      });
      applySafetyStatus(response);
    } catch (error) {
      setStatusDetail(error.message || 'Unable to check in right now.');
    } finally {
      setCheckInLoading(false);
    }
  };

  return (
    <div className="home-dashboard">
      {/* Greeting Header */}
      <div className="dash-header">
        <h1 className="dash-greeting">Hi, Devvratbb 👋</h1>
        <p className="dash-subgreeting">You are protected. Your family is connected.</p>
      </div>

      {/* Main Status Banner: All Safe */}
      <div className="dash-status-card">
        <div className="dash-status-left">
          <div className="dash-shield-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div className="dash-status-text">
            <h2>{isCheckedIn ? 'Checked In Safe' : 'All Safe'}</h2>
            <p>{statusDetail}</p>
            <div className="dash-streak-badge">
              <span className="fire-icon">🔥</span>
              <span>{streakCount} day streak</span>
            </div>
          </div>
        </div>
        <div className="dash-status-right">
          <div className="heart-circle-ring">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" className="ring-bg" />
              <circle cx="30" cy="30" r="24" className="ring-progress" />
            </svg>
            <div className="heart-icon-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#00E599">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Quick Actions Grid */}
      <div className="dash-quick-grid">
        <button className="quick-act-card" onClick={() => setSosModalOpen(true)}>
          <div className="quick-act-icon sos-glow">
            <span className="sos-text">SOS</span>
          </div>
          <span className="quick-act-label">Smart SOS</span>
        </button>

        <button className="quick-act-card" onClick={() => navigateTo && navigateTo('/location-sharing')}>
          <div className="quick-act-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
          </div>
          <span className="quick-act-label">Live Location</span>
        </button>

        <button className="quick-act-card" onClick={() => navigateTo && navigateTo('/safety-settings')}>
          <div className="quick-act-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8.5a5.5 5.5 0 0 1 11 0c0 6.5-2.5 8.5-2.5 8.5a2.5 2.5 0 0 1-4.5-1.5v-1"></path>
              <path d="M14 10.5a2 2 0 0 1-2 2"></path>
              <path d="M19 6.5a8 8 0 0 1 0 11"></path>
            </svg>
          </div>
          <span className="quick-act-label">Audio Detect</span>
        </button>

        <button className="quick-act-card" onClick={() => navigateTo && navigateTo('/circles')}>
          <div className="quick-act-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <span className="quick-act-label">Family Circle</span>
        </button>
      </div>

      {/* Daily Safety Check-in Card */}
      <div className="dash-checkin-card">
        <div className="checkin-header">
          <div className="checkin-header-left">
            <div className="checkin-tap-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11V4a1.5 1.5 0 0 1 3 0v5"></path>
                <path d="M15 9V6.5a1.5 1.5 0 0 1 3 0V12a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-1.5a1.5 1.5 0 0 1 3 0V11"></path>
                <circle cx="12" cy="4" r="1.5" fill="currentColor"></circle>
              </svg>
            </div>
            <div>
              <h3>Daily Safety Check-in</h3>
              <p>Tap once a day to confirm you're safe.</p>
            </div>
          </div>
          <div className="checkin-pill">
            <span className="fire-sm">🔥</span>
            <span>{streakCount}</span>
          </div>
        </div>

        {/* Days Streak Row (Live Date India IST) */}
        <div className="checkin-days-row">
          {(() => {
            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const now = new Date();
            const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
            const todayIST = new Date(istString);
            
            const days = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date(todayIST);
              d.setDate(todayIST.getDate() - i);
              const dayLetter = dayNames[d.getDay()];
              const isToday = i === 0;
              // Check status for today vs past days (using streak)
              const checked = isToday ? isCheckedIn : (i <= Math.max(streakCount, 2));
              days.push({
                day: dayLetter,
                checked: Boolean(checked),
                isToday,
                date: d.getDate(),
              });
            }

            return days.map((item, idx) => (
              <div key={idx} className={`day-col ${item.isToday ? 'today-col' : ''}`}>
                <span className="day-label">{item.day}</span>
                <div className={`day-circle ${item.checked ? 'checked' : ''}`}>
                  {item.checked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Main Check-in Action Button */}
        <button 
          className={`dash-safe-btn ${isCheckedIn ? 'confirmed' : ''}`}
          onClick={handleCheckIn}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          <span>{checkInLoading ? 'Checking in...' : isCheckedIn ? "You're Marked Safe!" : "I'm Safe"}</span>
        </button>
      </div>

      {/* My Family Section */}
      <div className="dash-section">
        <div className="section-header">
          <h2>My Family</h2>
          <button className="see-all-link" onClick={() => navigateTo && navigateTo('/circles')}>
            Find people &rarr;
          </button>
        </div>

        <div className="family-cards-row">
          {familyMembers.slice(0, 3).map((member) => (
            <div className="family-card" key={member.id} onClick={() => navigateTo && navigateTo('/circles')}>
              <div className="family-avatar-wrap family-initial-avatar"><span>{member.initials}</span><span className="online-dot" /></div>
              <span className="family-name">{member.name}</span>
              <span className="family-role">{member.relationship}</span>
            </div>
          ))}

          {/* Add Family Card */}
          <button className="add-family-card" onClick={() => navigateTo && navigateTo('/circles')}>
            <div className="add-family-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="18" y1="8" x2="18" y2="14"></line>
                <line x1="15" y1="11" x2="21" y2="11"></line>
              </svg>
            </div>
            <span className="add-family-label">Add Family</span>
          </button>
        </div>
      </div>

      {/* Feature Shortcut Cards Grid (2x2) */}
      <div className="dash-features-grid">
        <div className="feature-card" onClick={() => setSosModalOpen(true)}>
          <div className="feature-icon phone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </div>
          <div className="feature-info">
            <h4>Emergency...</h4>
            <p>Quick call to saved contacts</p>
          </div>
          <span className="feature-arrow">&rsaquo;</span>
        </div>

        <div className="feature-card" onClick={() => navigateTo && navigateTo('/location-sharing')}>
          <div className="feature-icon places">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"></path>
              <path d="M9 21V12h6v9"></path>
              <rect x="10" y="7" width="4" height="3" rx="0.5" fill="currentColor"></rect>
            </svg>
          </div>
          <div className="feature-info">
            <h4>Safe Places</h4>
            <p>Manage your safe locations</p>
          </div>
          <span className="feature-arrow">&rsaquo;</span>
        </div>

        <div className="feature-card" onClick={() => navigateTo && navigateTo('/location-sharing')}>
          <div className="feature-icon journey">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="1.5" fill="currentColor"></circle>
              <circle cx="17" cy="17" r="1.5" fill="currentColor"></circle>
              <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2c.9 0 1.7.6 1.9 1.5L19 11"></path>
            </svg>
          </div>
          <div className="feature-info">
            <h4>Journey Tr...</h4>
            <p>Share your journey with fa...</p>
          </div>
          <span className="feature-arrow">&rsaquo;</span>
        </div>

        <div className="feature-card" onClick={() => navigateTo && navigateTo('/safety-settings')}>
          <div className="feature-icon night">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
          <div className="feature-info">
            <h4>Night Guard</h4>
            <p>Extra protection during night</p>
          </div>
          <span className="feature-arrow">&rsaquo;</span>
        </div>
      </div>

      {/* SOS Alert Modal Popup */}
      <SosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
    </div>
  );
}
