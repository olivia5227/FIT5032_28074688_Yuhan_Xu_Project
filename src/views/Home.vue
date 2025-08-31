<script setup>
</script>

<template>
  <!-- Single-column hero, centered content -->
  <section class="container hero hero--center">
    <!-- Top: title + description + actions (centered) -->
    <div class="hero-text">
      <h1>Feel Better, One Small Step 🌿</h1>
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

    <!-- Bottom: the four bullet points moved below the hero text -->
    <div class="hero-bullets card">
      <ul class="helper" style="margin:0;padding-left:1rem;line-height:1.8">
        <li><strong>Discover</strong> bite-size resources (stress, sleep, online safety)</li>
        <li><strong>Reflect</strong> quick self-check with instant tips</li>
        <li><strong>Connect</strong> community principles &amp; safe sharing</li>
        <li><strong>Refer</strong> qservice directory and what to expect</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Center the hero section vertically and horizontally.
   Use a single column layout and keep text centered. */
.hero--center{
  grid-template-columns: 1fr;     /* Force single column */
  place-items: center;            /* Center grid items */
  text-align: center;
  min-height: 75vh;               /* Visual centering on the page */
  padding: 3rem 0;                /* Vertical spacing */
}

/* Constrain max width so long lines are readable on wide screens */
.hero-text,
.hero-bullets{
  width: 100%;
  max-width: 780px;
}

/* Tighter spacing for headings, paragraphs, and buttons */
.hero-text h1{ margin: .2rem 0 .6rem }
.hero-text p{ margin: 0 0 .8rem }
.hero-text .actions{ justify-content: center; gap: .7rem; display: flex; flex-wrap: wrap }

/* Optional: slightly smaller min-height on very small screens */
@media (max-width: 640px){
  .hero--center{ min-height: 70vh; }
}
/* Left align the bullet card and its content */
.hero-bullets{
  text-align: left;        /* override .hero--center { text-align:center } */
}
.hero-bullets ul{
  margin: 0;               /* keep tight top/bottom */
  padding-left: 1.25rem;   /* indent bullets a bit */
  line-height: 1.8;        /* comfortable reading */
}
</style>