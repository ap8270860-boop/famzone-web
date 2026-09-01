import React, { useEffect, useState, useRef } from 'react';
import ImageCropModal from './ImageCropModal.jsx';
import CustomDatePicker from './CustomDatePicker.jsx';
import { getProfile, updateProfile, uploadAvatar } from '../services/sfamilyApi.js';
import './EditProfile.css';

export default function EditProfile({ onBack }) {
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    about: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    email: '',
    mobile: '',
    isMobileVerified: true,
    emergencyMessage: '',
    useSecurityPhotoPublicly: false,
    showLastSeen: true,
    showOnlineStatus: true,
    readReceipts: true,
    allowGroupInvites: true,
  });

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [securityPhotoUrl, setSecurityPhotoUrl] = useState(null);

  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageSrc: null,
    target: null, // 'profile' | 'security'
    title: ''
  });

  const profileInputRef = useRef(null);
  const securityInputRef = useRef(null);

  const handleFileSelect = (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropModal({
        isOpen: true,
        imageSrc: reader.result,
        target,
        title: target === 'profile' ? 'Crop Profile Photo' : 'Crop Security Photo'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCrop = (croppedUrl) => {
    if (cropModal.target === 'profile') {
      setProfilePhotoUrl(croppedUrl);
    } else if (cropModal.target === 'security') {
      setSecurityPhotoUrl(croppedUrl);
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const applyProfile = (data) => {
    const privacy = data?.privacy || {};
    setProfileData(prev => ({
      ...prev,
      fullName: data?.name || '',
      username: data?.username || '',
      about: data?.about || '',
      dob: data?.date_of_birth || '',
      gender: data?.gender || '',
      bloodGroup: data?.blood_group || '',
      email: data?.email || '',
      mobile: data?.phone || '',
      isMobileVerified: Boolean(data?.phone_verified),
      emergencyMessage: privacy.emergency_message || '',
      useSecurityPhotoPublicly: Boolean(data?.use_alternate_avatar),
      showLastSeen: privacy.show_last_seen ?? true,
      showOnlineStatus: privacy.show_online_status ?? true,
      readReceipts: privacy.show_read_receipts ?? true,
      allowGroupInvites: privacy.allow_group_invites ?? true,
    }));
    setProfilePhotoUrl(data?.avatar_url || null);
    setSecurityPhotoUrl(data?.alternate_avatar_url || null);
  };

  useEffect(() => {
    getProfile().then(({ data }) => {
      applyProfile(data);
    }).catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'mobile' && { isMobileVerified: false }),
    }));
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const response = await updateProfile({
        name: profileData.fullName,
        username: profileData.username,
        about: profileData.about,
        date_of_birth: profileData.dob || null,
        gender: profileData.gender || null,
        blood_group: profileData.bloodGroup || null,
        email: profileData.email || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        emergency_message: profileData.emergencyMessage,
        show_last_seen: profileData.showLastSeen,
        show_online_status: profileData.showOnlineStatus,
        show_read_receipts: profileData.readReceipts,
        allow_group_invites: profileData.allowGroupInvites,
        use_alternate_avatar: profileData.useSecurityPhotoPublicly,
        is_private: false,
      });
      const uploadImage = async (dataUrl, slot) => {
        if (!dataUrl?.startsWith('data:')) return;
        const blob = await (await fetch(dataUrl)).blob();
        await uploadAvatar(new File([blob], `${slot}.jpg`, { type: blob.type }), slot);
      };
      await uploadImage(profilePhotoUrl, 'primary');
      await uploadImage(securityPhotoUrl, 'alternate');
      if (response?.data) applyProfile(response.data.user || response.data);
      setSaving(false);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(error.message || 'Unable to save profile changes.');
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-container">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={profileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e, 'profile')}
      />
      <input 
        type="file" 
        ref={securityInputRef} 
        accept="image/*" 
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e, 'security')}
      />

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        imageSrc={cropModal.imageSrc}
        title={cropModal.title}
        onClose={() => setCropModal({ ...cropModal, isOpen: false })}
        onSave={handleSaveCrop}
      />

      {/* Header */}
      <div className="profile-header-bar">
        <div className="profile-header-brand">
          <img src="/glowinn-logo.jpeg" alt="Logo" className="profile-header-logo" />
          <div className="profile-header-title-wrap">
            <span className="profile-brand-name">SFamily</span>
            <span className="profile-brand-tag">Together. Always Safe.</span>
          </div>
        </div>
      </div>

      <div className="profile-title-section">
        <h1 className="profile-main-title">Edit profile</h1>
        <p className="profile-subtitle">Keep your details current so your circle can reach you.</p>
      </div>

      {saveSuccess && (
        <div className="profile-alert-success">
          Profile changes saved successfully!
        </div>
      )}
      {saveError && <div className="profile-alert-error">{saveError}</div>}

      <form onSubmit={handleSave} className="profile-form">
        {/* Section 1: Photos */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-icon-badge photos-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <div className="profile-card-text">
              <h3>Photos</h3>
              <p>A second photo can stand in for people outside your circle.</p>
            </div>
          </div>

          <div className="photos-row">
            {/* Profile Photo */}
            <div className="photo-item">
              <div 
                className="photo-avatar-ring profile-ring"
                onClick={() => profileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Profile" className="photo-img-preview" />
                ) : (
                  <span className="avatar-placeholder-text">D</span>
                )}
                <button type="button" className="photo-cam-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </button>
              </div>
              <span className="photo-title">Profile photo</span>
              <span className="photo-desc">Your circle sees this</span>
            </div>

            {/* Security Photo */}
            <div className="photo-item">
              <div 
                className="photo-avatar-ring security-ring"
                onClick={() => securityInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                {securityPhotoUrl ? (
                  <img src={securityPhotoUrl} alt="Security" className="photo-img-preview" />
                ) : (
                  <span className="avatar-placeholder-text">D</span>
                )}
                <button type="button" className="photo-cam-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </button>
              </div>
              <span className="photo-title">Security photo</span>
              <span className="photo-desc">Everyone else sees this</span>
            </div>
          </div>

          <div className="profile-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Use security photo publicly</span>
              <span className="toggle-sub">Add a security photo first.</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={profileData.useSecurityPhotoPublicly}
                onChange={(e) => handleChange('useSecurityPhotoPublicly', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Section 2: About you */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-icon-badge about-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <circle cx="9" cy="10" r="2"></circle>
                <line x1="15" y1="8" x2="17" y2="8"></line>
                <line x1="15" y1="12" x2="17" y2="12"></line>
                <line x1="7" y1="16" x2="17" y2="16"></line>
              </svg>
            </div>
            <div className="profile-card-text">
              <h3>About you</h3>
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Full name</label>
            <div className="profile-input-wrapper">
              <span className="input-field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                type="text"
                className="profile-input"
                value={profileData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Username <span className="label-opt">• optional</span></label>
            <div className="profile-input-wrapper">
              <span className="input-field-icon prefix-text">@</span>
              <input
                type="text"
                className="profile-input"
                value={profileData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="abhishek"
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">About <span className="label-opt">• optional</span></label>
            <div className="profile-input-wrapper">
              <span className="input-field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="15" y2="18"></line>
                </svg>
              </span>
              <input
                type="text"
                className="profile-input"
                value={profileData.about}
                onChange={(e) => handleChange('about', e.target.value)}
                placeholder="A short line about you"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Personal */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-icon-badge personal-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="12" rx="2"></rect>
                <path d="M12 2v6"></path>
                <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"></path>
              </svg>
            </div>
            <div className="profile-card-text">
              <h3>Personal</h3>
              <p>Blood group appears on your SOS card.</p>
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Date of birth</label>
            <CustomDatePicker
              value={profileData.dob}
              onChange={(val) => handleChange('dob', val)}
            />
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Gender <span className="label-opt">• optional</span></label>
            <div className="chip-options-row">
              {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                <button
                  type="button"
                  key={g}
                  className={`chip-btn ${profileData.gender === g ? 'active' : ''}`}
                  onClick={() => handleChange('gender', g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Blood group <span className="label-opt">• optional</span></label>
            <div className="chip-options-row grid-blood">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <button
                  type="button"
                  key={bg}
                  className={`chip-btn chip-circle ${profileData.bloodGroup === bg ? 'active' : ''}`}
                  onClick={() => handleChange('bloodGroup', bg)}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Contact */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-icon-badge contact-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="profile-card-text">
              <h3>Contact</h3>
              <p>Changing your email means verifying it again.</p>
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Email <span className="label-opt">• optional</span></label>
            <div className="profile-input-wrapper">
              <span className="input-field-icon">@</span>
              <input
                type="email"
                className="profile-input"
                value={profileData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Mobile number</label>
            <div className="profile-input-wrapper flex-between">
              <span className="input-field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </span>
              <input
                type="tel"
                className="profile-input"
                value={profileData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+91 98765 43210"
                readOnly
              />
              {profileData.mobile && profileData.isMobileVerified && (
                <span className="verified-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Safety */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-icon-badge safety-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className="profile-card-text">
              <h3>Safety</h3>
              <p>Sent with every SOS alert you raise.</p>
            </div>
          </div>

          <div className="profile-input-group">
            <label className="profile-label">Emergency message <span className="label-opt">• optional</span></label>
            <div className="profile-input-wrapper">
              <span className="sos-badge-tag">SOS</span>
              <input
                type="text"
                className="profile-input"
                value={profileData.emergencyMessage}
                onChange={(e) => handleChange('emergencyMessage', e.target.value)}
                placeholder="I need help, please check on me."
              />
            </div>
          </div>
        </div>

        {/* Section 6: Privacy */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-icon-badge privacy-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className="profile-card-text">
              <h3>Privacy</h3>
            </div>
          </div>

          <div className="profile-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Show last seen</span>
              <span className="toggle-sub">Your circle can see when you were last active.</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={profileData.showLastSeen}
                onChange={(e) => handleChange('showLastSeen', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="profile-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Show online status</span>
              <span className="toggle-sub">A green dot while you have the app open.</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={profileData.showOnlineStatus}
                onChange={(e) => handleChange('showOnlineStatus', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="profile-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Read receipts</span>
              <span className="toggle-sub">Others see when you have read their messages.</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={profileData.readReceipts}
                onChange={(e) => handleChange('readReceipts', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="profile-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Allow group invites</span>
              <span className="toggle-sub">Let people add you to circles directly.</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={profileData.allowGroupInvites}
                onChange={(e) => handleChange('allowGroupInvites', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Form Footer Action Buttons */}
        <div className="profile-actions-footer">
          <button type="submit" className="profile-save-btn" disabled={saving}>
            <span>{saving ? 'Saving...' : 'Save changes'}</span>
            {!saving && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            )}
          </button>

          <button type="button" className="profile-change-pw-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-2-2l2 2M3 21l9-9m.5-2.5a4.5 4.5 0 1 1 6.36 6.36 4.5 4.5 0 0 1-6.36-6.36z"></path>
            </svg>
            <span>Change password</span>
          </button>
        </div>
      </form>
    </div>
  );
}
