<script setup>
defineProps({
  topic: Object,
  bg: { type: String, default: '' },   // optional background color
  fg: { type: String, default: '' },   // optional foreground (text) color
})
</script>

<template>
  <article
    class="card"
    :style="{
      background: bg || 'var(--card)',
      color: fg || 'var(--text)',
      borderColor: bg ? 'transparent' : undefined
    }"
  >
    <h3 style="margin:.2rem 0 0.5rem">{{ topic.title }}</h3>
    <p class="helper" style="margin:.2rem 0 1rem">{{ topic.summary }}</p>
    <div class="helper">Tag: <strong>{{ topic.tag }}</strong></div>
  </article>
</template>