<script setup>
defineProps({ topic: Object })
</script>

<template>
  <article class="card">
    <h3 style="margin:.2rem 0 0.5rem">{{ topic.title }}</h3>
    <p class="helper" style="margin:.2rem 0 1rem">{{ topic.summary }}</p>
    <div class="helper">Tag: <strong>{{ topic.tag }}</strong></div>
  </article>
</template>