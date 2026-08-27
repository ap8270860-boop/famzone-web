import React, { useState } from 'react';
import { registerUser, sendOtp, verifyOtp, loginWithPassword } from '../services/sfamilyApi';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialView = 'login', onViewChange, onSuccess }) {
  const [view, setViewState] = useState(initialView); // 'login' | 'signup' | 'otp_verify'
  const [loginMethod, setLoginMethod] = useState('password'); // 'otp' | 'password'
  const [accountType, setAccountType] = useState('adult'); // 'adult' | 'kid' | 'senior'
  const [educationLevel, setEducationLevel] = useState('school'); // 'school' | 'college'

  const [formData, setFormData] = useState({
    mobile: '',
    countryCode: '+91',
    password: '',
    fullName: '',
    email: '',
    referralCode: '',
    otpCode: '',
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccessMsg, setApiSuccessMsg] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('login'); // 'registration' | 'login'

  // Keep internal view in sync with initialView prop when modal opens/changes
  React.useEffect(() => {
    setViewState(initialView);
  }, [initialView]);

  const setView = (newView) => {
    setViewState(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setApiError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccessMsg('');

    if (!formData.fullName.trim()) return setApiError('Please enter your full name.');
    if (!formData.mobile.trim()) return setApiError('Please enter your mobile number.');
    if (!formData.agreeTerms) return setApiError('You must agree to the Terms & Privacy Policy.');

    setLoading(true);
    try {
      const payload = {
        name: formData.fullName,
        phone_country_code: formData.countryCode,
        phone_number: formData.mobile.replace(/\D/g, ''),
        user_type: accountType,
        ...(accountType === 'kid' && { education_stage: educationLevel }),
        ...(formData.email && { email: formData.email }),
        ...(formData.referralCode && { referral_code: formData.referralCode }),
      };

      const res = await registerUser(payload);
      setApiSuccessMsg(res.message || 'Account created! Enter the code sent to verify.');
      
      const debugCode = import.meta.env.DEV ? (res.data?.otp?.debug_code || '') : '';
      if (debugCode) {
        setDebugOtp(debugCode);
      }
      setFormData(prev => ({ ...prev, otpCode: debugCode || '' }));

      setOtpPurpose('registration');
      setView('otp_verify');
    } catch (err) {
      if (err.errors && typeof err.errors === 'object') {
        const firstField = Object.keys(err.errors)[0];
        if (firstField && Array.isArray(err.errors[firstField])) {
          setApiError(err.errors[firstField][0]);
        } else {
          setApiError(err.message || 'Registration failed');
        }
      } else {
        setApiError(err.message || 'Server connection failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccessMsg('');

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!cleanMobile) return setApiError('Please enter your mobile number.');

    setLoading(true);

    if (loginMethod === 'otp') {
      try {
        const res = await sendOtp(formData.countryCode, cleanMobile, 'login');
        setApiSuccessMsg(res.message || 'Verification code sent to your phone.');
        
        const debugCode = import.meta.env.DEV ? (res.data?.otp?.debug_code || '') : '';
        if (debugCode) {
          setDebugOtp(debugCode);
        }
        setFormData(prev => ({ ...prev, otpCode: debugCode || '' }));

        setOtpPurpose('login');
        setView('otp_verify');
      } catch (err) {
        setApiError(err.message || 'Failed to send OTP code');
      } finally {
        setLoading(false);
      }
    } else {
      // Password Login
      if (!formData.password) {
        setLoading(false);
        return setApiError('Please enter your password.');
      }
      try {
        const res = await loginWithPassword(formData.countryCode, cleanMobile, formData.password);
        setApiSuccessMsg('Successfully signed in! Redirecting to home...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (window.location.pathname !== '/home') {
            window.history.pushState({}, '', '/home');
            window.dispatchEvent(new Event('popstate'));
          }
        }, 600);
      } catch (err) {
        if (err.errors?.reason === 'phone_unverified') {
          setApiError('Your number is not verified yet. Sending OTP...');
          try {
            await sendOtp(formData.countryCode, cleanMobile, 'registration');
            setOtpPurpose('registration');
            setView('otp_verify');
          } catch (otpErr) {
            setApiError(otpErr.message || 'Please verify your phone number.');
          }
        } else {
          setApiError(err.message || 'Invalid credentials');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccessMsg('');

    if (!formData.otpCode || formData.otpCode.length < 4) {
      return setApiError('Please enter the verification code.');
    }

    setLoading(true);
    try {
      const cleanMobile = formData.mobile.replace(/\D/g, '');
      const res = await verifyOtp(formData.countryCode, cleanMobile, formData.otpCode, otpPurpose);
      setApiSuccessMsg('Phone verified successfully! Redirecting to home...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (window.location.pathname !== '/home') {
          window.history.pushState({}, '', '/home');
          window.dispatchEvent(new Event('popstate'));
        }
      }, 600);
    } catch (err) {
      setApiError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-icon">
            <img 
              src="/glowinn-logo.jpeg" 
              alt="SFamily Logo" 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(0, 229, 153, 0.25)'
              }} 
            />
          </div>
          <div className="auth-brand-text">
            <span className="auth-brand-title">SFamily</span>
            <span className="auth-brand-tagline">Together. Always Safe.</span>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {apiError && <div className="auth-alert auth-alert--error">{apiError}</div>}
        {apiSuccessMsg && <div className="auth-alert auth-alert--success">{apiSuccessMsg}</div>}

        {/* View Titles */}
        {view === 'login' && (
          <div className="auth-title-section">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to keep your circle connected and protected.</p>
          </div>
        )}
        {view === 'signup' && (
          <div className="auth-title-section">
            <h2 className="auth-title">Create your circle</h2>
            <p className="auth-subtitle">A minute to set up, and your family is protected.</p>
          </div>
        )}
        {view === 'otp_verify' && (
          <div className="auth-title-section">
            <h2 className="auth-title">Verify your number</h2>
            <p className="auth-subtitle">Enter the code sent to {formData.countryCode} {formData.mobile}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="auth-body">
          {view === 'login' && (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLogin} className="auth-form" autoComplete="off">
              <div className="auth-segmented-control">
                <button
                  type="button"
                  className={`auth-segment-btn ${loginMethod === 'otp' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('otp')}
                >
                  OTP
                </button>
                <button
                  type="button"
                  className={`auth-segment-btn ${loginMethod === 'password' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('password')}
                >
                  Password
                </button>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Mobile number</label>
                <div className="auth-input-wrapper auth-mobile-wrapper">
                  <span className="auth-field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                  </span>
                  <div className="auth-country-select">
                    <span>{formData.countryCode}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <div className="auth-field-divider"></div>
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="98765 43210"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    autoComplete="off"
                    name="mobile-no-autofill"
                  />
                </div>
              </div>

              {loginMethod === 'password' && (
                <div className="auth-input-group">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-field-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Your password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      autoComplete="off"
                      name="password-no-autofill"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Please wait...' : loginMethod === 'otp' ? 'Send OTP' : 'Sign in'}</span>
                {!loading && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>

              <div className="auth-footer-text">
                New to SFamily?{' '}
                <button type="button" className="auth-link-btn" onClick={() => setView('signup')}>
                  Create an account
                </button>
              </div>
            </form>
          )}

          {view === 'signup' && (
            /* ================= SIGNUP FORM ================= */
            <form onSubmit={handleRegister} className="auth-form" autoComplete="off">
              <div className="auth-input-group">
                <label className="auth-label">Who is this account for?</label>
                <div className="auth-role-grid">
                  <button
                    type="button"
                    className={`auth-role-card ${accountType === 'adult' ? 'active' : ''}`}
                    onClick={() => setAccountType('adult')}
                  >
                    <span className="auth-role-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <span className="auth-role-title">Adult</span>
                    <span className="auth-role-desc">Full access</span>
                  </button>

                  <button
                    type="button"
                    className={`auth-role-card ${accountType === 'kid' ? 'active' : ''}`}
                    onClick={() => setAccountType('kid')}
                  >
                    <span className="auth-role-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                    </span>
                    <span className="auth-role-title">Child</span>
                    <span className="auth-role-desc">Guarded</span>
                  </button>

                  <button
                    type="button"
                    className={`auth-role-card ${accountType === 'senior' ? 'active' : ''}`}
                    onClick={() => setAccountType('senior')}
                  >
                    <span className="auth-role-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </span>
                    <span className="auth-role-title">Senior</span>
                    <span className="auth-role-desc">Simplified</span>
                  </button>
                </div>
              </div>

              {accountType === 'kid' && (
                <div className="auth-input-group">
                  <label className="auth-label">Still studying at</label>
                  <div className="auth-toggle-group">
                    <button
                      type="button"
                      className={`auth-toggle-btn ${educationLevel === 'school' ? 'active' : ''}`}
                      onClick={() => setEducationLevel('school')}
                    >
                      School
                    </button>
                    <button
                      type="button"
                      className={`auth-toggle-btn ${educationLevel === 'college' ? 'active' : ''}`}
                      onClick={() => setEducationLevel('college')}
                    >
                      College
                    </button>
                  </div>
                </div>
              )}

              <div className="auth-input-group">
                <label className="auth-label">Full name</label>
                <div className="auth-input-wrapper">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Enter your name"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Mobile number</label>
                <div className="auth-input-wrapper auth-mobile-wrapper">
                  <div className="auth-country-select">
                    <span>{formData.countryCode}</span>
                  </div>
                  <div className="auth-field-divider"></div>
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="98765 43210"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">
                  Email <span className="auth-optional">• optional</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="auth-terms">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                  />
                  <span className="auth-checkbox-custom"></span>
                  <span>
                    I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Registering...' : 'Create account'}</span>
              </button>

              <div className="auth-footer-text">
                Already have an account?{' '}
                <button type="button" className="auth-link-btn" onClick={() => setView('login')}>
                  Sign in
                </button>
              </div>
            </form>
          )}

          {view === 'otp_verify' && (
            /* ================= OTP VERIFICATION FORM ================= */
            <form onSubmit={handleVerifyOtp} className="auth-form" autoComplete="off">
              {debugOtp && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(0, 229, 153, 0.12)',
                  border: '1px solid rgba(0, 229, 153, 0.35)',
                  borderRadius: '12px',
                  color: '#00E599',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>🔑 Your OTP Code: <strong>{debugOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleChange('otpCode', debugOtp)}
                    style={{
                      background: '#00E599',
                      color: '#06111e',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div className="auth-input-group">
                <label className="auth-label">Enter 6-digit Code</label>
                <div className="auth-input-wrapper">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="000000"
                    maxLength={6}
                    value={formData.otpCode}
                    onChange={(e) => handleChange('otpCode', e.target.value)}
                    autoComplete="one-time-code"
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
              </button>

              <div className="auth-footer-text">
                Didn't receive code?{' '}
                <button 
                  type="button" 
                  className="auth-link-btn" 
                  onClick={() => sendOtp(formData.countryCode, formData.mobile.replace(/\D/g, ''), otpPurpose)}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
