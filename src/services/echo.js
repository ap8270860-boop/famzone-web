import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const BASE_URL = import.meta.env.VITE_SFAMILY_API_URL || 'https://admin-cp.sfamily.co/api/v1';

export function createEchoInstance(token) {
  if (!token) return null;

  return new Echo({
    broadcaster: 'reverb',
    key: 'lrqwccbcdgoprday7bub',
    wsHost: 'ws.sfamily.co',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });
}
