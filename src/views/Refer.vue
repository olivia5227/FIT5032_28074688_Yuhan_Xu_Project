<script setup>
import services from '../assets/data/services.json'
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Refer</h2>
    <div class="grid">
      <div v-for="s in services" :key="s.name" style="grid-column:span 6">
        <article class="card">
          <h3 style="margin:.2rem 0 .4rem">{{ s.name }}</h3>
          <div class="helper">{{ s.type }} • {{ s.region }}</div>
          <div style="margin-top:.6rem">
            <a v-if="s.url" :href="s.url" target="_blank">Website ↗</a>
            <span v-if="s.phone" class="helper" style="margin-left:.6rem">☎ {{ s.phone }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>