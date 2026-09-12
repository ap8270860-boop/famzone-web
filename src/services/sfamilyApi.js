const BASE_URL = import.meta.env.VITE_SFAMILY_API_URL || 'https://admin-cp.sfamily.co/api/v1';

/**
 * Standard API Fetch wrapper following the SFamily API envelope contract:
 * { success: boolean, message: string, data?: object, errors?: object }
 */
async function apiFetch(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    'Accept': 'application/json',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('sfamily_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { success: false, message: `API returned ${response.status} ${response.statusText}` };

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        // Unauthenticated session expired
        localStorage.removeItem('sfamily_token');
        window.dispatchEvent(new Event('sfamily:unauthorized'));
      }
      if (response.status === 429 && data.errors?.retry_after) {
        data.message = `${data.message || 'Too many requests.'} Please try again in ${data.errors.retry_after} seconds.`;
      }
      throw data;
    }

    return data;
  } catch (err) {
    // If backend envelope wasn't received (network issues, etc.)
    if (err && err.success !== undefined) {
      throw err;
    }
    throw {
      success: false,
      message: err.message || 'Network error occurred. Please try again.',
      errors: { network: ['Failed to reach server'] }
    };
  }
}

/**
 * Health Diagnostics Ping Check
 */
export async function pingApi() {
  return await apiFetch('/ping', { method: 'GET' });
}

/**
 * Register a new user
 */
export async function registerUser(userData) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      device_type: 'web',
      app_version: '1.0.0',
      ...userData,
    }),
  });
  return res;
}

/**
 * Send OTP code
 * @param {string} phoneCountryCode 
 * @param {string} phoneNumber 
 * @param {'login'|'registration'} purpose 
 */
export async function sendOtp(phoneCountryCode, phoneNumber, purpose = 'login') {
  const res = await apiFetch('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({
      phone_country_code: phoneCountryCode,
      phone_number: phoneNumber.replace(/\D/g, ''),
      purpose,
    }),
  });
  return res;
}

/**
 * Verify OTP code
 * @param {string} phoneCountryCode 
 * @param {string} phoneNumber 
 * @param {string} code 
 * @param {'login'|'registration'} purpose 
 */
export async function verifyOtp(phoneCountryCode, phoneNumber, code, purpose = 'login') {
  const res = await apiFetch('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({
      phone_country_code: phoneCountryCode,
      phone_number: phoneNumber.replace(/\D/g, ''),
      code,
      purpose,
      device_type: 'web',
      device_id: 'web-browser',
    }),
  });

  if (res.data?.token) {
    localStorage.setItem('sfamily_token', res.data.token);
  }

  return res;
}

/**
 * Login using Password
 * @param {string} phoneCountryCode 
 * @param {string} phoneNumber 
 * @param {string} password 
 */
export async function loginWithPassword(phoneCountryCode, phoneNumber, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      phone_country_code: phoneCountryCode,
      phone_number: phoneNumber.replace(/\D/g, ''),
      password,
      device_type: 'web',
      device_id: 'web-browser',
    }),
  });

  if (res.data?.token) {
    localStorage.setItem('sfamily_token', res.data.token);
  }

  return res;
}

/**
 * Logout
 */
export async function logoutUser() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (e) {
    // Ignore backend logout errors, clear client state regardless
  } finally {
    localStorage.removeItem('sfamily_token');
  }
}

/**
 * Get current authenticated user profile
 */
export async function getProfile() {
  return await apiFetch('/me', { method: 'GET' });
}

/**
 * Update user profile
 */
export async function updateProfile(partialData) {
  return await apiFetch('/profile', {
    method: 'PATCH',
    body: JSON.stringify(partialData),
  });
}

/**
 * Check username availability
 */
export async function checkUsername(username) {
  return await apiFetch(`/profile/username/check?username=${encodeURIComponent(username)}`, {
    method: 'GET',
  });
}

/**
 * Update user password
 */
export async function updatePassword(currentPassword, newPassword) {
  return await apiFetch('/profile/password', {
    method: 'POST',
    body: JSON.stringify({
      ...(currentPassword && { current_password: currentPassword }),
      password: newPassword,
      password_confirmation: newPassword,
    }),
  });
}

/**
 * Upload Avatar photo
 */
export async function uploadAvatar(file, slot = 'primary') {
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('slot', slot);

  return await apiFetch('/profile/avatar', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Delete Avatar photo
 */
export async function deleteAvatar(slot = 'primary') {
  return await apiFetch(`/profile/avatar?slot=${slot}`, {
    method: 'DELETE',
  });
}

/** Safety */
export async function getSafetyStatus() {
  return await apiFetch('/safety/status', { method: 'GET' });
}

export async function checkIn(payload = {}) {
  return await apiFetch('/safety/check-in', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCheckInHistory(days = 30) {
  return await apiFetch(`/safety/check-ins?days=${encodeURIComponent(days)}`, { method: 'GET' });
}

/** People and relationships */
export async function searchPeople(query) {
  return await apiFetch(`/users/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
}

export async function getUserProfile(userId) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}`, { method: 'GET' });
}

export async function followUser(userId) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/follow`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function unfollowUser(userId) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/follow`, { method: 'DELETE' });
}

export async function removeFollower(userId) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/follower`, { method: 'DELETE' });
}

export async function getFollowRequests() {
  return await apiFetch('/follow-requests', { method: 'GET' });
}

export async function respondToFollowRequest(requestId, accept) {
  return await apiFetch(`/follow-requests/${encodeURIComponent(requestId)}/respond`, {
    method: 'POST',
    body: JSON.stringify({ accept }),
  });
}

export async function getFollowers(userId) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/followers`, { method: 'GET' });
}

export async function getFollowing(userId) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/following`, { method: 'GET' });
}

/** Family */
export async function getFamily() {
  return await apiFetch('/family', { method: 'GET' });
}

export async function getFamilyMembers() {
  const response = await getFamily();
  const payload = response.data;
  const entries = Array.isArray(payload) ? payload : (payload?.members || payload?.family || payload?.results || []);

  return entries.map((entry) => {
    const user = entry.user || entry.member || entry;
    const name = user.name || user.full_name || user.username || 'Family member';
    return {
      id: String(entry.id || user.id),
      initials: name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      avatar: user.avatar_url || user.avatar || null,
      username: user.username ? `@${user.username.replace(/^@/, '')}` : '',
      name,
      bio: user.about || user.bio || '',
      relationship: entry.relation || entry.relationship || user.relationship?.family_relation || 'Family',
      phone: user.phone || user.phone_number || '',
      followers: user.counts?.followers || user.followers_count || 0,
      following: user.counts?.following || user.following_count || 0,
      familyCount: user.counts?.family || user.family_count || 0,
      posts: user.counts?.posts || user.posts_count || 0,
      isFollowing: user.relationship?.following === 'accepted' || Boolean(user.is_following),
    };
  });
}

export async function inviteToFamily(userId, relation) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/family`, {
    method: 'POST',
    body: JSON.stringify({ relation }),
  });
}

export async function respondToFamilyInvite(inviteId, accept, relation) {
  return await apiFetch(`/family-invites/${encodeURIComponent(inviteId)}/respond`, {
    method: 'POST',
    body: JSON.stringify({ accept, ...(relation && { relation }) }),
  });
}

export async function removeFamilyMember(familyId) {
  return await apiFetch(`/family/${encodeURIComponent(familyId)}`, { method: 'DELETE' });
}

/** Blocking */
export async function blockUser(userId, reason) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/block`, {
    method: 'POST',
    body: JSON.stringify({ ...(reason && { reason }) }),
  });
}

export async function unblockUser(userId) {
  return await apiFetch(`/users/${encodeURIComponent(userId)}/block`, { method: 'DELETE' });
}

export async function getBlockedAccounts() {
  return await apiFetch('/blocks', { method: 'GET' });
}

/** Notifications */
export async function getNotifications(page = 1) {
  return await apiFetch(`/notifications?page=${encodeURIComponent(page)}`, { method: 'GET' });
}

export async function getUnreadNotificationCount() {
  return await apiFetch('/notifications/unread-count', { method: 'GET' });
}

export async function markNotificationRead(notificationId) {
  return await apiFetch(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead() {
  return await apiFetch('/notifications/read-all', { method: 'POST' });
}

/**
 * ==========================================
 * CHAT API V1 ENDPOINTS
 * ==========================================
 */

/** Conversations */
export async function getConversations({ state = 'accepted', page = 1 } = {}) {
  const query = new URLSearchParams({ state, page }).toString();
  return await apiFetch(`/conversations?${query}`, { method: 'GET' });
}

export async function getUnreadCount() {
  return await apiFetch('/conversations/unread-count', { method: 'GET' });
}

export async function createDirectConversation(userId) {
  return await apiFetch('/conversations', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function getConversation(uuid) {
  return await apiFetch(`/conversations/${encodeURIComponent(uuid)}`, { method: 'GET' });
}

export async function acceptConversation(uuid) {
  return await apiFetch(`/conversations/${encodeURIComponent(uuid)}/accept`, { method: 'POST' });
}

export async function deleteConversation(uuid) {
  return await apiFetch(`/conversations/${encodeURIComponent(uuid)}`, { method: 'DELETE' });
}

/** Messages */
export async function getMessages(conversationId, { before, after, limit = 40 } = {}) {
  const params = new URLSearchParams();
  if (before) params.append('before', before);
  if (after) params.append('after', after);
  if (limit) params.append('limit', limit);
  
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/messages?${params.toString()}`, {
    method: 'GET',
  });
}

export async function sendMessage(conversationId, { client_uuid, type = 'text', body, upload_id, reply_to_id }) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      client_uuid,
      type,
      ...(body !== undefined && { body }),
      ...(upload_id && { upload_id }),
      ...(reply_to_id && { reply_to_id }),
    }),
  });
}

export async function deleteMessage(messageId) {
  return await apiFetch(`/messages/${encodeURIComponent(messageId)}`, { method: 'DELETE' });
}

export async function hideMessage(messageId) {
  return await apiFetch(`/messages/${encodeURIComponent(messageId)}/hide`, { method: 'POST' });
}

export async function getMessageInfo(messageId) {
  return await apiFetch(`/messages/${encodeURIComponent(messageId)}/info`, { method: 'GET' });
}

/** Receipts */
export async function markRead(conversationId, messageId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/read`, {
    method: 'POST',
    body: JSON.stringify({ message_id: messageId }),
  });
}

export async function markDelivered(conversationId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/delivered`, {
    method: 'POST',
  });
}

/** Message Actions */
export async function reactToMessage(messageId, emoji) {
  return await apiFetch(`/messages/${encodeURIComponent(messageId)}/react`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  });
}

export async function starMessage(messageId) {
  return await apiFetch(`/messages/${encodeURIComponent(messageId)}/star`, { method: 'POST' });
}

export async function getStarredMessages(page = 1) {
  return await apiFetch(`/starred-messages?page=${encodeURIComponent(page)}`, { method: 'GET' });
}

export async function forwardMessage(messageId, conversationIds) {
  return await apiFetch(`/messages/${encodeURIComponent(messageId)}/forward`, {
    method: 'POST',
    body: JSON.stringify({ conversation_ids: conversationIds }),
  });
}

export async function pinMessage(conversationId, messageId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/pin`, {
    method: 'POST',
    body: JSON.stringify({ message_id: messageId }),
  });
}

/** Thread Settings */
export async function pinChat(conversationId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/pin-chat`, { method: 'POST' });
}

export async function archiveChat(conversationId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/archive`, { method: 'POST' });
}

export async function muteChat(conversationId, hours = null) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/mute`, {
    method: 'POST',
    body: JSON.stringify({ muted: true, ...(hours && { hours }) }),
  });
}

export async function markUnread(conversationId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/unread`, { method: 'POST' });
}

export async function clearThread(conversationId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/clear`, { method: 'POST' });
}

/** Groups */
export async function getGroupCandidates(scope = 'connections') {
  return await apiFetch(`/conversations/group-candidates?scope=${encodeURIComponent(scope)}`, { method: 'GET' });
}

export async function createGroup(payload) {
  let options = { method: 'POST' };
  if (payload instanceof FormData) {
    options.body = payload;
  } else {
    options.body = JSON.stringify(payload);
  }
  return await apiFetch('/conversations/group', options);
}

export async function updateGroup(conversationId, payload) {
  let options = { method: 'POST' };
  if (payload instanceof FormData) {
    options.body = payload;
  } else {
    options.body = JSON.stringify(payload);
  }
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/group`, options);
}

export async function removeGroupMember(conversationId, userId) {
  return await apiFetch(`/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

/** Uploads & Media */
export async function uploadMedia(file, type = 'image', extraParams = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  if (type === 'audio') {
    if (extraParams.duration_ms) formData.append('duration_ms', extraParams.duration_ms);
    if (extraParams.waveform) formData.append('waveform', JSON.stringify(extraParams.waveform));
  }

  return await apiFetch('/uploads', {
    method: 'POST',
    body: formData,
  });
}

/** Presence Ping */
export async function pingPresence() {
  return await apiFetch('/presence/ping', { method: 'POST' });
}
