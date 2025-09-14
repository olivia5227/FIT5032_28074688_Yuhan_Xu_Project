<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../store/auth';

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

// Load user info when component mounts
onMounted(() => {
  if (state.user) {
    username.value = state.user.username || '';
    email.value = state.user.email || '';
    address.value = state.user.address || '';
    emergencyContactName.value = state.user.emergencyContactName || '';
    emergencyContactPhone.value = state.user.emergencyContactPhone || '';
  }
});

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
}
</style>