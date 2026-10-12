import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, X, Sparkles, Circle, Car, Bus, Bike, Plane, Train, Briefcase, Laptop, Phone, Wrench, BookOpen, GraduationCap, Backpack, Pencil, Footprints, Dumbbell, Mountain, Umbrella, ShoppingCart, Coffee, UtensilsCrossed, Sandwich, Moon, Bed, House, Smile, Frown, Cross, Heart, Headphones, Gamepad2, Camera, Flower2, PawPrint, Baby } from 'lucide-react';
import { getModes, getProfileDetails, setMode } from '../services/sfamilyApi.js';
import './ModePicker.css';

const icons = { circle: Circle, car: Car, bus: Bus, bike: Bike, plane: Plane, train: Train, briefcase: Briefcase, laptop: Laptop, phone: Phone, tools: Wrench, book: BookOpen, school: GraduationCap, backpack: Backpack, pencil: Pencil, walk: Footprints, run: Footprints, dumbbell: Dumbbell, mountain: Mountain, beach: Umbrella, cart: ShoppingCart, coffee: Coffee, pot: UtensilsCrossed, food: Sandwich, moon: Moon, bed: Bed, home: House, happy: Smile, sad: Frown, health: Cross, heart: Heart, music: Headphones, game: Gamepad2, camera: Camera, prayer: Flower2, pet: PawPrint, baby: Baby };
export function ModeIcon({ mode, size = 24 }) {
  const Icon = mode ? (icons[mode.icon] || Circle) : Sparkles;
  return <Icon size={size} aria-hidden="true" />;
}
export function modeColour(value) {
  const cleaned = typeof value === 'string' ? value.replace(/^#/, '').trim() : '';
  return /^[\da-f]{6}$/i.test(cleaned) ? `#${cleaned}` : '#29d3e8';
}
export default function ModePicker({ onBack }) {
  const [catalogue, setCatalogue] = useState([]), [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState('');
  const mounted = useRef(false), submitting = useRef(false);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [modes, profile] = await Promise.all([getModes(), getProfileDetails()]);
      if (!mounted.current) return;
      setCatalogue(Array.isArray(modes.data) ? modes.data : (modes.data?.modes || []));
      setCurrent((profile.data?.user || profile.data)?.mode || null);
    } catch (e) { if (mounted.current) setError(e.message || 'Unable to load modes. Retry to continue.'); }
    finally { if (mounted.current) setLoading(false); }
  };
  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; }, []);
  const choose = async mode => {
    if (submitting.current || loading) return;
    submitting.current = true; setSaving(true); setError(''); setSaved('');
    try {
      const response = await setMode(mode?.slug || null);
      if (!mounted.current) return;
      // The successful response owns the current mode, including an explicit null.
      const next = response.data?.mode ?? null;
      setCurrent(next);
      setSaved(next ? `Current mode: ${next.name}` : 'Mode cleared.');
      window.dispatchEvent(new CustomEvent('sfamily:mode-changed', { detail: next }));
    } catch (e) { if (mounted.current) setError(e.message || 'Unable to save your mode. Please retry.'); }
    finally { submitting.current = false; if (mounted.current) setSaving(false); }
  };
  return <div className="mode-picker" aria-busy={loading || saving}>
    <header className="mode-picker-heading">
      {onBack && <button className="mode-back" onClick={onBack} aria-label="Back to Home"><ArrowLeft size={20} aria-hidden="true" /></button>}
      <h1>What are you up to?</h1><p>Your family see this on your face.</p>
    </header>
    {error && <div className="mode-feedback mode-feedback-error" role="alert">{error}{!catalogue.length && <button onClick={load} disabled={loading}>Retry</button>}</div>}
    {loading ? <p className="mode-loading" role="status">Loading modes…</p> : <>
      <div className="mode-grid" aria-label="Current mode">
        {catalogue.map(mode => <button key={mode.slug} className="mode-tile" style={{ '--mode-colour': modeColour(mode.colour) }} aria-pressed={current?.slug === mode.slug} disabled={saving} onClick={() => choose(mode)} title={mode.name}>
          <ModeIcon mode={mode} /><span>{mode.name}</span>{current?.slug === mode.slug && <Check className="mode-selected" size={14} aria-hidden="true" />}
        </button>)}
      </div>
      {!catalogue.length && !error && <p className="mode-loading">No modes available yet.</p>}
      <div className="mode-picker-footer">
        {current && <button className="mode-clear" disabled={saving} onClick={() => choose(null)}><X size={16} aria-hidden="true" />Clear mode</button>}
        <p className="mode-status" role="status">{saving ? 'Saving mode…' : saved || (current ? `Current mode: ${current.name}` : '')}</p>
      </div>
    </>}
  </div>;
}
