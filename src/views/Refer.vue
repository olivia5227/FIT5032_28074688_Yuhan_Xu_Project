<script setup>
/**
 * Refer page – service directory
 * Data source: src/assets/data/services.json
 * Expected fields per item (flexible, all optional):
 *   id, name, description, phone, email, url, urlLabel, address
 */
import services from '../assets/data/services.json'
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Refer</h2>
    <p class="helper" style="margin-top:-.25rem;margin-bottom:1rem">
      A friendly directory of local/online services. External links open in a new tab.
    </p>

    <div class="grid">
      <article
        v-for="(svc, i) in services"
        :key="svc.id || i"
        class="card"
        style="grid-column:span 12"
      >
        <h3 style="margin-top:0">{{ svc.name }}</h3>
        <p class="helper" v-if="svc.description">{{ svc.description }}</p>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:.5rem">
          <!-- phone -->
          <span v-if="svc.phone">
            <strong>Phone:</strong>
            <a :href="`tel:${svc.phone}`">{{ svc.phone }}</a>
          </span>

          <!-- email -->
          <span v-if="svc.email">
            <strong>Email:</strong>
            <a :href="`mailto:${svc.email}`">{{ svc.email }}</a>
          </span>

          <!-- website (EXTERNAL LINK HARDENED) -->
          <span v-if="svc.url">
            <strong>Website:</strong>
            <a
              :href="svc.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ svc.urlLabel || svc.url }}
            </a>
          </span>

          <!-- address (plain text) -->
          <span v-if="svc.address">
            <strong>Address:</strong>
            <span>{{ svc.address }}</span>
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* Optional micro-tweaks just for this page */
h3{ line-height:1.2 }
</style>