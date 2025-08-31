<script setup>
import { ref } from 'vue';
import { useAuth } from '../store/auth';
import { reviewsByUser } from '../utils/reviews';

const { state } = useAuth();
const email = state.user?.email || '';
const list = ref(email ? reviewsByUser(email) : []);
function fmt(ts){ try{ return new Date(ts).toLocaleString(); } catch { return ts; } }
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">My Reviews</h2>
    <div v-if="!email" class="card">Please login to view your reviews.</div>
    <div v-else-if="!list.length" class="card">You have not submitted any reviews yet.</div>
    <div v-else class="grid">
      <div v-for="r in list" :key="r.id" style="grid-column:span 12">
        <article class="card">
          <strong>{{ r.rating }} ★</strong>
          <span class="helper"> • {{ r.user }} • {{ fmt(r.ts) }}</span>
          <p v-if="r.comment" style="margin:.5rem 0 0">{{ r.comment }}</p>
        </article>
      </div>
    </div>
  </section>
</template>