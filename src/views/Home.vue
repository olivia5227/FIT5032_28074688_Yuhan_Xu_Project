<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TopicCard from '../components/TopicCard.vue'
import topicsData from '../assets/data/topics.json'
import servicesData from '../assets/data/services.json'

const topics = ref(topicsData)
const services = ref(servicesData)

/* four tile colors to match your mock */
const tileColors = [
  { bg: '#B7D3CA', fg: '#111111' }, // 1:1 Support - pastel sage
  { bg: '#FBD5C0', fg: '#111111' }, // Self-check   - peach
  { bg: '#FBD5C0', fg: '#111111' }, // Booking      - peach
  { bg: '#5F9E8D', fg: '#FFFFFF' }, // Guided prog. - deep teal, white text
]

let isScrolling = false
let scrollTimeout = null
let lastScrollY = 0
let scrollDirection = 'down'
let scrollVelocity = 0

function scrollToDiscover() {
  isScrolling = true
  document.getElementById('discover')?.scrollIntoView({ 
    behavior: 'smooth' 
  })
  setTimeout(() => { isScrolling = false }, 800)
}

function scrollToHero() {
  isScrolling = true
  document.getElementById('hero')?.scrollIntoView({ 
    behavior: 'smooth' 
  })
  setTimeout(() => { isScrolling = false }, 800)
}

function scrollToRefer() {
  isScrolling = true
  document.getElementById('refer')?.scrollIntoView({ 
    behavior: 'smooth' 
  })
  setTimeout(() => { isScrolling = false }, 800)
}

// Handle scroll snap - improved version supporting three sections
function handleScroll() {
  if (isScrolling) return
  
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  const heroSection = document.getElementById('hero')
  const discoverSection = document.getElementById('discover')
  const referSection = document.getElementById('refer')
  
  if (!heroSection || !discoverSection || !referSection) return
  
  // Calculate scroll direction and velocity
  const deltaY = scrollY - lastScrollY
  scrollDirection = deltaY > 0 ? 'down' : 'up'
  scrollVelocity = Math.abs(deltaY)
  lastScrollY = scrollY
  
  const heroHeight = heroSection.offsetHeight
  const discoverTop = discoverSection.offsetTop
  const discoverHeight = discoverSection.offsetHeight
  const referTop = referSection.offsetTop
  
  // Clear previous timer
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  // Adjust debounce delay based on scroll velocity
  const debounceDelay = Math.max(50, Math.min(200, 200 - scrollVelocity * 5))
  
  // Set debounce, execute snap after scroll stops - prioritize direction
  scrollTimeout = setTimeout(() => {
    // Determine which region we're currently in
    if (scrollY < heroHeight * 0.05) {
      // At the very top of hero section, no action needed
      return
    } else if (scrollY < discoverTop) {
      // Between hero and discover sections
      if (scrollDirection === 'down') {
        // Scrolling down: prioritize jumping to discover once leaving top 20% of hero
        if (scrollY > heroHeight * 0.2) {
          scrollToDiscover()
        } else {
          scrollToHero()
        }
      } else {
        // Scrolling up: prioritize returning to hero while still in bottom 80% of hero
        if (scrollY < heroHeight * 0.8) {
          scrollToHero()
        } else {
          scrollToDiscover()
        }
      }
    } else if (scrollY < referTop) {
      // Between discover and refer sections
      if (scrollDirection === 'down') {
        // Scrolling down: prioritize jumping to refer once past 20% of discover
        if (scrollY > discoverTop + (discoverHeight * 0.2)) {
          scrollToRefer()
        } else {
          scrollToDiscover()
        }
      } else {
        // Scrolling up: prioritize returning to discover while within 80% of discover
        if (scrollY < discoverTop + (discoverHeight * 0.8)) {
          scrollToDiscover()
        } else {
          scrollToRefer()
        }
      }
    } else {
      // In refer section or below
      if (scrollDirection === 'up') {
        // Scrolling up: snap to refer while in first 80% of refer section
        if (scrollY < referTop + windowHeight * 0.8) {
          scrollToRefer()
        }
      }
      // No action when scrolling down, let user freely scroll to bottom
    }
  }, debounceDelay)
}

// Add scroll listener when component mounts
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// Remove scroll listener when component unmounts
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<template>
  <div class="page-container">
    <!-- Hero Section -->
    <section class="hero-section snap-section" id="hero">
      <div class="container">
        <div class="hero hero--two-column">
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
                  <a class="btn" href="#discover" @click.prevent="scrollToDiscover">Discover</a>
                  <RouterLink class="btn ghost" to="/reflect">Try Self-Check</RouterLink>
                </div>
                <p class="helper">
                  Built for comfort and safety: youth-friendly content, moderated spaces, and clear referral paths.
                </p>
              </div>
            </div>

            <!-- Right: the four bullet points card -->
            <div class="hero-right">
              <div class="hero-bullets card card-dark-brown">
                <ul class="helper">
                  <li><strong>Discover</strong> bite-size resources (stress, sleep, online safety)</li>
                  <li><strong>Reflect</strong> quick self-check with instant tips</li>
                  <li><strong>Connect</strong> community principles &amp; safe sharing</li>
                  <li><strong>Refer</strong> qservice directory and what to expect</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Divider Line -->
    <div class="section-divider">
      <div class="divider-line"></div>
    </div>

    <!-- Discover Section -->
    <section class="discover-section snap-section" id="discover">
      <div class="container">
        <div class="discover-layout">
          <!-- Left: Topic Cards in vertical stack -->
          <div class="topics-left">
            <div class="topics-stack">
              <div v-for="(t, i) in topics" :key="t.id" class="topic-item">
                <TopicCard
                  :topic="t"
                  :bg="tileColors[i]?.bg"
                  :fg="tileColors[i]?.fg"
                />
              </div>
            </div>
          </div>

          <!-- Right: Title and description -->
          <div class="discover-right">
            <h2 class="discover-title">Discover Resources</h2>

            <p class="discover-description">
              Explore our carefully curated collection of mental health and wellbeing resources, specifically designed for young people aged 12-25.
            </p>

            <div class="discover-features">
              <p><strong>1. Practical Tools</strong> - Evidence-based strategies and supportive guidance to help you navigate life's challenges</p>

              <p><strong>2. Key Areas</strong> - Managing stress, improving sleep quality, staying safe online, and adapting to major life changes</p>

              <p><strong>3. Immediate Support</strong> - Bite-sized resources that offer actionable support when you need it most</p>

              <p><strong>4. Personalized Tips</strong> - Click on any topic to discover techniques that can make a real difference in your daily life</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to top link for discover section -->
      <a href="#hero" @click.prevent="scrollToHero" class="back-to-top">↑ back to top</a>
    </section>

    <!-- Divider Line -->
    <div class="section-divider">
      <div class="divider-line"></div>
    </div>

    <!-- Refer Section -->
    <section class="refer-section snap-section" id="refer">
      <div class="container">
        <h2 style="margin:2rem 0 1.5rem; text-align:center; font-size:2.2rem;">Get Support</h2>
        <p style="text-align:center; color:var(--muted); margin-bottom:2rem; font-size:1.1rem;">
          A friendly directory of local and online services. External links open in a new tab.
        </p>

        <div class="services-grid">
          <article
            v-for="(svc, i) in services"
            :key="svc.id || i"
            class="card service-card"
          >
            <h3 style="margin-top:0">{{ svc.name }}</h3>
            <p class="helper" v-if="svc.description">{{ svc.description }}</p>
            <p class="service-type" v-if="svc.type">{{ svc.type }}</p>

            <div class="service-links">
              <!-- phone -->
              <span v-if="svc.phone" class="contact-item">
                <strong>Phone:</strong>
                <a :href="`tel:${svc.phone}`">{{ svc.phone }}</a>
              </span>

              <!-- email -->
              <span v-if="svc.email" class="contact-item">
                <strong>Email:</strong>
                <a :href="`mailto:${svc.email}`">{{ svc.email }}</a>
              </span>

              <!-- website (EXTERNAL LINK HARDENED) -->
              <span v-if="svc.url" class="contact-item">
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
              <span v-if="svc.address" class="contact-item">
                <strong>Address:</strong>
                <span>{{ svc.address }}</span>
              </span>
            </div>
          </article>
        </div>
      </div>

      <!-- Back to top link for refer section -->
      <a href="#hero" @click.prevent="scrollToHero" class="back-to-top">↑ back to top</a>
    </section>
  </div>
</template>

<style scoped>
/* Page container for sections */
.page-container {
  scroll-behavior: smooth;
}

/* Snap sections for scroll capture */
.snap-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
}

/* Hero section specific styling */
.hero-section {
  background: linear-gradient(135deg, var(--bg) 0%, rgba(236,251,243,0.8) 100%);
}

/* Two-column hero layout */
.hero--two-column {
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

/* Dark brown variant for the right side card */
.card-dark-brown {
  background: rgba(139, 109, 76, 0.5) !important;  /* Lighter brown with 50% transparency */
  border-color: rgba(160, 130, 98, 0.6) !important;  /* Lighter brown border */
  color: white !important;
}

.card-dark-brown ul {
  color: white;
}

.card-dark-brown li {
  color: white;
}

.card-dark-brown strong {
  color: #f4e4bc;  /* Light cream color for emphasis */
}

.card-dark-brown .helper {
  color: rgba(255, 255, 255, 0.9);
}

/* Section divider styling */
.section-divider {
  height: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  position: relative;
  z-index: 10;
}

.divider-line {
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--border) 20%, var(--muted) 50%, var(--border) 80%, transparent);
  border-radius: 2px;
}

/* Discover section styling */
.discover-section {
  background: linear-gradient(135deg, rgba(247,254,250,0.9) 0%, var(--bg) 100%);
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.discover-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
}

.topics-left {
  display: flex;
  justify-content: flex-start;
}

.topics-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.topic-item {
  width: 100%;
}

.discover-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  padding-left: 2rem;
}

.discover-title {
  margin: 0 0 1.5rem 0;
  font-size: 2.2rem;
  color: var(--text);
  line-height: 1.2;
}

.discover-description {
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.discover-features {
  margin-top: 1.5rem;
}

.discover-features p {
  margin: 1rem 0;
  line-height: 1.5;
  font-size: 1rem;
}

.discover-features strong {
  color: var(--text);
  font-weight: 600;
}

/* Refer section styling */
.refer-section {
  background: linear-gradient(135deg, rgba(240,248,255,0.9) 0%, rgba(248,250,252,1) 100%);
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.services-grid {
  display: grid;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.service-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16,78,56,.12);
}

.service-type {
  color: var(--brand-600);
  font-weight: 500;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  padding: 0.25rem 0.75rem;
  background: rgba(34,197,94,0.1);
  border-radius: 12px;
  display: inline-block;
}

.service-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-item strong {
  color: var(--text);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-item a {
  color: var(--link);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.contact-item a:hover {
  color: var(--brand-600);
  text-decoration: underline;
}

.discover-section h2 {
  color: var(--text);
  margin-bottom: 1rem;
}

.discover-section .grid {
  margin-top: 2rem;
}

/* Remove default smooth scrolling as we control it via JS */
html {
  scroll-behavior: auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .snap-section {
    min-height: 100vh;
  }
  
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
  
  .discover-section {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  .discover-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .topics-left {
    justify-content: center;
  }
  
  .topics-stack {
    max-width: 100%;
    align-items: center;
  }
  
  .discover-right {
    padding-left: 0;
    text-align: center;
    order: -1;
  }
  
  .discover-title {
    font-size: 1.8rem;
  }
  
  .refer-section {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  .divider-line {
    width: 80%;
  }
  
  .contact-item {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Back to top link styling */
.back-to-top {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: var(--muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  opacity: 0.7;
}

.back-to-top:hover {
  color: var(--brand-600);
  background: rgba(255, 255, 255, 0.95);
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Optional: slightly smaller sections on very small screens */
@media (max-width: 640px) {
  .snap-section {
    min-height: 95vh;
  }

  .back-to-top {
    bottom: 15px;
    right: 15px;
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}
</style>