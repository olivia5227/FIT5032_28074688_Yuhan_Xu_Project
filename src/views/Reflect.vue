<script setup>
import { ref, computed } from 'vue'
import SelfCheckForm from '../components/SelfCheckForm.vue'
import { addEntry, makeId } from '../utils/history'

const lastPayload = ref(null)

const savedAt = computed(() =>
  lastPayload.value ? new Date(lastPayload.value.ts ?? Date.now()).toLocaleString() : ''
)

const moodLabel = computed(() => {
  if (!lastPayload.value) return ''
  const m = Number(lastPayload.value.mood)
  const map = { 1: 'Very low 😞', 2: 'Low 🙁', 3: 'OK 🙂', 4: 'Good 😃', 5: 'Great 🤩' }
  return map[m] ?? m
})

function onSubmitted(payload) {
  const entry = { id: makeId(), ts: Date.now(), ...payload }
  addEntry(entry)          // persists to Result View (history)
  lastPayload.value = entry
}
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Reflect</h2>

    <!-- NEW: clear local summary when child resets; history remains untouched -->
    <SelfCheckForm @submitted="onSubmitted" @cleared="lastPayload = null" />

    <div v-if="lastPayload" class="card" style="margin-top:1rem">
      <h3 style="margin-top:0">Your Check Summary</h3>
      <p class="helper" v-if="savedAt">Saved at {{ savedAt }}</p>

      <!-- ...summary content unchanged... -->

      <div class="card peach" style="margin-top:1rem">
        <strong>Suggestions</strong>
        <ul>
          <li v-for="(t,i) in lastPayload.suggestions" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>