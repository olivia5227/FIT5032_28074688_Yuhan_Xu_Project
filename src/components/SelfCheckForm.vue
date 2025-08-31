<script setup>
import { reactive, computed } from 'vue'

const form = reactive({
  name: '',
  age: '',
  email: '',
  mood: 3,
  sleepHours: 7,
  notes: '',
  agree: false,
})

const errors = computed(() => {
  const e = {}
  if (!form.name.trim()) e.name = 'Name is required.'
  else if (form.name.trim().length < 2) e.name = 'At least 2 characters.'

  const ageNum = Number(form.age)
  if (!form.age) e.age = 'Age is required.'
  else if (Number.isNaN(ageNum)) e.age = 'Age must be a number.'
  else if (ageNum < 12 || ageNum > 25) e.age = 'Age must be between 12 and 25.'

  if (form.email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(form.email)) e.email = 'Please enter a valid email.'
  }

  const moodNum = Number(form.mood)
  if (Number.isNaN(moodNum) || moodNum < 1 || moodNum > 5)
    e.mood = 'Mood must be between 1 and 5.'

  if (!form.agree) e.agree = 'Please acknowledge the safety note.'
  return e
})

const valid = computed(() => Object.keys(errors.value).length === 0)

const result = computed(() => {
  const tips = []
  if (form.sleepHours < 7) tips.push('Try a regular sleep routine (aim 8–9h).')
  if (form.mood <= 2) tips.push('Consider a short breathing exercise.')
  if (form.mood >= 4) tips.push('Great job! Keep up the helpful habits.')
  if (!tips.length) tips.push('Keep checking in with yourself ❤️')
  return tips
})

const emit = defineEmits(['submitted', 'cleared'])

function submit() {
  if (!valid.value) return
  emit('submitted', { ...form, suggestions: result.value })
}

/* NEW: clear the reactive form AND tell parent to clear summary */
function resetForm() {
  form.name = ''
  form.age = ''
  form.email = ''
  form.mood = 3
  form.sleepHours = 7
  form.notes = ''
  form.agree = false
  emit('cleared')
}
</script>

<template>
  <form @submit.prevent="submit" class="card" style="max-width:680px;margin:auto">
    <!-- ...fields unchanged... -->

    <div class="actions" style="margin-top:1rem;display:flex;gap:.5rem">
      <button class="btn" type="submit" :disabled="!valid">Get Suggestions</button>
      <!-- CHANGED: use explicit reset handler -->
      <button class="btn ghost" type="button" @click="resetForm">Reset</button>
    </div>

    <!-- Suggestions card stays the same; it will disappear because valid=false after reset -->
    <div v-if="valid" class="card peach" style="margin-top:1rem">
      <strong>Suggestions</strong>
      <ul>
        <li v-for="(t,i) in result" :key="i">{{ t }}</li>
      </ul>
    </div>
  </form>
</template>