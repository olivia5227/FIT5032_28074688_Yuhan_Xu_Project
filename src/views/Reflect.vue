<script setup>
import { ref, computed } from 'vue';
import SelfCheckForm from '../components/SelfCheckForm.vue';
import { addEntry, makeId } from '../utils/history';
import { useAuth } from '../store/auth';

const { state } = useAuth();
const lastPayload = ref(null);

const savedAt = computed(() =>
  lastPayload.value ? new Date(lastPayload.value.ts ?? Date.now()).toLocaleString() : ''
);

const moodLabel = computed(() => {
  if (!lastPayload.value) return '';
  const m = Number(lastPayload.value.mood);
  const map = { 1: 'Very low 😞', 2: 'Low 🙁', 3: 'OK 🙂', 4: 'Good 😃', 5: 'Great 🤩' };
  return map[m] ?? m;
});

function onSubmitted(payload) {
  // Always use the current logged-in user's email for history tracking
  const userEmail = state.user?.email;
  const entry = {
    id: makeId(),
    ts: Date.now(),
    ...payload,
    // Override with current user's email for proper history tracking
    email: userEmail || payload.email
  };
  addEntry(entry);           // persist to LocalStorage
  lastPayload.value = entry; // show summary below the form
}
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Reflect</h2>

    <SelfCheckForm @submitted="onSubmitted" />

    <div v-if="lastPayload" class="card" style="margin-top:1rem">
      <h3 style="margin-top:0">Your Check Summary</h3>
      <p class="helper" v-if="savedAt">Saved at {{ savedAt }}</p>

      <div class="grid" style="margin-top:.5rem">
        <div style="grid-column:span 6"><strong>Name:</strong> {{ lastPayload.name }}</div>
        <div style="grid-column:span 6"><strong>Age:</strong> {{ lastPayload.age }}</div>
        <div style="grid-column:span 6"><strong>Email:</strong> {{ lastPayload.email || '—' }}</div>
        <div style="grid-column:span 6">
          <strong>Mood:</strong> {{ lastPayload.mood }} <span class="helper">({{ moodLabel }})</span>
        </div>
        <div style="grid-column:span 6"><strong>Sleep hours:</strong> {{ lastPayload.sleepHours }}</div>
        <div style="grid-column:span 12"><strong>Notes:</strong> {{ lastPayload.notes || '—' }}</div>
      </div>

      <div class="card peach" style="margin-top:1rem">
        <strong>Suggestions</strong>
        <ul>
          <li v-for="(t,i) in lastPayload.suggestions" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>