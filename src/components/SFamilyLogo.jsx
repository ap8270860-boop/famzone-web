import React from 'react';
import './SFamilyLogo.css';

export default function SFamilyLogo({ size = 'medium', showSubtitle = true, showTagline = false }) {
  return (
    <div className={`sfamily-logo-container size-${size}`}>
      <div className="sfamily-logo-badge">
        <svg viewBox="0 0 120 120" className="sfamily-logo-svg">
          <defs>
            <linearGradient id="bubbleBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E599" />
              <stop offset="50%" stopColor="#00B2FE" />
              <stop offset="100%" stopColor="#E024A5" />
            </linearGradient>
            <radialGradient id="bubbleBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#09253B" />
              <stop offset="100%" stopColor="#030D17" />
            </radialGradient>
            <linearGradient id="familyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00F5A0" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5A0" />
              <stop offset="100%" stopColor="#0083B0" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <path
            d="M60 10 C32 10 10 32 10 60 C10 74 16 86 26 95 L18 110 L38 104 C45 108 52 110 60 110 C88 110 110 88 110 60 C110 32 88 10 60 10 Z"
            fill="url(#bubbleBg)"
            stroke="url(#bubbleBorder)"
            strokeWidth="5"
            filter="url(#logoGlow)"
          />

          <g fill="url(#familyGrad)">
            <circle cx="60" cy="45" r="9" />
            <path d="M44 75 C44 60, 76 60, 76 75 Z" />
            <circle cx="40" cy="50" r="7.5" fill="#00E599" />
            <path d="M27 75 C27 63, 53 63, 53 75 Z" fill="#00E599" opacity="0.9" />
            <circle cx="80" cy="50" r="7.5" fill="#00E599" />
            <path d="M67 75 C67 63, 93 63, 93 75 Z" fill="#00E599" opacity="0.9" />
          </g>

          <g transform="translate(75, 68)">
            <path
              d="M18 2 L32 8 V18 C32 28 18 35 18 35 C18 35 4 28 4 18 V8 L18 2 Z"
              fill="#061A2B"
              stroke="url(#shieldGrad)"
              strokeWidth="3.5"
            />
            <path d="M18 5 V31 M8 17 H28" stroke="#00F5A0" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <div className="sfamily-logo-text-wrap">
        <h1 className="sfamily-brand-title">
          <span className="sfamily-letter-s">S</span>
          <span className="sfamily-word-family">Family</span>
        </h1>

        {showSubtitle && (
          <p className="sfamily-brand-subtitle">
            Your Family's <span className="highlight-safety">Safety</span>,{' '}
            <span className="highlight-care">Care</span>,{' '}
            <span className="highlight-happiness">Happiness</span> &amp;{' '}
            <span className="highlight-ai">AI Companion.</span>
          </p>
        )}

        {showTagline && (
          <div className="sfamily-tagline">
            <span className="sfamily-heart-icon">💖</span> Together, We are Stronger <span className="sfamily-heart-icon">💖</span>
          </div>
        )}
      </div>
    </div>
  );
}
