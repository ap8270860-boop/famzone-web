import { useEffect, useRef, useState } from 'react';
import * as api from '../services/sfamilyApi.js';
import './FeatureViews.css';
import './ChatFeatures.css';

export default function GroupCreator({ onClose, onCreated }) {
  const [people, setPeople] = useState([]), [selected, setSelected] = useState([]), [search, setSearch] = useState('');
  const [details, setDetails] = useState(false), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const dialogRef = useRef(null);
  useEffect(() => {
    let live = true;
    api.getGroupCandidates('connections').then(response => {
      if (!live) return;
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.people || data?.candidates || data?.users || data?.results || []);
      setPeople(list); setLoading(false);
    }).catch(e => { if (live) { setError(e.message); setLoading(false); } });
    const previous = document.activeElement;
    dialogRef.current?.querySelector('button')?.focus();
    return () => { live = false; previous?.focus(); };
  }, []);
  const toggle = id => setSelected(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev,id]);
  const visible = people.filter(person => `${person.name || ''} ${person.username || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="chat-feature-overlay" onClick={() => { if (!busy) onClose(); }}><div ref={dialogRef} className="home-card-view feature-panel chat-feature-dialog" role="dialog" aria-modal="true" aria-label="New group" onClick={event => event.stopPropagation()} onKeyDown={event => {
    if (event.key === 'Escape' && !busy) onClose();
    if (event.key === 'Tab') { const controls = event.currentTarget.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)'); const first=controls[0],last=controls[controls.length-1]; if(event.shiftKey && document.activeElement === first){event.preventDefault();last?.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();} }
  }}>
    <button disabled={busy} onClick={onClose}>Close</button><h2>New group</h2>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Loading people…</p> : !details ? <>
      <p>{selected.length ? `${selected.length} selected` : 'Add people'}</p>
      <div className="chat-selected-people">{people.filter(person => selected.includes(person.id)).map(person => <button key={person.id} onClick={() => toggle(person.id)} aria-label={`Remove ${person.name}`}>{person.name} ×</button>)}</div>
      <label>Search<input value={search} onChange={event => setSearch(event.target.value)} /></label>
      {!visible.length && <p>No people found.</p>}
      {visible.map(person => <label key={person.id}><input type="checkbox" checked={selected.includes(person.id)} onChange={() => toggle(person.id)} />{person.avatar_url && <img className="chat-candidate-avatar" src={person.avatar_url} alt="" />}{person.name} {person.username ? `@${person.username.replace(/^@/,'')}` : ''}</label>)}
      <button disabled={!selected.length} onClick={() => setDetails(true)}>Next · {selected.length} {selected.length === 1 ? 'person' : 'people'}</button>
    </> : <form onSubmit={async event => {
      event.preventDefault(); if (busy) return;
      const form = new FormData(event.currentTarget), title = form.get('title').trim(), avatar = form.get('avatar');
      if (!title) { setError('Enter a group name.'); return; }
      const payload = avatar?.size ? form : {title,scope:'connections',member_ids:selected};
      if (payload instanceof FormData) { payload.set('title',title); payload.set('scope','connections'); payload.set('member_ids',JSON.stringify(selected)); }
      setBusy(true); setError('');
      try { const response = await api.createGroup(payload); onCreated(response.data?.conversation || response.data); }
      catch(e) { setError(e.message || 'Unable to create group.'); }
      finally { setBusy(false); }
    }}><fieldset disabled={busy}><label>Group name<input name="title" required maxLength={80} autoFocus /></label><label>Group photo (optional)<input name="avatar" type="file" accept="image/*" /></label><p>{selected.length} members selected</p><button type="button" onClick={() => setDetails(false)}>Back</button><button>{busy ? 'Creating…' : 'Create group'}</button></fieldset></form>}
  </div></div>;
}
