<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuth } from '../store/auth';
import { loadUserHistory } from '../utils/history';

const { state, updateUserInfo } = useAuth();

// Form fields
const username = ref('');
const email = ref('');
const address = ref('');
const emergencyContactName = ref('');
const emergencyContactPhone = ref('');

// Password change fields
const showPasswordChange = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

// UI state
const isEditing = ref(false);
const isSaving = ref(false);
const errors = ref({});
const successMessage = ref('');

// History state
const userHistory = ref([]);
const sortOrder = ref('newest'); // 'newest' or 'oldest'

// Computed sorted history
const sortedHistory = computed(() => {
  if (sortOrder.value === 'newest') {
    return [...userHistory.value].sort((a, b) => b.ts - a.ts);
  } else {
    return [...userHistory.value].sort((a, b) => a.ts - b.ts);
  }
});

// Listen for localStorage changes to refresh history when new self-check is submitted
let storageListener;

// Load user info when component mounts
onMounted(() => {
  if (state.user) {
    username.value = state.user.username || '';
    email.value = state.user.email || '';
    address.value = state.user.address || '';
    emergencyContactName.value = state.user.emergencyContactName || '';
    emergencyContactPhone.value = state.user.emergencyContactPhone || '';

    // Load user's self-check history
    loadHistory();
  }

  // Listen for localStorage changes (when user submits new self-check)
  storageListener = (e) => {
    if (e.key === 'reflect_history_v1' && state.user?.email) {
      loadHistory(); // Refresh history when localStorage changes
    }
  };
  window.addEventListener('storage', storageListener);
});

// Clean up event listener when component unmounts
onUnmounted(() => {
  if (storageListener) {
    window.removeEventListener('storage', storageListener);
  }
});

function loadHistory() {
  if (state.user?.email) {
    userHistory.value = loadUserHistory(state.user.email);
  }
}

function refreshHistory() {
  loadHistory();
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'newest' ? 'oldest' : 'newest';
}

// Helper functions for formatting
function formatDate(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

function getMoodText(mood) {
  const map = {
    1: 'Very low 😞',
    2: 'Low 🙁',
    3: 'OK 🙂',
    4: 'Good 😃',
    5: 'Great 🤩'
  };
  return map[Number(mood)] || mood;
}

// Validation functions (same as Register.vue)
function validateUsername(value) {
  if (!value || value.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  if (!/^[a-zA-Z]+$/.test(value)) {
    return 'Username must contain only letters';
  }
  return null;
}

function validateAustralianAddress(value) {
  if (!value) {
    return 'Address is required';
  }
  const ausAddressRegex = /^\d+\s+[a-zA-Z\s]+,\s*[a-zA-Z\s]+,\s*(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+\d{4}$/i;
  if (!ausAddressRegex.test(value)) {
    return 'Please enter a valid Australian address format: "123 Street Name, Suburb, STATE 1234"';
  }
  return null;
}

function validatePhoneNumber(value) {
  if (value && !/^(\+61|0)[2-9]\d{8}$/.test(value.replace(/\s/g, ''))) {
    return 'Please enter a valid Australian phone number';
  }
  return null;
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(value)) {
    return 'Password must contain at least one number';
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

function validateForm() {
  const newErrors = {};

  const usernameError = validateUsername(username.value);
  if (usernameError) newErrors.username = usernameError;

  const addressError = validateAustralianAddress(address.value);
  if (addressError) newErrors.address = addressError;

  const phoneError = validatePhoneNumber(emergencyContactPhone.value);
  if (phoneError) newErrors.emergencyContactPhone = phoneError;

  // Password validation if changing password
  if (showPasswordChange.value) {
    if (!currentPassword.value) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (newPassword.value) {
      const passwordError = validatePassword(newPassword.value);
      if (passwordError) newErrors.newPassword = passwordError;
    } else {
      newErrors.newPassword = 'New password is required';
    }

    if (confirmNewPassword.value !== newPassword.value) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

function startEditing() {
  isEditing.value = true;
  successMessage.value = '';
  errors.value = {};
}

function cancelEditing() {
  isEditing.value = false;
  showPasswordChange.value = false;
  errors.value = {};
  successMessage.value = '';

  // Reset form values
  if (state.user) {
    username.value = state.user.username || '';
    address.value = state.user.address || '';
    emergencyContactName.value = state.user.emergencyContactName || '';
    emergencyContactPhone.value = state.user.emergencyContactPhone || '';
  }

  // Clear password fields
  currentPassword.value = '';
  newPassword.value = '';
  confirmNewPassword.value = '';
}

async function saveChanges() {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  errors.value = {};
  successMessage.value = '';

  try {
    const updateData = {
      username: username.value.trim(),
      address: address.value.trim(),
      emergencyContactName: emergencyContactName.value.trim(),
      emergencyContactPhone: emergencyContactPhone.value.trim(),
    };

    // Include password data if changing password
    if (showPasswordChange.value) {
      updateData.currentPassword = currentPassword.value;
      updateData.newPassword = newPassword.value;
    }

    await updateUserInfo(updateData);

    isEditing.value = false;
    showPasswordChange.value = false;
    successMessage.value = 'Account information updated successfully!';

    // Clear password fields
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';

  } catch (error) {
    errors.value.general = error.message || 'Failed to update account information';
  } finally {
    isSaving.value = false;
  }
}

function togglePasswordChange() {
  showPasswordChange.value = !showPasswordChange.value;
  if (!showPasswordChange.value) {
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
    errors.value.currentPassword = null;
    errors.value.newPassword = null;
    errors.value.confirmNewPassword = null;
  }
}
</script>

<template>
  <section class="container account-container">
    <div class="card">
      <div class="card-header">
        <h2>My Account</h2>
        <div class="header-actions" v-if="!isEditing">
          <button class="btn-primary" @click="startEditing">Edit Profile</button>
        </div>
      </div>

      <!-- Success Message -->
      <div class="success-message" v-if="successMessage">
        {{ successMessage }}
      </div>

      <!-- Account Information Section -->
      <div class="form-section">
        <h3 class="section-title">Account Information</h3>

        <!-- Email (Read-only) -->
        <div class="field-group">
          <label class="field-label">Email</label>
          <input
            class="input read-only"
            v-model="email"
            type="email"
            readonly
            disabled
          />
          <small class="helper">Email cannot be changed</small>
        </div>

        <!-- Username -->
        <div class="field-group">
          <label class="field-label">Username <span class="required">*</span></label>
          <input
            class="input"
            v-model.trim="username"
            placeholder="Enter your username (letters only, min 3 characters)"
            :readonly="!isEditing"
            :class="{ 'error-input': errors.username, 'read-only': !isEditing }"
          />
          <div class="error" v-if="errors.username">{{ errors.username }}</div>
        </div>

        <!-- Address -->
        <div class="field-group">
          <label class="field-label">Address <span class="required">*</span></label>
          <input
            class="input"
            v-model.trim="address"
            placeholder="123 Street Name, Suburb, STATE 1234"
            :readonly="!isEditing"
            :class="{ 'error-input': errors.address, 'read-only': !isEditing }"
          />
          <div class="address-help" v-if="isEditing">
            <small class="helper">Australian address format: Street number and name, Suburb, State abbreviation, Postcode</small>
          </div>
          <div class="error" v-if="errors.address">{{ errors.address }}</div>
        </div>
      </div>

      <!-- Emergency Contact Section -->
      <div class="form-section">
        <h3 class="section-title">Emergency Contact</h3>

        <!-- Emergency Contact Name -->
        <div class="field-group">
          <label class="field-label">Emergency Contact Name</label>
          <input
            class="input"
            v-model.trim="emergencyContactName"
            placeholder="Full name of emergency contact"
            :readonly="!isEditing"
            :class="{ 'read-only': !isEditing }"
          />
        </div>

        <!-- Emergency Contact Phone -->
        <div class="field-group">
          <label class="field-label">Emergency Contact Phone</label>
          <input
            class="input"
            v-model.trim="emergencyContactPhone"
            type="tel"
            placeholder="Australian phone number (e.g., 0412 345 678)"
            :readonly="!isEditing"
            :class="{ 'error-input': errors.emergencyContactPhone, 'read-only': !isEditing }"
          />
          <div class="error" v-if="errors.emergencyContactPhone">{{ errors.emergencyContactPhone }}</div>
        </div>
      </div>

      <!-- Password Change Section -->
      <div class="form-section" v-if="isEditing">
        <div class="section-header">
          <h3 class="section-title">Change Password</h3>
          <button
            class="btn-secondary small"
            @click="togglePasswordChange"
            type="button"
          >
            {{ showPasswordChange ? 'Cancel Password Change' : 'Change Password' }}
          </button>
        </div>

        <div v-if="showPasswordChange" class="password-change-fields">
          <!-- Current Password -->
          <div class="field-group">
            <label class="field-label">Current Password <span class="required">*</span></label>
            <input
              class="input"
              v-model="currentPassword"
              type="password"
              placeholder="Enter your current password"
              :class="{ 'error-input': errors.currentPassword }"
            />
            <div class="error" v-if="errors.currentPassword">{{ errors.currentPassword }}</div>
          </div>

          <!-- New Password -->
          <div class="field-group">
            <label class="field-label">New Password <span class="required">*</span></label>
            <input
              class="input"
              v-model="newPassword"
              type="password"
              placeholder="Create a strong password"
              :class="{ 'error-input': errors.newPassword }"
            />
            <div class="password-requirements">
              <small class="helper">Must contain: lowercase, uppercase, number, special character (min 8 characters)</small>
            </div>
            <div class="error" v-if="errors.newPassword">{{ errors.newPassword }}</div>
          </div>

          <!-- Confirm New Password -->
          <div class="field-group">
            <label class="field-label">Confirm New Password <span class="required">*</span></label>
            <input
              class="input"
              v-model="confirmNewPassword"
              type="password"
              placeholder="Re-enter your new password"
              :class="{ 'error-input': errors.confirmNewPassword }"
            />
            <div class="error" v-if="errors.confirmNewPassword">{{ errors.confirmNewPassword }}</div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error" v-if="errors.general" style="margin-top: 1rem; text-align: center;">
        {{ errors.general }}
      </div>

      <!-- Action Buttons -->
      <div class="actions" v-if="isEditing">
        <button class="btn-secondary" @click="cancelEditing" :disabled="isSaving">
          Cancel
        </button>
        <button class="btn-primary" @click="saveChanges" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Self-Check History Section -->
    <div class="history-container" v-if="userHistory.length > 0">
      <!-- Sort Control -->
      <div class="sort-control">
        <button class="sort-button" @click="toggleSortOrder">
          <svg class="sort-icon" :class="{ 'rotate': sortOrder === 'oldest' }" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3l4 4H4l4-4z"/>
            <path d="M8 13l4-4H4l4 4z"/>
          </svg>
          {{ sortOrder === 'newest' ? 'Newest First' : 'Oldest First' }}
        </button>
        <button class="refresh-button" @click="refreshHistory" title="Refresh History">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"/>
          </svg>
          Refresh
        </button>
      </div>

      <!-- History Cards -->
      <div class="history-grid">
        <div v-for="entry in sortedHistory" :key="entry.id" class="history-card card">
          <div class="history-header">
            <div class="history-info">
              <h4 class="history-title">Self-Check Results</h4>
              <p class="history-date">{{ formatDate(entry.ts) }}</p>
            </div>
            <div class="mood-indicator" :class="`mood-${entry.mood}`">
              {{ getMoodText(entry.mood) }}
            </div>
          </div>

          <div class="history-details">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Age:</span>
                <span class="detail-value">{{ entry.age }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Sleep:</span>
                <span class="detail-value">{{ entry.sleepHours }}h</span>
              </div>
              <div class="detail-item" v-if="entry.notes">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">{{ entry.notes }}</span>
              </div>
            </div>
          </div>

          <div class="suggestions-section" v-if="entry.suggestions && entry.suggestions.length > 0">
            <h5 class="suggestions-title">Suggestions</h5>
            <ul class="suggestions-list">
              <li v-for="(suggestion, index) in entry.suggestions" :key="index" class="suggestion-item">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty History State -->
    <div class="empty-history card" v-else>
      <div class="empty-history-content">
        <h3>No Self-Check History</h3>
        <p class="helper">Complete a self-check on the <RouterLink to="/reflect" class="link">Reflect</RouterLink> page to see your history here.</p>
        <button class="refresh-button" @click="refreshHistory" style="margin-top: 1rem;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"/>
          </svg>
          Check for New History
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.account-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.card {
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
}

.card-header h2 {
  color: var(--text);
  font-size: 1.8rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.success-message {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: var(--brand-600);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 500;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.input.read-only {
  background: var(--bg);
  border-color: var(--border-light);
  cursor: not-allowed;
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

.password-requirements,
.address-help {
  margin-top: 0.5rem;
}

.password-requirements .helper,
.address-help .helper {
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.4;
}

.helper {
  color: var(--muted);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.password-change-fields {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  margin-top: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.btn-primary {
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

.btn-primary:hover:not(:disabled) {
  background: var(--brand);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: transparent;
  color: var(--muted);
  border: 2px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--text);
  color: var(--text);
}

.btn-secondary.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* History Section Styles */
.history-container {
  margin-top: 2rem;
}

.sort-control {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sort-button {
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-button:hover {
  border-color: var(--brand-600);
  color: var(--brand-600);
  background: rgba(34, 197, 94, 0.05);
}

.sort-icon {
  transition: transform 0.3s ease;
  color: var(--muted);
}

.sort-icon.rotate {
  transform: rotate(180deg);
}

.refresh-button {
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-button:hover {
  border-color: var(--brand-600);
  color: var(--brand-600);
  background: rgba(34, 197, 94, 0.05);
}

.refresh-button:active {
  transform: scale(0.98);
}

.history-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.history-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 78, 56, 0.12);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.history-info {
  flex: 1;
}

.history-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.history-date {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.mood-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  min-width: 120px;
  white-space: nowrap;
}

.mood-1 {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.mood-2 {
  background: rgba(245, 101, 101, 0.1);
  color: #ea580c;
  border: 1px solid rgba(245, 101, 101, 0.2);
}

.mood-3 {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.mood-4 {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.mood-5 {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.history-details {
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.detail-value {
  font-size: 0.95rem;
  color: var(--text);
  font-weight: 500;
}

.suggestions-section {
  background: rgba(251, 213, 192, 0.3);
  border: 1px solid rgba(251, 213, 192, 0.5);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.suggestions-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
}

.suggestions-list {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text);
}

.suggestion-item {
  margin-bottom: 0.5rem;
  line-height: 1.4;
  font-size: 0.9rem;
}

.suggestion-item:last-child {
  margin-bottom: 0;
}

.empty-history {
  margin-top: 2rem;
  text-align: center;
  padding: 3rem 2rem;
}

.empty-history-content h3 {
  margin: 0 0 1rem 0;
  color: var(--text);
  font-size: 1.2rem;
}

.empty-history-content .helper {
  font-size: 1rem;
  line-height: 1.5;
}

.empty-history-content .link {
  color: var(--brand-600);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.empty-history-content .link:hover {
  color: var(--brand);
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 640px) {
  .account-container {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }

  .card {
    padding: 1.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-header h2 {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .history-grid {
    grid-template-columns: 1fr;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .mood-indicator {
    align-self: flex-start;
    min-width: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .sort-button {
    padding: 0.625rem 1.25rem;
    font-size: 0.85rem;
  }

  .empty-history {
    padding: 2rem 1rem;
  }
}
</style>