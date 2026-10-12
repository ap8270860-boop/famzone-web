import { getAlarms } from './sfamilyApi.js';

let audio;
export async function enableAlarmSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error('This browser does not support alarm audio.');
  audio ||= new AudioContext();
  await audio.resume();
}
export function ringAlarm(ringtone = 'gentle') {
  if (!audio || audio.state !== 'running') return;
  const frequencies = { gentle: 440, chime: 660, marimba: 520, sunrise: 880, bell: 1046, pulse: 330, classic: 740 };
  for (let i = 0; i < 3; i++) {
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    const at = audio.currentTime + i * 0.5;
    oscillator.frequency.value = frequencies[ringtone] || 440;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.15, at + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.4);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(at); oscillator.stop(at + 0.45);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}
/** Observe server alarms across Home destinations; durations tolerate clock skew. */
export function observeAlarms() {
  let closed = false, deadline = null, alarm = null, lastRing = 0;
  const refresh = async () => {
    try {
      const response = await getAlarms();
      if (closed) return;
      alarm = response.data?.active;
      deadline = alarm?.status === 'armed' && Number.isFinite(alarm.seconds_remaining)
        ? performance.now() + alarm.seconds_remaining * 1000 : null;
    } catch { /* Retry on the next poll; an unavailable server cannot assert safety. */ }
  };
  const tick = setInterval(() => {
    if (deadline === null || performance.now() < deadline || performance.now() - lastRing < 10000) return;
    lastRing = performance.now(); ringAlarm(alarm?.ringtone);
  }, 1000);
  const poll = setInterval(refresh, 30000);
  const resume = () => { if (!document.hidden) refresh(); };
  document.addEventListener('visibilitychange', resume); refresh();
  return () => { closed = true; clearInterval(tick); clearInterval(poll); document.removeEventListener('visibilitychange', resume); };
}
