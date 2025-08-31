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

  async function register({ email, password, role='user' }) {
    const users = load(USERS_KEY, {});
    if (users[email]) throw new Error('User already exists');
    const hash = await sha256(password);
    users[email] = { hash, role };
    save(USERS_KEY, users);
    await login({ email, password }); // auto-sign-in
  }

  async function login({ email, password }) {
    const users = load(USERS_KEY, {});
    const record = users[email];
    if (!record) throw new Error('User not found');
    const hash = await sha256(password);
    if (record.hash !== hash) throw new Error('Invalid credentials');
    state.user = { email };
    state.role = record.role;
    state.token = `demo_${Date.now()}`;
    save(AUTH_KEY, state);
  }

  function logout(){
    state.user = null; state.role = null; state.token = null;
    save(AUTH_KEY, state);
  }

  return { state, isAuthed, role, register, login, logout };
}