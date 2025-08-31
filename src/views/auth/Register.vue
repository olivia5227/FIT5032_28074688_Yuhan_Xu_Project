<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../store/auth';

const email = ref('');
const password = ref('');
const role = ref('user'); // allow selecting a role for demo
const err = ref('');
const router = useRouter();
const { register } = useAuth();

async function onSubmit(){
  err.value = '';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.value)) { err.value='Invalid email'; return; }
  if (password.value.length < 6) { err.value='Password ≥ 6 chars'; return; }
  try {
    await register({ email: email.value.trim(), password: password.value, role: role.value });
    router.push('/');
  } catch (e) { err.value = e.message || 'Register failed'; }
}
</script>

<template>
  <section class="container" style="max-width:460px;margin:2rem auto">
    <div class="card">
      <h2>Register</h2>
      <input class="input" v-model.trim="email" placeholder="email" autocomplete="username" />
      <input class="input" v-model="password" type="password" placeholder="password" autocomplete="new-password"/>
      <label class="helper" style="display:block;margin-top:.6rem">Role</label>
      <select class="input" v-model="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <div class="error" v-if="err" style="margin-top:.5rem">{{ err }}</div>
      <button class="btn" style="margin-top:1rem" @click="onSubmit">Create account</button>
    </div>
  </section>
</template>