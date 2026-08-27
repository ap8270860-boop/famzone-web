import React, { useEffect, useState } from 'react';
import { searchPeople } from '../services/sfamilyApi.js';
import './MyCircles.css';

const MOCK_USERS = [
  {
    id: 'faisal',
    username: '@faisalIII.k',
    name: 'Faisal Khan',
    bio: 'Hey i am a great person',
    avatar: '/glowinn-logo.jpeg',
    followers: 3,
    following: 1,
    familyCount: 1,
    relationship: 'Brother',
    isFollowing: true,
    phone: '+918898495502'
  },
  {
    id: 'sarah',
    username: '@sarah_k',
    name: 'Sarah Khan',
    bio: 'Always safe with SFamily',
    avatar: '/glowinn-logo.jpeg',
    followers: 12,
    following: 5,
    familyCount: 3,
    relationship: 'Sister',
    isFollowing: true,
    phone: '+919876543210'
  }
];

export default function MyCircles({ onBack, initialSelectedUser = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser);
  const [users, setUsers] = useState([]);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setUsers([]);
      setSearchError('');
      return undefined;
    }

    const timer = setTimeout(() => {
      searchPeople(query)
        .then(({ data }) => {
          setUsers((data?.results || []).map(user => ({
            id: user.id,
            username: user.username ? `@${user.username}` : '',
            name: user.name,
            bio: user.about || 'SFamily member',
            avatar: user.avatar_url || '/glowinn-logo.jpeg',
            followers: user.counts?.followers || 0,
            following: user.counts?.following || 0,
            familyCount: user.counts?.family || 0,
            relationship: user.relationship?.family_relation || 'Family connection',
            isFollowing: user.relationship?.following === 'accepted',
            phone: user.phone || '',
          })));
          setSearchError('');
        })
        .catch(error => setSearchError(error.message || 'Unable to search right now.'));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredUsers = users;

  // If a user profile is open
  if (selectedUser) {
    return (
      <div className="circles-container">
        {/* Profile Top Bar */}
        <header className="circles-top-bar">
          <button className="circles-back-btn" onClick={() => setSelectedUser(null)} aria-label="Go back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <span className="profile-handle-title">{selectedUser.username}</span>
        </header>

        {/* Profile Content */}
        <div className="user-profile-body">
          {/* Avatar */}
          <div className="user-avatar-hero">
            <img src={selectedUser.avatar} alt={selectedUser.name} />
          </div>

          {/* Name & Bio */}
          <h2 className="user-profile-name">{selectedUser.name}</h2>
          <p className="user-profile-bio">{selectedUser.bio}</p>

          {/* Stats Bar */}
          <div className="user-stats-card">
            <div className="stat-item">
              <span className="stat-value">{selectedUser.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{selectedUser.following}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{selectedUser.familyCount}</span>
              <span className="stat-label">Family</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="user-actions-row">
            <button className="user-follow-btn">
              {selectedUser.isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="user-rel-btn">
              <span className="heart-icon">💚</span> {selectedUser.relationship}
            </button>
          </div>

          {/* Phone Contact Card */}
          <div className="user-phone-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E599" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>{selectedUser.phone}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default Search View
  return (
    <div className="circles-container">
      {/* Search Header Bar */}
      <header className="circles-top-bar search-bar-header">
        <button className="circles-back-btn" onClick={onBack} aria-label="Go back to Home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div className="search-input-wrap">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Name, username or phone" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              &times;
            </button>
          )}
        </div>
      </header>

      {/* Results / Empty State */}
      <div className="circles-body">
        {searchError && <div className="search-empty-state"><h2>Search unavailable</h2><p>{searchError}</p></div>}
        {searchQuery.trim() === '' ? (
          /* Empty Search State matching Screenshot 1 */
          <div className="search-empty-state">
            <div className="empty-user-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <circle cx="18" cy="14" r="3"></circle>
                <line x1="20" y1="16" x2="22" y2="18"></line>
              </svg>
            </div>
            <h2>Find people</h2>
            <p>Search by name or username. To find someone by phone, type the full number.</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          /* Filtered Results List */
          <div className="search-results-list">
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                className="search-user-item"
                onClick={() => setSelectedUser(user)}
              >
                <img src={user.avatar} alt={user.name} className="user-item-avatar" />
                <div className="user-item-info">
                  <h4>{user.name}</h4>
                  <span>{user.username}</span>
                </div>
                <span className="user-item-arrow">&rsaquo;</span>
              </div>
            ))}
          </div>
        ) : (
          /* No Results Found */
          <div className="search-empty-state">
            <h2>No people found</h2>
            <p>No results matching "{searchQuery}". Try typing full phone number or username.</p>
          </div>
        )}
      </div>
    </div>
  );
}
