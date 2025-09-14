<script setup>
// Self-check form with client-side limits + validations.
// Emits:
//  - submitted(payload) when valid submit
//  - cleared() when Reset button is pressed
import { reactive, computed } from 'vue'
import { sanitizeTextInput, isValidEmail } from '../utils/security'

const form = reactive({
  name: '',
  age: '',
  email: '',
  mood: 3,
  sleepHours: 7,
  notes: '',
  agree: false,
})

// Derived validations (kept explicit for clear error messages)
const errors = computed(() => {
  const e = {}

  // Name: required, 2-60, letters/space/hyphen/apostrophe
  const name = form.name.trim()
  if (!name) {
    e.name = 'Name is required.'
  } else if (name.length < 2) {
    e.name = 'At least 2 characters.'
  } else if (!/^[A-Za-z\u00C0-\u024F' -]{2,60}$/.test(name)) {
    e.name = 'Only letters, spaces, apostrophes or hyphens (2–60).'
  }

  // Age: required number 12..25
  const ageNum = Number(form.age)
  if (form.age === '' || form.age === null) {
    e.age = 'Age is required.'
  } else if (Number.isNaN(ageNum)) {
    e.age = 'Age must be a number.'
  } else if (ageNum < 12 || ageNum > 25) {
    e.age = 'Age must be between 12 and 25.'
  }

  // Email: optional but must match pattern if present
  if (form.email) {
    if (!isValidEmail(form.email)) e.email = 'Please enter a valid email.'
  }

  // Mood: 1..5
  const moodNum = Number(form.mood)
  if (Number.isNaN(moodNum) || moodNum < 1 || moodNum > 5) {
    e.mood = 'Mood must be between 1 and 5.'
  }

  // Sleep hours: 0..24
  const sleepNum = Number(form.sleepHours)
  if (Number.isNaN(sleepNum) || sleepNum < 0 || sleepNum > 24) {
    e.sleepHours = 'Sleep hours must be between 0 and 24.'
  }

  // Safety acknowledgement
  if (!form.agree) e.agree = 'Please acknowledge the safety note.'

  return e
})

const valid = computed(() => Object.keys(errors.value).length === 0)

// Basic suggestion rules (example)
const result = computed(() => {
  const tips = []
  if (form.sleepHours < 7) tips.push('Try a regular sleep routine (aim 8–9h).')
  if (form.mood <= 2) tips.push('Consider a short breathing exercise.')
  if (form.mood >= 4) tips.push('Great job! Keep up helpful habits.')
  if (!tips.length) tips.push('Keep checking in with yourself')
  return tips
})

const emit = defineEmits(['submitted', 'cleared'])

function submit() {
  if (!valid.value) return

  // Sanitize all text inputs before submission
  const sanitizedForm = {
    name: sanitizeTextInput(form.name),
    age: form.age,
    email: form.email ? sanitizeTextInput(form.email) : '',
    mood: form.mood,
    sleepHours: form.sleepHours,
    notes: sanitizeTextInput(form.notes),
    agree: form.agree
  }

  // Emit payload - suggestions included
  emit('submitted', { ...sanitizedForm, suggestions: result.value })
}

function resetForm() {
  // Clear inputs to defaults
  form.name = ''
  form.age = ''
  form.email = ''
  form.mood = 3
  form.sleepHours = 7
  form.notes = ''
  form.agree = false
  // Tell parent to clear summary
  emit('cleared')
}
</script>

<template>
  <form @submit.prevent="submit" class="card" style="max-width:680px;margin:auto">
    <h2 style="margin-top:0">Quick Self-Check</h2>
    <p class="helper">This is not a diagnosis. If you’re in crisis, contact emergency services.</p>

    <!-- Name -->
    <label class="helper" for="name">Name</label>
    <input
      id="name"
      class="input"
      v-model.trim="form.name"
      type="text"
      autocomplete="name"
      inputmode="text"
      maxlength="60"
      pattern="[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,60}"
      title="2–60 letters, spaces, apostrophes or hyphens"
      :aria-invalid="!!errors.name"
      :aria-describedby="errors.name ? 'err-name' : undefined"
      placeholder="e.g. Alex"
    />
    <div class="error" id="err-name" v-if="errors.name">{{ errors.name }}</div>

    <!-- Age -->
    <div class="grid">
      <div style="grid-column:span 6">
        <label class="helper" for="age">Age (12–25)</label>
        <input
          id="age"
          class="input"
          v-model="form.age"
          type="number"
          min="12" max="25" step="1"
          inputmode="numeric"
          pattern="\d+"
          autocomplete="off"
          :aria-invalid="!!errors.age"
          :aria-describedby="errors.age ? 'err-age' : undefined"
          placeholder="e.g. 18"
        />
        <div class="error" id="err-age" v-if="errors.age">{{ errors.age }}</div>
      </div>

      <!-- Mood -->
      <div style="grid-column:span 6">
        <label class="helper" for="mood">Mood (1–5)</label>
        <input
          id="mood"
          class="input"
          v-model.number="form.mood"
          type="number"
          min="1" max="5" step="1"
          inputmode="numeric"
          autocomplete="off"
          :aria-invalid="!!errors.mood"
          :aria-describedby="errors.mood ? 'err-mood' : undefined"
          placeholder="e.g. 3"
        />
        <div class="error" id="err-mood" v-if="errors.mood">{{ errors.mood }}</div>
      </div>
    </div>

    <!-- Email -->
    <label class="helper" for="email">Email (optional)</label>
    <input
      id="email"
      class="input"
      v-model.trim="form.email"
      type="email"
      inputmode="email"
      autocomplete="email"
      pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
      title="Please enter a valid email like name@example.com"
      :aria-invalid="!!errors.email"
      :aria-describedby="errors.email ? 'err-email' : undefined"
      placeholder="you@example.com"
    />
    <div class="error" id="err-email" v-if="errors.email">{{ errors.email }}</div>

    <!-- Sleep hours -->
    <label class="helper" for="sleep">Sleep hours (last night)</label>
    <input
      id="sleep"
      class="input"
      v-model.number="form.sleepHours"
      type="number"
      min="0" max="24" step="0.5"
      inputmode="decimal"
      autocomplete="off"
      :aria-invalid="!!errors.sleepHours"
      :aria-describedby="errors.sleepHours ? 'err-sleep' : undefined"
      placeholder="e.g. 7.5"
    />
    <div class="error" id="err-sleep" v-if="errors.sleepHours">{{ errors.sleepHours }}</div>

    <!-- Notes -->
    <label class="helper" for="notes">Notes (optional)</label>
    <textarea
      id="notes"
      class="input"
      v-model.trim="form.notes"
      rows="3"
      maxlength="400"
      autocomplete="off"
      placeholder="Anything you want to jot down… (max 400 chars)"
    ></textarea>

    <!-- Consent -->
    <label style="display:flex;gap:.5rem;align-items:flex-start;margin-top:.75rem">
      <input
        type="checkbox"
        v-model="form.agree"
        :aria-invalid="!!errors.agree"
        :aria-describedby="errors.agree ? 'err-agree' : undefined"
      />
      <span class="helper">I understand this is general wellbeing guidance and not medical advice.</span>
    </label>
    <div class="error" id="err-agree" v-if="errors.agree">{{ errors.agree }}</div>

    <!-- Actions -->
    <div class="actions" style="margin-top:1rem;display:flex;gap:.5rem">
      <button class="btn" type="submit" :disabled="!valid">Get Suggestions</button>
      <button class="btn ghost" type="button" @click="resetForm">Reset</button>
    </div>

    <!-- Suggestions card (peach) – disappears after Reset because form becomes invalid -->
    <div v-if="valid" class="card peach" style="margin-top:1rem">
      <strong>Suggestions</strong>
      <ul>
        <li v-for="(t,i) in result" :key="i">{{ t }}</li>
      </ul>
    </div>
  </form>
</template>