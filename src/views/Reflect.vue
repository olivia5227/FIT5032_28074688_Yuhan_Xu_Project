<script setup>
/* Show a summary card below the form with all submitted fields and tips */
import { ref, computed } from 'vue'
import SelfCheckForm from '../components/SelfCheckForm.vue'

/* Holds the latest valid payload emitted from the form */
const lastPayload = ref(null)

/* Optional helpers for nicer display */
const savedAt = computed(() =>
  lastPayload.value ? new Date(lastPayload.value.ts ?? Date.now()).toLocaleString() : ''
)

const moodLabel = computed(() => {
  if (!lastPayload.value) return ''
  const m = Number(lastPayload.value.mood)
  const map = { 1: 'Very low 😞', 2: 'Low 🙁', 3: 'OK 🙂', 4: 'Good 😃', 5: 'Great 🤩' }
  return map[m] ?? m
})

/* When the form is submitted (and passes validation), we store a timestamped copy */
function onSubmitted(payload) {
  lastPayload.value = { ...payload, ts: Date.now() }
}
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Reflect</h2>

    <!-- The form still shows inline suggestions when valid -->
    <SelfCheckForm @submitted="onSubmitted" />

    <!-- Below the form: full summary including entered fields AND tips -->
    <div v-if="lastPayload" class="card" style="margin-top:1rem">
      <h3 style="margin-top:0">Your Check Summary</h3>
      <p class="helper" v-if="savedAt">Saved at {{ savedAt }}</p>

      <div class="grid" style="margin-top:.5rem">
        <div style="grid-column:span 6"><strong>Name:</strong> {{ lastPayload.name }}</div>
        <div style="grid-column:span 6"><strong>Age:</strong> {{ lastPayload.age }}</div>
        <div style="grid-column:span 6">
          <strong>Email:</strong> {{ lastPayload.email || '—' }}
        </div>
        <div style="grid-column:span 6">
          <strong>Mood:</strong> {{ lastPayload.mood }}
          <span class="helper">({{ moodLabel }})</span>
        </div>
        <div style="grid-column:span 6">
          <strong>Sleep hours:</strong> {{ lastPayload.sleepHours }}
        </div>
        <div style="grid-column:span 12">
          <strong>Notes:</strong> {{ lastPayload.notes || '—' }}
        </div>
      </div>

      <div class="card" style="margin-top:1rem;background:#0b1220">
        <strong>Suggestions</strong>
        <ul>
          <li v-for="(t,i) in lastPayload.suggestions" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>