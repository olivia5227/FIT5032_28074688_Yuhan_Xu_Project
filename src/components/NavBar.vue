<script setup>
import { ref } from 'vue'
import { useAuth } from '../store/auth';
import { useRouter } from 'vue-router';
const { state, isAuthed, role, logout } = useAuth();
const router = useRouter();
function doLogout(){ logout(); router.push('/'); }
const open = ref(false)
const toggle = () => (open.value = !open.value)
</script>

<template>
  <nav class="wrap">
    <div style="display:flex;gap:.6rem;align-items:center">
      <strong style="letter-spacing:.5px">🌿 Youth Wellbeing</strong>
      <span class="helper">Safe • Friendly • Trustworthy</span>
    </div>

    <button class="btn ghost" @click="toggle" style="display:none" aria-label="menu">☰</button>

    <ul :style="{display:'flex',gap:'.9rem',listStyle:'none',margin:0,padding:0}">
      <li><RouterLink to="/">Home</RouterLink></li>
      <li><RouterLink to="/discover">Discover</RouterLink></li>
      <li><RouterLink to="/reflect">Reflect</RouterLink></li>
      <li><RouterLink to="/connect">Connect</RouterLink></li>
      <li><RouterLink to="/refer">Refer</RouterLink></li>
      <li><RouterLink to="/reviews">Reviews</RouterLink></li>
      <li v-if="isAuthed"><RouterLink to="/results">Result View</RouterLink></li>
      <li v-if="isAuthed && role==='admin'"><RouterLink to="/admin">Admin</RouterLink></li>
      <li v-if="!isAuthed"><RouterLink to="/login">Login</RouterLink></li>
      <li v-if="!isAuthed"><RouterLink to="/register">Register</RouterLink></li>
      <li v-if="isAuthed"><button class="btn ghost" @click="doLogout">Logout</button></li>
    </ul>
  </nav>
</template>

<style scoped>
@media (max-width: 640px){
  button[aria-label="menu"]{display:inline-flex}
  ul{display:none!important}
}
</style>