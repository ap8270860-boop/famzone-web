import React, { useState } from 'react';
import './SosModal.css';
import { startSos } from '../services/sfamilyApi.js';

export default function SosModal({ isOpen, onClose, onSend }) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [error, setError] = useState('');
  React.useEffect(() => { if (isOpen) { setIsSent(false); setError(''); } }, [isOpen]);
  if (!isOpen) return null;

  const handleSendSOS = async () => {
    if (isSending) return;
    setIsSending(true); setError('');
    try {
      const response = await startSos();
      setIsSent(true);
      onSend?.(response);
    } catch (e) { setError(e.message || 'Unable to send SOS. Please retry.'); }
    finally { setIsSending(false); }
  };

  return (
    <div className="sos-modal-overlay" onClick={() => { if (!isSending) onClose(); }}>
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
            <p>The server has received your SOS alert.</p><button className="sos-btn-cancel" onClick={onClose}>Close</button>
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
              Send an emergency alert to your safety network.
            </p>

            {error && <p role="alert">{error}</p>}
            {/* Buttons Row */}
            <div className="sos-modal-actions">
              <button className="sos-btn-cancel" onClick={() => { if (!isSending) onClose(); }} disabled={isSending}>
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
