<script setup>
import { ref } from 'vue'
import TopicCard from '../components/TopicCard.vue'
import topicsData from '../assets/data/topics.json'

const topics = ref(topicsData)

/* four tile colors to match your mock */
const tileColors = [
  { bg: '#B7D3CA', fg: '#111111' }, // 1:1 Support - pastel sage
  { bg: '#FBD5C0', fg: '#111111' }, // Self-check   - peach
  { bg: '#FBD5C0', fg: '#111111' }, // Booking      - peach
  { bg: '#5F9E8D', fg: '#FFFFFF' }, // Guided prog. - deep teal, white text
]
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Discover</h2>
    <div class="grid">
      <!-- keep the same layout: 2 columns (span 6) -->
      <div v-for="(t, i) in topics" :key="t.id" style="grid-column:span 6">
        <TopicCard
          :topic="t"
          :bg="tileColors[i]?.bg"
          :fg="tileColors[i]?.fg"
        />
      </div>
    </div>
  </section>
</template>