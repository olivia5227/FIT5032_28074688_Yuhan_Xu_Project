<script setup>
import { useAuth } from '../store/auth';
import { useRouter, RouterLink } from 'vue-router';
const { state, isAuthed, role, logout } = useAuth();
const router = useRouter();
function doLogout(){ logout(); router.push('/'); }
</script>

<template>
  <header class="site">
    <div class="container">
      <nav class="wrap">
        <RouterLink to="/" class="brand" style="font-weight:700">Youth Wellbeing</RouterLink>
        <ul class="nav" style="display:flex;gap:1rem;align-items:center;list-style:none;margin:0;padding:0">
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/discover">Discover</RouterLink></li>
          <li><RouterLink to="/reflect">Reflect</RouterLink></li>
          <li><RouterLink to="/connect">Connect</RouterLink></li>
          <li><RouterLink to="/refer">Refer</RouterLink></li>

          <!-- USER MENU -->
          <template v-if="isAuthed && role==='user'">
            <li><RouterLink to="/reviews">Reviews</RouterLink></li>
            <li><RouterLink to="/my-reviews">My Reviews</RouterLink></li>
          </template>

          <!-- ADMIN MENU -->
          <template v-if="isAuthed && role==='admin'">
            <li><RouterLink to="/results">Result View</RouterLink></li>
            <li><RouterLink to="/reviews-admin">Ratings Admin</RouterLink></li>
            <li><RouterLink to="/admin">Admin</RouterLink></li>
          </template>

          <!-- AUTH -->
          <template v-if="!isAuthed">
            <li><RouterLink to="/login">Login</RouterLink></li>
            <li><RouterLink to="/register">Register</RouterLink></li>
          </template>
          <template v-else>
            <li class="helper">Hi, {{ state.user?.email }}</li>
            <li><button class="btn ghost" @click="doLogout">Logout</button></li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
</template>