import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as api from '../services/sfamilyApi.js';
import { enableAlarmSound, ringAlarm } from '../services/browserSafety.js';
import EditProfile from './EditProfile.jsx';
import './FeatureViews.css';
import ModePicker from './ModePicker.jsx';
import EmergencySos from './EmergencySos.jsx';
import './ProfileHub.css';
import ImageCropModal from './ImageCropModal.jsx';
import { Camera, Pencil, QrCode, Grid3X3, Star, CalendarCheck, Ban, CircleHelp, Gavel, ShieldCheck, Trash2, LogOut, ChevronRight, X } from 'lucide-react';
import { createProfileQr } from '../services/profileQr.js';
const rows = (value, key) => Array.isArray(value) ? value : Array.isArray(value?.[key]) ? value[key] : [];
function useFeature(loader) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const reload = useCallback(async () => {
    setError('');
    try {
      setData((await loaderRef.current()).data);
    } catch (e) {
      setError(e.message || 'Unable to load.');
    }
  }, []);
  useEffect(() => {
    let live = true;
    loaderRef.current().then(r => {
      if (live) setData(r.data);
    }).catch(e => {
      if (live) setError(e.message);
    });
    return () => {
      live = false;
    };
  }, []);
  const run = async action => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
      await reload();
    } catch (e) {
      setError(e.message || 'Unable to save.');
    } finally {
      setBusy(false);
    }
  };
  return {
    data,
    error,
    busy,
    reload,
    run,
    setData,
    setError
  };
}
function Panel({
  title,
  state,
  className = '',
  children
}) {
  return <div className={`home-card-view feature-panel ${className}`}><h2>{title}</h2>{state?.error && <p className="feature-error" role="alert">{state.error} <button onClick={state.reload}>Retry</button></p>}{state && !state.data && !state.error ? <p className="feature-loading" role="status">Loading…</p> : <fieldset className="feature-content" disabled={state?.busy}>{children}</fieldset>}</div>;
}
function Links({
  navigate
}) {
  return <p className="feature-navigation">{[['Home', '/home'], ['Chats', '/chat'], ['SOS', '/sos'], ['Nearby help', '/nearby'], ['Safety alarms', '/alarms'], ['Check-in contacts', '/check-in-contacts'], ['Current mode', '/mode']].map(([label, path]) => <button key={path} className="home-action-btn" onClick={() => navigate(path)}>{label}</button>)}</p>;
}
export function SafetyFeatures({
  navigate
}) {
  return <Panel title="Safety Settings"><Links navigate={navigate} /></Panel>;
}
export function ProfileHub({ navigate }) {
  const s = useFeature(api.getProfileDetails);
  const [editing, setEditing] = useState(false);
  const [connections, setConnections] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef(null);
  const slotRef = useRef('primary');
  const user = s.data?.user || s.data || {};
  const initials = (user.name || user.username || '?').trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const loadConnections = async kind => {
    if (!user.id || connectionLoading) return;
    setConnectionLoading(true);
    setConnections({ kind, people: [] });
    try {
      const response = await (kind === 'followers' ? api.getFollowers(user.id) : api.getFollowing(user.id));
      setConnections({ kind, people: rows(response.data, 'results').length ? rows(response.data, 'results') : rows(response.data, kind).length ? rows(response.data, kind) : rows(response.data, 'users') });
    } catch (error) { s.setError(error.message); setConnections(null); }
    finally { setConnectionLoading(false); }
  };
  const choosePhoto = slot => { slotRef.current = slot; fileRef.current?.click(); };
  const onFile = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { s.setError('Choose an image file.'); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto({ slot: slotRef.current, source: reader.result });
    reader.onerror = () => s.setError('Unable to read this photo. Try another image.');
    reader.readAsDataURL(file);
  };
  const savePhoto = async dataUrl => {
    const slot = photo.slot;
    await s.run(async () => {
      const blob = await (await fetch(dataUrl)).blob();
      await api.uploadAvatar(new File([blob], `${slot}.jpg`, { type: blob.type }), slot);
    });
  };
  const accountItems = [
    { label: 'My QR code', icon: QrCode, action: () => setQrOpen(true) },
    { label: 'My posts', icon: Grid3X3, path: '/posts' },
    { label: 'Starred messages', icon: Star, path: '/starred-messages' },
    { label: 'Check-in history', icon: CalendarCheck, path: '/check-in-history' },
    { label: 'Blocked accounts', icon: Ban, path: '/blocked-accounts' },
  ];
  const supportItems = [
    { label: 'Help & support', icon: CircleHelp, path: '/help' },
    { label: 'Terms & conditions', icon: Gavel, path: '/terms' },
    { label: 'Privacy policy', icon: ShieldCheck, path: '/privacy-policy' },
  ];
  const dangerItems = [
    { label: 'Delete account', icon: Trash2, path: '/delete-account' },
    { label: 'Sign out', icon: LogOut, action: () => s.run(async () => {
      await api.logoutUser();
      window.dispatchEvent(new Event('sfamily:unauthorized'));
    }) },
  ];
  const menuGroup = (items, label, danger = false) => (
    <nav className={`profile-menu-group${danger ? ' profile-menu-danger' : ''}`} aria-label={label}>
      {items.map(({ label, icon: Icon, path, action }) => (
        <button className="profile-menu-row" key={label} disabled={s.busy} onClick={action || (() => navigate(path))}>
          <Icon className="profile-menu-icon" size={22} aria-hidden="true" />
          <span>{label}</span><ChevronRight className="profile-menu-chevron" size={20} aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
  if (editing) return <EditProfile onBack={() => { setEditing(false); s.reload(); }} />;
  return (
    <div className="profile-hub" aria-busy={s.busy || !s.data && !s.error}>
      <header className="profile-identity">
        <h1>{user.name || 'My profile'}</h1>
        {user.username && <p>@{user.username.replace(/^@/, '')}</p>}
      </header>
      {s.error && <div className="profile-feedback" role="alert">{s.error}<button onClick={s.reload}>Retry</button></div>}
      {!s.data && !s.error ? <p className="profile-loading" role="status">Loading your profile…</p> : s.data && <>
        <input ref={fileRef} className="profile-file-input" type="file" accept="image/*" aria-label="Choose profile photo" onChange={onFile} />
        <div className="profile-photos">
          {[['primary', 'Profile photo', 'Your circle sees this', user.avatar_url], ['alternate', 'Security photo', 'Everyone else sees this', user.alternate_avatar_url]].map(([slot, label, caption, url]) => (
            <div className="profile-photo" key={slot}>
              <button className={`profile-photo-button profile-photo-${slot}`} onClick={() => choosePhoto(slot)} disabled={s.busy} aria-label={`Change ${label.toLowerCase()}`}>
                <span className="profile-photo-image">{url ? <img src={url} alt={label} /> : <span className="profile-photo-initials">{initials}</span>}</span>
                <span className="profile-camera"><Camera size={19} aria-hidden="true" /></span>
              </button>
              <p>{label}<span>{caption}</span></p>
            </div>
          ))}
        </div>
        <div className="profile-counts" aria-label="Your connections">
          {[['followers', 'Followers'], ['following', 'Following'], ['family', 'Family']].map(([kind, label]) => (
            <button key={kind} disabled={s.busy || connectionLoading} onClick={() => kind === 'family' ? navigate('/circles') : loadConnections(kind)}>
              <strong>{user.counts?.[kind] ?? user[`${kind}_count`] ?? '—'}</strong><span>{label}</span>
            </button>
          ))}
        </div>
        <button className="profile-edit-button" disabled={s.busy} onClick={() => setEditing(true)}><Pencil size={21} aria-hidden="true" />Edit profile</button>
        {menuGroup(accountItems, 'Profile activity')}
        {menuGroup(supportItems, 'Help and policies')}
        {menuGroup(dangerItems, 'Account actions', true)}
        {s.busy && <p className="profile-loading" role="status">Saving…</p>}
      </>}
      {photo && <ImageCropModal key={photo.source} isOpen imageSrc={photo.source} title={photo.slot === 'primary' ? 'Profile photo' : 'Security photo'} onClose={() => setPhoto(null)} onSave={savePhoto} />}
      {connections && <ProfileDialog title={connections.kind === 'followers' ? 'Followers' : 'Following'} onClose={() => setConnections(null)}>
        {connectionLoading ? <p role="status">Loading connections…</p> : connections.people.length ? connections.people.map(person => <div className="profile-connection" key={person.id}><strong>{person.name}</strong><span>{person.username ? `@${person.username.replace(/^@/, '')}` : ''}</span></div>) : <p>No connections yet.</p>}
      </ProfileDialog>}
      {qrOpen && <ProfileDialog title="My QR code" onClose={() => setQrOpen(false)}><ProfileQr username={user.username || String(user.id)} /></ProfileDialog>}
    </div>
  );
}
function ProfileDialog({ title, onClose, children }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const keyDown = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', keyDown);
    return () => { document.removeEventListener('keydown', keyDown); previousFocus?.focus(); };
  }, []);
  return <div className="profile-dialog-overlay" onClick={onClose}><div className="profile-dialog" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const focusable = event.currentTarget.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}><header><h2>{title}</h2><button ref={closeRef} aria-label="Close" onClick={onClose}><X size={22} aria-hidden="true" /></button></header>{children}</div></div>;
}
function ProfileQr({ username }) {
  const [copied, setCopied] = useState(false), [error, setError] = useState('');
  const text = username.replace(/^@/, '');
  let matrix;
  try { matrix = createProfileQr(text); } catch { return <p role="alert">This username is too long to display as a QR code.</p>; }
  return <div className="profile-qr"><svg viewBox={`0 0 ${matrix.length + 8} ${matrix.length + 8}`} role="img" aria-label={`QR code for ${text}`}><rect width="100%" height="100%" className="profile-qr-paper" />{matrix.flatMap((row, y) => row.flatMap((dark, x) => dark ? <rect key={`${x}-${y}`} x={x + 4} y={y + 4} width="1" height="1" className="profile-qr-ink" /> : []))}</svg><strong>@{text}</strong><p>Scan this code to get my username, then search for me in FamZone.</p><button data-state={copied ? 'success' : 'default'} onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setError('Could not copy. You can select the username above.'); } }}>{copied ? 'Copied' : 'Copy username'}</button>{error && <p role="alert">{error}</p>}</div>;
}
export function ModeView() {
  const back = () => { window.history.pushState({}, '', '/home'); window.dispatchEvent(new PopStateEvent('popstate')); };
  return <ModePicker onBack={back} />;
}
export function ContactsView({
  onSaved
}) {
  const s = useFeature(api.getCheckInContacts);
  const [selected, setSelected] = useState(null);
  const chosen = selected ?? rows(s.data?.contacts).map(p => String(p.id));
  return <Panel title="Check-in contacts" state={s}><p>Select family to notify. Select nobody for private check-ins.</p>{rows(s.data?.available).map(p => <p key={p.id}><label><input type="checkbox" checked={chosen.includes(String(p.id))} onChange={e => setSelected(e.target.checked ? [...chosen, String(p.id)] : chosen.filter(id => id !== String(p.id)))} />{p.name}</label></p>)}<button className="home-action-btn" disabled={chosen.length > (s.data?.max ?? 10)} onClick={() => s.run(async () => {
      await api.saveCheckInContacts(chosen);
      onSaved?.();
    })}>Save contacts</button></Panel>;
}
function PageBlocks({
  page
}) {
  const safeUrl = value => /^(https?:|mailto:|tel:)/i.test(value || '') ? value : undefined;
  return <>{rows(page?.blocks).map((block, i) => {
      const content = rows(block.runs).map((run, j) => {
        let text = run.text;
        if (run.bold) text = <strong>{text}</strong>;
        if (run.italic) text = <em>{text}</em>;
        return run.href && safeUrl(run.href) ? <a key={j} href={safeUrl(run.href)} target="_blank" rel="noreferrer">{text}</a> : <React.Fragment key={j}>{text}</React.Fragment>;
      });
      if (block.type === 'divider') return <hr key={i} />;
      if (block.type === 'image') return safeUrl(block.url) ? <img key={i} src={block.url} alt="" style={{
        maxWidth: '100%'
      }} /> : null;
      if (block.type === 'heading') return <h3 key={i}>{content}</h3>;
      return <p key={i} style={{
        whiteSpace: 'pre-wrap'
      }}>{block.type === 'bullet' ? block.ordered ? `${block.index}. ` : '• ' : ''}{content}</p>;
    })}</>;
}
export function ContentView({
  slug
}) {
  const s = useFeature(() => api.getContentPage(slug));
  return <Panel title={s.data?.title || 'Information'} state={s}><p>{s.data?.summary}</p><PageBlocks page={s.data} /></Panel>;
}
export function DeleteAccountView() {
  const s = useFeature(() => api.getContentPage('delete-account'));
  const [confirm, setConfirm] = useState(''),
    [reason, setReason] = useState('');
  return <Panel title="Delete account" state={s}><PageBlocks page={s.data} /><p>This permanently closes your account. Type DELETE to confirm.</p><label>Confirmation <input value={confirm} onChange={e => setConfirm(e.target.value)} /></label><p><label>Reason (optional) <textarea value={reason} onChange={e => setReason(e.target.value)} /></label></p><button className="feature-danger" disabled={confirm !== 'DELETE'} onClick={() => s.run(async () => {
      await api.deleteAccount(confirm, reason);
      localStorage.removeItem('sfamily_token');
      window.dispatchEvent(new Event('sfamily:unauthorized'));
    })}>Delete my account</button></Panel>;
}
export function SavedView({
  type,
  navigate
}) {
  const [page, setPage] = useState(1);
  const loader = async () => {
    if (type === 'blocks') return api.getBlockedAccounts();
    if (type === 'history') return api.getCheckInHistory();
    if (type === 'starred') return api.getStarredMessages();
    const p = await api.getProfile();
    return api.getUserPosts((p.data?.user || p.data).id);
  };
  const s = useFeature(loader);
  const key = {
    blocks: 'blocked',
    history: 'check_ins',
    starred: 'messages',
    posts: 'posts'
  }[type];
  const list = rows(s.data, key);
  return <Panel title={{
    blocks: 'Blocked accounts',
    history: 'Check-in history',
    starred: 'Starred messages',
    posts: 'My posts'
  }[type]} state={s} className={type === 'history' ? 'check-in-history-panel' : ''}>
    {type === 'posts' && <form onSubmit={e => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      s.run(() => api.createPost(form));
    }}><label>Photo <input required type="file" name="image" accept="image/*" /></label><label>Caption <input name="caption" /></label><button>Publish post</button></form>}
    {!list.length && <p>No items yet.</p>}{list.map((item, i) => <section key={item.id || i}><h3>{item.name || item.user?.name || item.sender?.name || item.date || ''}</h3>{item.image_url && <img src={item.image_url} alt={item.caption || 'Post'} style={{
        maxWidth: '100%'
      }} />}<p>{item.caption || item.body || item.note || item.checked_in_at}</p>{type === 'blocks' && <button onClick={() => s.run(() => api.unblockUser(item.user?.id || item.id))}>Unblock</button>}{type === 'posts' && <button className="feature-danger feature-secondary" onClick={() => {
        if (window.confirm('Delete this post?')) s.run(() => api.deletePost(item.id)).then(() => setPage(1));
      }}>Delete</button>}{type === 'starred' && <><button onClick={() => navigate('/chat')}>Open chats</button><button onClick={() => s.run(() => api.starMessage(item.id)).then(() => setPage(1))}>Unstar</button></>}</section>)}
    {['posts', 'starred'].includes(type) && (s.data?.has_more || s.data?.pagination?.has_more) && <button onClick={async () => {
      try {
        const next = page + 1;
        const profile = type === 'posts' ? (await api.getProfile()).data : null;
        const response = type === 'starred' ? await api.getStarredMessages(next) : await api.getUserPosts((profile?.user || profile).id, next);
        s.setData({
          ...response.data,
          [key]: [...list, ...rows(response.data, key)]
        });
        setPage(next);
      } catch (e) {
        s.setError(e.message);
      }
    }}>Load more</button>}
  </Panel>;
}
export function NearbyView() {
  const s = useFeature(async () => {
    const [p, t, r] = await Promise.all([api.getNearbyPeople(), api.getNearbySettings(), api.getHelpRequests()]);
    return {
      data: {
        ...p.data,
        settings: t.data,
        requests: r.data
      }
    };
  });
  const [note, setNote] = useState('');
  return <Panel title="Nearby help" state={s}><label><input type="checkbox" checked={Boolean(s.data?.settings?.discoverable)} onChange={e => s.run(() => api.updateNearbySettings({
        discoverable: e.target.checked
      }))} />Allow nearby discovery</label><button onClick={() => s.run(() => api.updateNearbySettings({
      pause_minutes: 60
    }))}>Pause for an hour</button><p>{s.data?.reason}</p><label>Help request note <input value={note} onChange={e => setNote(e.target.value)} /></label>{rows(s.data?.people).map(p => <p key={p.id}>{p.name} {p.distance_band}<button onClick={() => s.run(() => api.requestHelp({
        user_id: p.id,
        note
      }))}>Request help</button></p>)}{s.data?.next_cursor && <button onClick={() => (async () => {
      try {
        const next = await api.getNearbyPeople({
          cursor: s.data.next_cursor
        });
        s.setData(prev => ({
          ...prev,
          people: [...rows(prev.people), ...rows(next.data?.people)],
          next_cursor: next.data.next_cursor
        }));
      } catch (e) {
        s.setError(e.message);
      }
    })()}>Load more</button>}{['incoming', 'outgoing', 'active'].map(group => <section key={group}><h3>{group}</h3>{rows(s.data?.requests?.[group]).map(r => <p key={r.id}>{r.person?.name} {r.note} {r.status}{(group === 'incoming' ? ['accept', 'decline'] : group === 'outgoing' ? ['cancel'] : ['complete']).map(action => <button key={action} onClick={() => s.run(() => api.respondToHelp(r.id, action))}>{action}</button>)}</p>)}</section>)}</Panel>;
}
export function AlarmsView({
  alarmId
}) {
  const s = useFeature(() => alarmId ? api.getAlarm(alarmId) : api.getAlarms());
  const [watchers, setWatchers] = useState([]),
    [seconds, setSeconds] = useState(0);
  const alarm = alarmId ? s.data?.alarm : s.data?.active;
  useEffect(() => {
    if (!alarm || alarm.seconds_remaining == null) return;
    const deadline = Date.now() + alarm.seconds_remaining * 1000;
    const tick = () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [alarm]);
  useEffect(() => {
    const timer = setInterval(s.reload, 30000);
    const resume = () => {
      if (!document.hidden) s.reload();
    };
    document.addEventListener('visibilitychange', resume);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', resume);
    };
  }, []);
  const options = s.data?.options || {};
  return <Panel title="Safety alarms" state={s}><button onClick={async () => {
      try {
        await enableAlarmSound();
        ringAlarm();
      } catch (e) {
        s.setError(e.message);
      }
    }}>Enable & preview browser alarm sound</button><p>Browser ringing requires this page to stay open. Your deadline and family escalation are managed by the server.</p>
    {alarm && <section><h3>{alarm.label}</h3><p>{alarm.status} {alarm.status === 'armed' && `${Math.floor(seconds / 60)}m ${seconds % 60}s`}</p>{!alarmId && <><button onClick={() => s.run(() => api.answerAlarm(alarm.id))}>I'm safe / End alarm</button>{alarm.can_extend && (options.extensions || [30, 60, 120]).map(m => <button key={m} onClick={() => s.run(() => api.extendAlarm(alarm.id, m))}>Extend {m}m</button>)}</>}{alarm.voice?.url && <audio controls src={alarm.voice.url} />}<p>{alarm.ring?.detail}</p>{rows(alarm.ring?.steps).map(step => <p key={step.id}>{step.person?.name} — {step.status}</p>)}</section>}
    {s.data?.watch?.can_answer && <p><button onClick={() => s.run(() => api.respondToAlarmWatch(s.data.watch.id, true))}>I'll help</button><button onClick={() => s.run(() => api.respondToAlarmWatch(s.data.watch.id, false))}>Pass on</button></p>}
    {!alarmId && !alarm && <form onSubmit={e => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const voice = form.get('voice');
      const payload = {
        label: form.get('label'),
        minutes: Number(form.get('minutes')),
        ringtone: form.get('ringtone'),
        watchers,
        wait_minutes: Number(form.get('wait_minutes'))
      };
      if (voice?.size) {
        const multipart = new FormData();
        Object.entries(payload).forEach(([k, v]) => multipart.append(k, Array.isArray(v) ? JSON.stringify(v) : v));
        multipart.append('voice', voice);
        s.run(() => api.createAlarm(multipart));
      } else s.run(() => api.createAlarm(payload));
    }}>
      <p><label>Label <input name="label" required maxLength={120} /></label></p><p><label>Minutes <input name="minutes" type="number" required min={options.min_minutes || 5} max={options.max_minutes || 1440} defaultValue={30} /></label></p><p><label>Ringtone <select name="ringtone">{(options.ringtones || ['gentle', 'chime', 'bell']).map(t => <option key={t} value={t}>{t}</option>)}</select></label></p><p><label>Wait between family watchers (minutes) <input type="number" name="wait_minutes" min="1" defaultValue={5} /></label></p><p>Select watchers in escalation order; leave empty to notify all family.</p>{rows(s.data?.watchers).map(p => <p key={p.id}><label><input type="checkbox" checked={watchers.includes(p.id)} onChange={e => setWatchers(e.target.checked ? [...watchers, p.id] : watchers.filter(id => id !== p.id))} />{p.name} {watchers.includes(p.id) && `(${watchers.indexOf(p.id) + 1})`}</label></p>)}<p><label>Voice note (optional) <input type="file" name="voice" accept="audio/*" /></label></p><button className="home-action-btn">Create alarm</button></form>}
    {!alarmId && <><h3>History</h3>{rows(s.data?.history).map(a => <p key={a.id}>{a.label} — {a.status} {a.created_at && new Date(a.created_at).toLocaleString()}</p>)}</>}
  </Panel>;
}
export function LocationView() {
  const s = useFeature(api.getLiveLocation);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    const timer = setInterval(s.reload, 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!sharing || !navigator.geolocation) return;
    let last = 0,
      inFlight = false;
    const expiry = setTimeout(() => setSharing(false), 60 * 60 * 1000);
    const watch = navigator.geolocation.watchPosition(async position => {
      if (inFlight || Date.now() - last < 15000) return;
      last = Date.now();
      inFlight = true;
      try {
        await api.pingLocation([{
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          recorded_at: new Date(position.timestamp).toISOString()
        }]);
      } catch (e) {
        setSharing(false);
        s.setError(e.message || 'Location updates failed.');
      } finally {
        inFlight = false;
      }
    }, e => {
      setSharing(false);
      s.setError(e.message || 'Location permission denied.');
    }, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    });
    return () => {
      clearTimeout(expiry);
      navigator.geolocation.clearWatch(watch);
    };
  }, [sharing]);
  return <Panel title="Location Sharing" state={s}><p>Location updates run while this page is open. Closing or suspending the browser stops browser updates; stop sharing to end the server session.</p><button disabled={!navigator.geolocation} onClick={() => s.run(async () => {
      await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000
      }));
      await api.shareLocation({
        audience: 'family',
        minutes: 60
      });
      setSharing(true);
    })}>Share with family for one hour</button><button onClick={() => s.run(async () => {
      await api.stopLocation();
      setSharing(false);
    })}>Stop sharing</button>{rows(s.data?.people).map(p => <section key={p.user?.id}><h3>{p.user?.name}</h3><p>{p.position?.recorded_at ? `Last updated ${new Date(p.position.recorded_at).toLocaleString()}` : 'No current location'}</p>{p.position?.has_fix && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${encodeURIComponent(`${p.position.latitude},${p.position.longitude}`)}`}>View shared location</a>}</section>)}</Panel>;
}
export function SosView() { return <EmergencySos />; }

export function RemindersView() {
  const s = useFeature(async () => {
    const [overview, catalogue, family] = await Promise.all([api.getReminders(), api.getReminderCatalogue(), api.getFamilyMembers()]);
    return { data: { ...overview.data, catalogue: catalogue.data, family } };
  });
  const [editor, setEditor] = useState(null), [repeat, setRepeat] = useState('daily'), [date, setDate] = useState(''), [day, setDay] = useState(null), [report, setReport] = useState(null);
  const openEditor = reminder => { setEditor(reminder || {}); setRepeat(reminder?.repeat_mode || 'daily'); };
  const settle = occurrence => async status => {
    const at = new Date(occurrence.at);
    if (!Number.isFinite(at.getTime())) { s.setError('This reminder has no valid due time. Refresh and retry.'); return; }
    const two = n => String(n).padStart(2, '0');
    const dueLocal = `${at.getFullYear()}-${two(at.getMonth()+1)}-${two(at.getDate())} ${two(at.getHours())}:${two(at.getMinutes())}`;
    await s.run(async () => {
      await api.settleReminder(occurrence.reminder_id, { due_at: at.toISOString(), due_local: dueLocal, answered_at: new Date().toISOString(), status });
      if (date) setDay((await api.getReminderDay(date)).data);
    });
  };
  const occurrenceRows = items => rows(items).map(item => <section key={`${item.reminder_id}-${item.at}`}><h3>{item.title}</h3><p>{item.time} · {item.status}</p>{['pending','snoozed'].includes(item.status) && ['done','snoozed','skipped'].map(status => <button key={status} onClick={() => settle(item)(status)}>{status === 'done' ? 'Done' : status === 'snoozed' ? 'Snooze' : 'Skip'}</button>)}</section>);
  const reminderRows = items => rows(items).map(item => <section key={item.id}><h3>{item.title}</h3><p>{item.schedule_label || item.time} {item.assignment?.for?.name && ` · For ${item.assignment.for.name}`} · {item.assignment?.status || item.status}</p>{item.assignment?.mine_to_answer ? <><button onClick={() => s.run(() => api.respondToReminder(item.id,true))}>Accept</button><button onClick={() => s.run(() => api.respondToReminder(item.id,false))}>Decline</button></> : <><button onClick={() => openEditor(item)}>Edit</button><button className="feature-danger" onClick={() => { if (window.confirm('Delete this reminder?')) s.run(() => api.deleteReminder(item.id)); }}>Delete</button></>}</section>);
  return <Panel title="Reminders" state={s}>
    <button className="home-action-btn" onClick={() => openEditor(null)}>New reminder</button>
    <h3>Today · {s.data?.today?.done ?? 0}/{s.data?.today?.due ?? 0}</h3>
    {occurrenceRows(s.data?.today?.items)}{!rows(s.data?.today?.items).length && <p>No reminders due today.</p>}
    <h3>All reminders</h3>{reminderRows(s.data?.reminders)}
    <h3>Set for others</h3>{reminderRows(s.data?.assigned_by_me)}
    <section><h3>Calendar</h3><label>Choose a date<input type="date" value={date} onChange={event => { const next = event.target.value; setDate(next); setDay(null); if (next) s.run(async () => setDay((await api.getReminderDay(next)).data)); }} /></label>{occurrenceRows(day?.items)}<button onClick={() => s.run(async () => setReport((await api.getReminderReport()).data))}>Attendance report</button>{report && <p>{report.headline || report.score?.headline} · {report.done ?? report.score?.done ?? 0}/{report.total ?? report.score?.total ?? 0} completed · {report.streak ?? report.score?.streak ?? 0} day streak</p>}</section>
    {editor && <form key={editor.id || 'new'} onSubmit={event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const payload = { title: form.get('title').trim(), note: form.get('note').trim(), category_id: form.get('category_id'), repeat_mode: repeat, time_of_day: form.get('time_of_day'), weekday_mask: repeat === 'weekly' ? form.getAll('weekday').reduce((mask,n) => mask | (1 << Number(n)),0) : 0, ringtone: form.get('ringtone'), vibrate: form.get('vibrate') === 'on', snooze_minutes: Number(form.get('snooze_minutes')) };
      if (repeat === 'monthly') payload.day_of_month = Number(form.get('day_of_month'));
      if (form.get('assignee_id')) payload.assignee_id = form.get('assignee_id');
      if (repeat === 'weekly' && !payload.weekday_mask) { s.setError('Choose at least one weekday.'); return; }
      s.run(async () => { await (editor.id ? api.updateReminder(editor.id,payload) : api.createReminder(payload)); setEditor(null); });
    }}>
      <h3>{editor.id ? 'Edit reminder' : 'New reminder'}</h3>
      <label>Title<input name="title" required maxLength={120} defaultValue={editor.title || ''} /></label>
      <label>Category<select name="category_id" required defaultValue={editor.category?.id}>{rows(s.data?.catalogue?.categories).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Time<input type="time" name="time_of_day" required defaultValue={editor.time || '09:00'} /></label>
      <label>Repeat<select value={repeat} onChange={event => setRepeat(event.target.value)}>{['once','daily','weekly','monthly'].map(value => <option key={value}>{value}</option>)}</select></label>
      {repeat === 'weekly' && ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label,i) => <label key={label}><input type="checkbox" name="weekday" value={i} defaultChecked={Boolean((editor.weekday_mask || 0) & (1 << i))} />{label}</label>)}
      {repeat === 'monthly' && <label>Day of month<input type="number" name="day_of_month" min="1" max="31" required defaultValue={editor.day_of_month || 1} /></label>}
      {!editor.id && <label>For<select name="assignee_id"><option value="">Myself</option>{rows(s.data?.family).map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>}
      <label>Note<textarea name="note" defaultValue={editor.note || ''} /></label>
      <label>Ringtone<select name="ringtone" defaultValue={editor.ringtone || 'default'}>{(s.data?.catalogue?.ringtones || ['default']).map(tone => <option key={typeof tone === 'string' ? tone : tone.key} value={typeof tone === 'string' ? tone : tone.key}>{typeof tone === 'string' ? tone : tone.name}</option>)}</select></label>
      <label>Snooze minutes<input name="snooze_minutes" type="number" min="1" defaultValue={editor.snooze_minutes || 10} /></label>
      <label><input name="vibrate" type="checkbox" defaultChecked={editor.vibrate ?? true} />Vibrate on supported devices</label>
      <button disabled={s.busy}>Save reminder</button><button type="button" onClick={() => setEditor(null)}>Cancel</button>
    </form>}
    <p>Browser reminders do not provide native background ringing when the browser is closed.</p>
  </Panel>;
}
