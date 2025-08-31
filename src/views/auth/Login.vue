<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../store/auth';

const email = ref('');
const password = ref('');
const err = ref('');
const router = useRouter();
const route = useRoute();
const { login } = useAuth();

async function onSubmit(){
  err.value = '';
  try {
    await login({ email: email.value.trim(), password: password.value });
    router.push(route.query.redirect || '/');
  } catch (e) { err.value = e.message || 'Login failed'; }
}
</script>

<template>
  <section class="container" style="max-width:460px;margin:2rem auto">
    <div class="card">
      <h2>Login</h2>
      <input class="input" v-model.trim="email" placeholder="email" autocomplete="username" />
      <input class="input" v-model="password" type="password" placeholder="password" autocomplete="current-password"/>
      <div class="error" v-if="err" style="margin-top:.5rem">{{ err }}</div>
      <div style="display:flex;gap:.5rem;margin-top:1rem">
        <button class="btn" @click="onSubmit">Login</button>
        <RouterLink class="btn ghost" to="/register">Create account</RouterLink>
      </div>
    </div>
  </section>
</template>