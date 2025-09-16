<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../store/auth';
import { useRouter, RouterLink } from 'vue-router';
const { state, isAuthed, role, logout } = useAuth();
const router = useRouter();
const showDropdown = ref(false);
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
  } else {
    if (scrollDirection === 'down' && Math.abs(scrollDelta) > 5) {
      // Hide navbar when scrolling down
      navbarVisible.value = false;
    } else if (scrollDirection === 'up' && Math.abs(scrollDelta) > 5) {
      // Show navbar when scrolling up
      navbarVisible.value = true;
    }
  }

  lastScrollY = currentScrollY;
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
            <RouterLink to="/FireLogin" class="auth-link">Login</RouterLink>
            <RouterLink to="/FireRegister" class="auth-link">Register</RouterLink>
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
                  <RouterLink to="/my-account" class="dropdown-item">My Account</RouterLink>
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
  
}

@media (max-width: 480px) {
  /* Additional responsive styles can be added here if needed */
}

</style>