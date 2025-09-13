<script setup>
</script>

<template>
  <!-- Two-column hero layout -->
  <section class="container hero hero--two-column">
    <div class="hero-layout">
      <!-- Left: title + description + actions -->
      <div class="hero-left">
        <div class="hero-text">
          <h1>Feel Better, One Small Step</h1>
          <p>
            Discover quick tips, reflect with a friendly self-check, connect with peers,
            and find the right support — designed for young people aged 12–25.
          </p>
          <div class="actions">
            <RouterLink class="btn" to="/discover">Discover</RouterLink>
            <RouterLink class="btn ghost" to="/reflect">Try Self-Check</RouterLink>
          </div>
          <p class="helper">
            Built for comfort and safety: youth-friendly content, moderated spaces, and clear referral paths.
          </p>
        </div>
      </div>

      <!-- Right: the four bullet points card -->
      <div class="hero-right">
        <div class="hero-bullets card">
          <ul class="helper">
            <li><strong>Discover</strong> bite-size resources (stress, sleep, online safety)</li>
            <li><strong>Reflect</strong> quick self-check with instant tips</li>
            <li><strong>Connect</strong> community principles &amp; safe sharing</li>
            <li><strong>Refer</strong> qservice directory and what to expect</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Two-column hero layout */
.hero--two-column {
  min-height: 75vh;
  padding: 3rem 0;
  display: flex;
  align-items: center;
}

.hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  width: 100%;
  align-items: center;
}

/* Left column styling */
.hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-text {
  text-align: left;
}

.hero-text h1 { 
  margin: .2rem 0 .6rem;
  font-size: 2.5rem;
  line-height: 1.2;
}

.hero-text p { 
  margin: 0 0 .8rem;
  font-size: 1.1rem;
}

.hero-text .actions { 
  justify-content: flex-start; 
  gap: .7rem; 
  display: flex; 
  flex-wrap: wrap;
  margin: 1.5rem 0;
}

/* Right column styling */
.hero-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-bullets {
  text-align: left;
  width: 100%;
  max-width: 400px;
}

.hero-bullets ul {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.8;
  font-size: 1.1rem;
}

.hero-bullets li {
  margin-bottom: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-text {
    text-align: center;
  }
  
  .hero-text .actions {
    justify-content: center;
  }
  
  .hero-text h1 {
    font-size: 2rem;
  }
}

/* Optional: slightly smaller min-height on very small screens */
@media (max-width: 640px) {
  .hero--two-column { 
    min-height: 70vh; 
  }
}
</style>