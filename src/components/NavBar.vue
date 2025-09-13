<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../store/auth';
import { useRouter, RouterLink } from 'vue-router';
const { state, isAuthed, role, logout } = useAuth();
const router = useRouter();
const showDropdown = ref(false);
const showSidebar = ref(false);
const showSidebarButton = ref(false);
const navbarVisible = ref(true);
let lastScrollY = 0;
let scrollDirection = 'up';

function doLogout(){ 
  logout(); 
  router.push('/'); 
  showDropdown.value = false;
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function closeDropdown() {
  showDropdown.value = false;
}

function handleClickOutside(event) {
  if (!event.target.closest('.user-dropdown')) {
    showDropdown.value = false;
  }
  if (!event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
    showSidebar.value = false;
  }
}

function handleScroll() {
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  
  // Determine scroll direction
  if (scrollDelta > 0) {
    scrollDirection = 'down';
  } else if (scrollDelta < 0) {
    scrollDirection = 'up';
  }
  
  // Handle navbar visibility
  if (currentScrollY < 100) {
    // Always show navbar at top of page
    navbarVisible.value = true;
    showSidebarButton.value = false;
  } else {
    if (scrollDirection === 'down' && Math.abs(scrollDelta) > 5) {
      // Hide navbar when scrolling down
      navbarVisible.value = false;
      showSidebarButton.value = true;
    } else if (scrollDirection === 'up' && Math.abs(scrollDelta) > 5) {
      // Show navbar when scrolling up
      navbarVisible.value = true;
      showSidebarButton.value = false;
    }
  }
  
  lastScrollY = currentScrollY;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  closeSidebar();
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

function closeSidebar() {
  showSidebar.value = false;
}

function scrollToRefer() {
  // If we're on the home page, scroll to refer section
  if (router.currentRoute.value.path === '/') {
    document.getElementById('refer')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  } else {
    // If we're on another page, navigate to home then scroll
    router.push('/').then(() => {
      setTimeout(() => {
        document.getElementById('refer')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      }, 100);
    });
  }
}


onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header class="site" :class="{ 'navbar-hidden': !navbarVisible }">
    <div class="container">
      <nav class="nav-wrapper">
        <!-- Logo -->
        <div class="brand-section">
          <RouterLink to="/" class="brand">Youth Wellbeing</RouterLink>
        </div>
        
        <!-- Main Navigation (Center) -->
        <ul class="main-nav">
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/reflect">Reflect</RouterLink></li>
          <li><RouterLink to="/connect">Connect</RouterLink></li>
          <li><a href="/#refer" @click.prevent="scrollToRefer">Refer</a></li>
        </ul>

        <!-- User Section (Right) -->
        <div class="user-section">
          <template v-if="!isAuthed">
            <RouterLink to="/login" class="auth-link">Login</RouterLink>
            <RouterLink to="/register" class="auth-link">Register</RouterLink>
          </template>
          
          <template v-else>
            <div class="user-dropdown" @click.stop>
              <button class="user-button" @click="toggleDropdown">
                <span class="user-email">{{ state.user?.email }}</span>
                <svg class="dropdown-icon" :class="{ 'rotate': showDropdown }" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 11l-4-4h8l-4 4z"/>
                </svg>
              </button>
              
              <div class="dropdown-menu" :class="{ 'show': showDropdown }" @click="closeDropdown">
                <!-- USER MENU -->
                <template v-if="role === 'user'">
                  <RouterLink to="/reviews" class="dropdown-item">Reviews</RouterLink>
                  <RouterLink to="/my-reviews" class="dropdown-item">My Reviews</RouterLink>
                </template>

                <!-- ADMIN MENU -->
                <template v-if="role === 'admin'">
                  <RouterLink to="/results" class="dropdown-item">Result View</RouterLink>
                  <RouterLink to="/reviews-admin" class="dropdown-item">Ratings Admin</RouterLink>
                  <RouterLink to="/admin" class="dropdown-item">Admin</RouterLink>
                </template>
                
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout-btn" @click="doLogout">Logout</button>
              </div>
            </div>
          </template>
        </div>
      </nav>
    </div>
  </header>

  <!-- Sidebar Toggle Button -->
  <div 
    class="sidebar-toggle" 
    :class="{ 'show': showSidebarButton }"
    @click="toggleSidebar"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </div>

  <!-- Sidebar Dropdown -->
  <div class="sidebar-overlay" :class="{ 'show': showSidebar }" @click="closeSidebar"></div>
  <div class="sidebar" :class="{ 'show': showSidebar }">
    <div class="sidebar-content">
      <!-- User Section -->
      <template v-if="!isAuthed">
        <ul class="sidebar-nav">
          <li><RouterLink to="/login" @click="closeSidebar">Login</RouterLink></li>
          <li><RouterLink to="/register" @click="closeSidebar">Register</RouterLink></li>
          <li><button class="sidebar-btn" @click="scrollToTop">Back to Top</button></li>
        </ul>
      </template>
      
      <template v-else>
        <div class="user-info">
          <span class="user-email">{{ state.user?.email }}</span>
        </div>
        <ul class="sidebar-nav">
          <!-- USER MENU -->
          <template v-if="role === 'user'">
            <li><RouterLink to="/reviews" @click="closeSidebar">Reviews</RouterLink></li>
            <li><RouterLink to="/my-reviews" @click="closeSidebar">My Reviews</RouterLink></li>
          </template>

          <!-- ADMIN MENU -->
          <template v-if="role === 'admin'">
            <li><RouterLink to="/results" @click="closeSidebar">Result View</RouterLink></li>
            <li><RouterLink to="/reviews-admin" @click="closeSidebar">Ratings Admin</RouterLink></li>
            <li><RouterLink to="/admin" @click="closeSidebar">Admin</RouterLink></li>
          </template>
          
          <li><button class="sidebar-btn" @click="scrollToTop">Back to Top</button></li>
          <li><button class="logout-btn" @click="doLogout">Logout</button></li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
.site {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.site.navbar-hidden {
  transform: translateY(-100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  position: relative;
}

.brand-section {
  flex: 1;
}

.brand {
  font-weight: 700;
  font-size: 1.2rem;
  color: #333;
  text-decoration: none;
}

.brand:hover {
  color: #007bff;
}

.main-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.main-nav li a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.main-nav li a:hover {
  color: #007bff;
  background-color: #f8f9fa;
}

.main-nav li a.router-link-active {
  color: #007bff;
  background-color: #e3f2fd;
}

.user-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.auth-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.auth-link:hover {
  color: #007bff;
  background-color: #f8f9fa;
}

.user-dropdown {
  position: relative;
}

.user-button {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background-color: #fff;
}

.user-button:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0,123,255,0.1);
}

.user-email {
  font-size: 0.9rem;
  color: #333;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  transition: transform 0.2s ease;
  color: #666;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.8);  /* Semi-transparent background */
  border: 1px solid rgba(229, 229, 229, 0.6);  /* Semi-transparent border */
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  backdrop-filter: blur(12px);  /* Frosted glass effect */
  -webkit-backdrop-filter: blur(12px);  /* Safari support */
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1001;
  margin-top: 4px;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.dropdown-item:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.dropdown-divider {
  height: 1px;
  background-color: #e5e5e5;
  margin: 0.5rem 0;
}

.logout-btn {
  color: #dc3545;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: #f8d7da;
  color: #721c24;
}

/* Sidebar Toggle Button */
.sidebar-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: var(--brand-600);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-20px);
  transition: all 0.3s ease;
  z-index: 1002;
}

.sidebar-toggle.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.sidebar-toggle:hover {
  background: var(--brand);
  transform: scale(1.05);
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1003;
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* Sidebar Dropdown */
.sidebar {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 250px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-20px);
  transition: all 0.3s ease;
  z-index: 1004;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.sidebar.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.sidebar-content {
  padding: 1rem;
}

.user-info {
  padding: 0.75rem 1rem;
  background: var(--brand-50);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.user-info .user-email {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--brand-600);
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 0.5rem;
}

.sidebar-nav a,
.sidebar-nav .sidebar-btn,
.sidebar-nav .logout-btn {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.sidebar-nav a:hover,
.sidebar-nav .sidebar-btn:hover {
  background: var(--brand-50);
  color: var(--brand-600);
}

.sidebar-nav a.router-link-active {
  background: var(--brand-600);
  color: white;
}

.sidebar-nav .sidebar-btn {
  color: var(--muted);
  border-top: 1px solid var(--border);
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.sidebar-nav .sidebar-btn:hover {
  background: var(--brand-50);
  color: var(--brand-600);
}

.sidebar-nav .logout-btn {
  color: var(--danger);
  margin-top: 0.25rem;
}

.sidebar-nav .logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-wrapper {
    flex-direction: column;
    height: auto;
    padding: 1rem 0;
  }
  
  .main-nav {
    position: static;
    transform: none;
    margin: 1rem 0;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .user-section {
    justify-content: center;
  }
  
  .sidebar {
    width: 220px;
    right: 15px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: calc(100vw - 30px);
    right: 15px;
    left: 15px;
  }
  
  .sidebar-toggle {
    top: 15px;
    right: 15px;
    width: 45px;
    height: 45px;
  }
}

</style>