<script setup>
import { ref } from 'vue'
import TopicCard from '../components/TopicCard.vue'
import topicsData from '../assets/data/topics.json'   // vite 支持直接导入 json

const topics = ref(topicsData)
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Discover</h2>
    <div class="grid">
      <div v-for="t in topics" :key="t.id" style="grid-column:span 6">
        <TopicCard :topic="t" />
      </div>
    </div>
  </section>
</template>