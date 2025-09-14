// Simple demo auth store (LocalStorage + SHA-256 hashing)
// NOTE: for coursework only. Real apps must use server-side auth.

import { reactive, computed } from 'vue';

const AUTH_KEY = 'auth_v1';
const USERS_KEY = 'users_v1';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// tiny SHA-256 helper for password hashing
async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

const state = reactive(load(AUTH_KEY, { user: null, role: null, token: null }));

export function useAuth(){
  const isAuthed = computed(()=> !!state.token);
  const role = computed(()=> state.role);

  async function register({ username, email, password, address, emergencyContactName, emergencyContactPhone, role='user' }) {
    const users = load(USERS_KEY, {});
    if (users[email]) throw new Error('User already exists');
    const hash = await sha256(password);
    users[email] = {
      username,
      hash,
      address,
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      role
    };
    save(USERS_KEY, users);
    await login({ email, password }); // auto-sign-in
  }

  async function login({ email, password }) {
    const users = load(USERS_KEY, {});
    const record = users[email];
    if (!record) throw new Error('User not found');
    const hash = await sha256(password);
    if (record.hash !== hash) throw new Error('Invalid credentials');
    state.user = {
      email,
      username: record.username,
      address: record.address,
      emergencyContactName: record.emergencyContactName || '',
      emergencyContactPhone: record.emergencyContactPhone || ''
    };
    state.role = record.role;
    state.token = `demo_${Date.now()}`;
    save(AUTH_KEY, state);
  }

  function logout(){
    state.user = null; state.role = null; state.token = null;
    save(AUTH_KEY, state);
  }

  async function updateUserInfo({ username, address, emergencyContactName, emergencyContactPhone, currentPassword, newPassword }) {
    if (!state.user) throw new Error('User not authenticated');

    const users = load(USERS_KEY, {});
    const userRecord = users[state.user.email];

    if (!userRecord) throw new Error('User not found');

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) throw new Error('Current password required to change password');
      const currentHash = await sha256(currentPassword);
      if (currentHash !== userRecord.hash) throw new Error('Current password incorrect');
      userRecord.hash = await sha256(newPassword);
    }

    // Update user info
    userRecord.username = username;
    userRecord.address = address;
    userRecord.emergencyContactName = emergencyContactName || '';
    userRecord.emergencyContactPhone = emergencyContactPhone || '';

    // Update local storage
    save(USERS_KEY, users);

    // Update current state
    state.user = {
      email: state.user.email,
      username,
      address,
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || ''
    };

    save(AUTH_KEY, state);
  }

  return { state, isAuthed, role, register, login, logout, updateUserInfo };
}