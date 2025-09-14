<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../store/auth';
import { checkRateLimit, sanitizeTextInput } from '../../utils/security';

const usernameOrEmail = ref('');
const password = ref('');
const errors = ref({});
const router = useRouter();
const route = useRoute();
const { login } = useAuth();

// Validation functions
function validateUsernameOrEmail(value) {
  if (!value) {
    return 'Username or email is required';
  }
  return null;
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }
  return null;
}

function validateForm() {
  const newErrors = {};
  
  const usernameOrEmailError = validateUsernameOrEmail(usernameOrEmail.value);
  if (usernameOrEmailError) newErrors.usernameOrEmail = usernameOrEmailError;
  
  const passwordError = validatePassword(password.value);
  if (passwordError) newErrors.password = passwordError;
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

async function onSubmit(){
  if (!validateForm()) {
    return;
  }

  // Check rate limiting to prevent brute force attacks
  const rateLimitKey = `login:${usernameOrEmail.value.trim().toLowerCase()}`;
  const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes

  if (!rateLimit.isAllowed) {
    const resetMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000));
    errors.value.general = `Too many login attempts. Please try again in ${resetMinutes} minute(s).`;
    return;
  }

  try {
    // Sanitize inputs before sending to login function
    const sanitizedEmail = sanitizeTextInput(usernameOrEmail.value.trim());

    await login({ email: sanitizedEmail, password: password.value });
    router.push(route.query.redirect || '/');
  } catch (e) {
    // Add failed attempt to rate limit tracking
    rateLimit.addAttempt();

    errors.value.general = e.message || 'Login failed';
  }
}
</script>

<template>
  <section class="container login-container">
    <div class="card">
      <h2>Welcome Back</h2>
      
      <!-- Username or Email -->
      <div class="field-group">
        <label class="field-label">Username or Email <span class="required">*</span></label>
        <input 
          class="input" 
          v-model.trim="usernameOrEmail" 
          placeholder="Enter your username or email address"
          autocomplete="username"
          :class="{ 'error-input': errors.usernameOrEmail }"
        />
        <div class="error" v-if="errors.usernameOrEmail">{{ errors.usernameOrEmail }}</div>
      </div>
      
      <!-- Password -->
      <div class="field-group">
        <label class="field-label">Password <span class="required">*</span></label>
        <input 
          class="input" 
          v-model="password" 
          type="password" 
          placeholder="Enter your password"
          autocomplete="current-password"
          :class="{ 'error-input': errors.password }"
          @keyup.enter="onSubmit"
        />
        <div class="error" v-if="errors.password">{{ errors.password }}</div>
      </div>
      
      <!-- General Error -->
      <div class="error" v-if="errors.general" style="margin-top: 1rem; text-align: center;">{{ errors.general }}</div>
      
      <!-- Submit Button -->
      <button class="btn" style="margin-top: 2rem; width: 100%;" @click="onSubmit">
        Sign In
      </button>
      
      <!-- Register Link -->
      <div style="text-align: center; margin-top: 1rem;">
        <span class="helper">Don't have an account? </span>
        <RouterLink to="/register" class="register-link">Create one here</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.card {
  padding: 2rem;
}

.card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text);
  font-size: 1.8rem;
}

.field-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text);
  font-size: 0.95rem;
}

.required {
  color: var(--danger);
  font-weight: bold;
  margin-left: 2px;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid var(--border);
  background: var(--card);
  color: var(--text);
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--brand-600);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input.error-input {
  border-color: var(--danger);
  background-color: rgba(239, 68, 68, 0.05);
}

.input.error-input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
}

.btn {
  background: var(--brand-600);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  background: var(--brand);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.helper {
  color: var(--muted);
  font-size: 0.9rem;
}

.register-link {
  color: var(--brand-600);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: var(--brand);
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 640px) {
  .login-container {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }
  
  .card {
    padding: 1.5rem;
  }
  
  .card h2 {
    font-size: 1.5rem;
  }
}
</style>