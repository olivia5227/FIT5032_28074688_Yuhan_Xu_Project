<script setup>
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
</script>

<template>
  <header class="site">
    <div class="container">
      <NavBar />
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer class="footer">
    <div class="container">
      <FooterBar />
    </div>
  </footer>
</template>