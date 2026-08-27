import React, { useState } from 'react';
import './SosModal.css';

export default function SosModal({ isOpen, onClose, onSend }) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendSOS = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      if (onSend) onSend();
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="sos-modal-overlay" onClick={onClose}>
      <div className="sos-modal-card" onClick={(e) => e.stopPropagation()}>
        {isSent ? (
          <div className="sos-modal-sent">
            <div className="sos-sent-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00E599" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>SOS Alert Sent!</h2>
            <p>Your family circle and emergency contacts have been notified with your live GPS location.</p>
          </div>
        ) : (
          <>
            {/* Top Pink Rounded 6-point Star / Asterisk Icon matching screenshot */}
            <div className="sos-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff4d67">
                <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v4.67l4.04-2.33a1.5 1.5 0 0 1 1.5 2.6l-4.04 2.33 4.04 2.33a1.5 1.5 0 1 1-1.5 2.6L13.5 13.5v4.67a1.5 1.5 0 0 1-3 0v-4.67l-4.04 2.33a1.5 1.5 0 1 1-1.5-2.6l4.04-2.33-4.04-2.33a1.5 1.5 0 0 1 1.5-2.6L10.5 8.17V3.5A1.5 1.5 0 0 1 12 2z"/>
              </svg>
            </div>

            {/* Title & Description */}
            <h2 className="sos-modal-title">Send an SOS alert?</h2>
            <p className="sos-modal-desc">
              Everyone in your circle gets a push, an in-app alert and an SMS with your current location.
            </p>

            {/* Buttons Row */}
            <div className="sos-modal-actions">
              <button className="sos-btn-cancel" onClick={onClose} disabled={isSending}>
                Cancel
              </button>
              <button 
                className={`sos-btn-confirm ${isSending ? 'sending' : ''}`}
                onClick={handleSendSOS}
                disabled={isSending}
              >
                {isSending ? 'Sending Alert...' : 'Send SOS'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
