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
  // (BR B.2)**
  const tips = []
  if (form.sleepHours < 7) tips.push('Try a regular sleep routine (aim 8–9h).')
  if (form.mood <= 2) tips.push('Consider a short breathing exercise.')
  if (form.mood >= 4) tips.push('Great job! Keep up the helpful habits.')
  if (!tips.length) tips.push('Keep checking in with yourself ❤️')
  return tips
})

const emit = defineEmits(['submitted'])

function submit() {
  if (!valid.value) return
  emit('submitted', { ...form, suggestions: result.value })
}
</script>

<template>
  <form @submit.prevent="submit" class="card" style="max-width:680px;margin:auto">
    <h3 style="margin-top:0">Quick Self-Check</h3>
    <p class="helper" style="margin-top:-.3rem">
      This is not a diagnosis. If you’re in crisis, contact emergency services.
    </p>

    <div style="display:grid;gap:1rem;grid-template-columns:1fr 1fr">
      <div>
        <label>Name</label>
        <input class="input" v-model.trim="form.name" placeholder="Your name" />
        <div v-if="errors.name" class="error">{{ errors.name }}</div>
      </div>

      <div>
        <label>Age (12–25)</label>
        <input class="input" v-model="form.age" placeholder="e.g. 18" />
        <div v-if="errors.age" class="error">{{ errors.age }}</div>
      </div>

      <div>
        <label>Email (optional)</label>
        <input class="input" v-model.trim="form.email" placeholder="you@example.com" />
        <div v-if="errors.email" class="error">{{ errors.email }}</div>
      </div>

      <div>
        <label>Mood (1‒5)</label>
        <input class="input" type="number" min="1" max="5" v-model.number="form.mood" />
        <div v-if="errors.mood" class="error">{{ errors.mood }}</div>
      </div>

      <div>
        <label>Sleep hours (last night)</label>
        <input class="input" type="number" min="0" max="24" v-model.number="form.sleepHours" />
      </div>

      <div style="grid-column:1 / -1">
        <label>Notes (optional)</label>
        <textarea class="input" rows="3" v-model.trim="form.notes"
          placeholder="Anything you want to jot down…" />
      </div>

      <div style="grid-column:1 / -1">
        <label style="display:flex;gap:.5rem;align-items:flex-start">
          <input type="checkbox" v-model="form.agree" />
          <span class="helper">
            I understand this is general wellbeing guidance and not medical advice.
          </span>
        </label>
        <div v-if="errors.agree" class="error">{{ errors.agree }}</div>
      </div>
    </div>

    <div class="actions" style="margin-top:1rem;display:flex;gap:.5rem">
      <button class="btn" type="submit" :disabled="!valid">Get Suggestions</button>
      <button class="btn ghost" type="reset">Reset</button>
    </div>

    <div v-if="valid" class="card peach" style="margin-top:1rem">
      <strong>Suggestions</strong>
      <ul>
        <li v-for="(t,i) in result" :key="i">{{ t }}</li>
      </ul>
    </div>
  </form>
</template>