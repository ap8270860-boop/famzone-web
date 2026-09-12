import React, { useEffect, useMemo, useState } from 'react';
import './MyCircles.css';
import './FamilyAvatar.css';

function BackIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>; }
function Avatar({ member, large = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <div className={`circle-avatar ${large ? 'circle-avatar--large' : ''}`}>
    {member.avatar && !imageFailed ? <img src={member.avatar} alt={`${member.name}'s profile`} onError={() => setImageFailed(true)} /> : member.initials}
  </div>;
}

export default function MyCircles({ onBack, members = [] }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('family');
  const [following, setFollowing] = useState(new Set());
  const [notice, setNotice] = useState('');
  useEffect(() => setFollowing(new Set(members.filter((person) => person.isFollowing).map((person) => person.id))), [members]);
  const visiblePeople = useMemo(() => activeTab === 'family' ? members : members.filter((person) => following.has(person.id)), [activeTab, following, members]);
  const toggleFollowing = (id) => setFollowing((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });

  if (selectedMember) {
    const member = selectedMember;
    const isFollowing = following.has(member.id);
    return <section className="circles-container circles-profile-view">
      <header className="circles-top-bar"><button className="circles-icon-button" onClick={() => setSelectedMember(null)} aria-label="Back to family"><BackIcon /></button><span className="profile-handle-title">{member.username}</span><button className="circles-more-button" aria-label="More options">•••</button></header>
      <div className="profile-hero"><Avatar member={member} large /><h1>{member.name}</h1><p>{member.bio}</p></div>
      <div className="user-stats-card"><button onClick={() => setActiveTab('followers')}><strong>{member.followers}</strong><span>Followers</span></button><button onClick={() => setActiveTab('following')}><strong>{member.following}</strong><span>Following</span></button><button onClick={() => setActiveTab('family')}><strong>{member.familyCount}</strong><span>Family</span></button></div>
      <div className="user-actions-row"><button className="profile-outline-button" onClick={() => toggleFollowing(member.id)}>{isFollowing ? 'Following' : 'Follow'}</button><button className="profile-message-button" onClick={() => setNotice(`Message composer for ${member.name} is ready.`)}><span>▢</span> Message</button></div>
      <div className="profile-family-pill">♥&nbsp; {member.relationship}</div><a className="user-phone-card" href={`tel:${member.phone}`}><span>⌕</span>{member.phone}</a>
      <section className="profile-posts"><h2><span>▦</span> {member.posts} posts</h2><div className="post-grid">{Array.from({ length: member.posts }).map((_, index) => <div className="post-placeholder" key={index}><span>♥ {index + 3}</span></div>)}</div></section>
      {notice && <p className="circle-notice" role="status">{notice}</p>}
    </section>;
  }

  return <section className="circles-container circles-directory">
    <header className="circles-top-bar"><button className="circles-icon-button" onClick={onBack} aria-label="Back to home"><BackIcon /></button><div><p className="circles-kicker">YOUR SAFETY NETWORK</p><h1>My Family</h1></div><button className="circles-add-button" onClick={() => setNotice('Invite links will be available here soon.')}>+ Add</button></header>
    <div className="circles-intro"><span className="circles-status-dot" /><p>{members.length} people connected to your safety circle</p></div>
    <div className="circle-tabs" role="tablist" aria-label="Family connections">{[['family', `Family ${members.length}`], ['following', `Following ${following.size}`]].map(([key, label]) => <button key={key} role="tab" aria-selected={activeTab === key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>{label}</button>)}</div>
    <div className="family-directory-list">{visiblePeople.map((member) => <article className="family-directory-card" key={member.id}><button className="family-person-button" onClick={() => setSelectedMember(member)} aria-label={`Open ${member.name}'s profile`}><Avatar member={member} /><span className="family-person-copy"><strong>{member.name}</strong><small>{member.username}</small><em>♥ Family</em></span></button><button className={`follow-button ${following.has(member.id) ? 'is-following' : ''}`} onClick={() => toggleFollowing(member.id)}>{following.has(member.id) ? 'Following' : 'Follow'}</button></article>)}</div>
    {notice && <p className="circle-notice" role="status">{notice}</p>}
  </section>;
}
