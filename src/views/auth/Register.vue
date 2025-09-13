<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../store/auth';

// Required fields
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const address = ref('');

// Optional fields
const emergencyContactName = ref('');
const emergencyContactPhone = ref('');
const role = ref('user');

const errors = ref({});
const router = useRouter();
const { register } = useAuth();

// Administrator verification
const showAdminVerification = ref(false);
const adminCode = ref('');
const ADMIN_VERIFICATION_CODE = '191919';

// Handle role change
function onRoleChange() {
  if (role.value === 'admin') {
    showAdminVerification.value = true;
    adminCode.value = '';
  }
}

// Verify admin code
function verifyAdminCode() {
  if (adminCode.value === ADMIN_VERIFICATION_CODE) {
    showAdminVerification.value = false;
    errors.value.adminCode = null;
  } else {
    errors.value.adminCode = 'Verification code incorrect. Registration as administrator is not supported.';
  }
}

// Cancel admin verification
function cancelAdminVerification() {
  showAdminVerification.value = false;
  role.value = 'user';
  adminCode.value = '';
  errors.value.adminCode = null;
}

// Validation functions
function validateUsername(value) {
  if (!value || value.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  if (!/^[a-zA-Z]+$/.test(value)) {
    return 'Username must contain only letters';
  }
  return null;
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
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

function validateConfirmPassword(value) {
  if (!value) {
    return 'Please confirm your password';
  }
  if (value !== password.value) {
    return 'Passwords do not match';
  }
  return null;
}

function validateAustralianAddress(value) {
  if (!value) {
    return 'Address is required';
  }
  // Australian address pattern: number + street name + suburb + state + postcode
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

function validateForm() {
  const newErrors = {};
  
  // Validate required fields
  const usernameError = validateUsername(username.value);
  if (usernameError) newErrors.username = usernameError;
  
  const emailError = validateEmail(email.value);
  if (emailError) newErrors.email = emailError;
  
  const passwordError = validatePassword(password.value);
  if (passwordError) newErrors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(confirmPassword.value);
  if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
  
  const addressError = validateAustralianAddress(address.value);
  if (addressError) newErrors.address = addressError;
  
  // Validate optional fields (only for users)
  if (role.value === 'user') {
    const phoneError = validatePhoneNumber(emergencyContactPhone.value);
    if (phoneError) newErrors.emergencyContactPhone = phoneError;
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

async function onSubmit() {
  if (!validateForm()) {
    return;
  }
  
  try {
    const registrationData = {
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      address: address.value.trim(),
      role: role.value
    };
    
    // Only include emergency contact for users
    if (role.value === 'user') {
      registrationData.emergencyContactName = emergencyContactName.value.trim();
      registrationData.emergencyContactPhone = emergencyContactPhone.value.trim();
    }
    
    await register(registrationData);
    router.push('/');
  } catch (e) {
    errors.value.general = e.message || 'Registration failed';
  }
}
</script>

<template>
  <section class="container register-container">
    <div class="card">
      <h2>Create Your Account</h2>
      
      <!-- Account Type Selection (First) -->
      <div class="form-section">
        <div class="field-group">
          <label class="field-label">Account Type <span class="required">*</span></label>
          <select class="input" v-model="role" @change="onRoleChange">
            <option value="user">User</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>
      
      <!-- Required Fields Section -->
      <div class="form-section">
        <h3 class="section-title">Required Information</h3>
        
        <!-- Username -->
        <div class="field-group">
          <label class="field-label">Username <span class="required">*</span></label>
          <input 
            class="input" 
            v-model.trim="username" 
            placeholder="Enter your username (letters only, min 3 characters)"
            :class="{ 'error-input': errors.username }"
          />
          <div class="error" v-if="errors.username">{{ errors.username }}</div>
        </div>
        
        <!-- Email -->
        <div class="field-group">
          <label class="field-label">Email <span class="required">*</span></label>
          <input 
            class="input" 
            v-model.trim="email" 
            type="email"
            placeholder="Enter your email address"
            autocomplete="username"
            :class="{ 'error-input': errors.email }"
          />
          <div class="error" v-if="errors.email">{{ errors.email }}</div>
        </div>
        
        <!-- Password -->
        <div class="field-group">
          <label class="field-label">Password <span class="required">*</span></label>
          <input 
            class="input" 
            v-model="password" 
            type="password" 
            placeholder="Create a strong password"
            autocomplete="new-password"
            :class="{ 'error-input': errors.password }"
          />
          <div class="password-requirements">
            <small class="helper">Must contain: lowercase, uppercase, number, special character (min 8 characters)</small>
          </div>
          <div class="error" v-if="errors.password">{{ errors.password }}</div>
        </div>
        
        <!-- Confirm Password -->
        <div class="field-group">
          <label class="field-label">Confirm Password <span class="required">*</span></label>
          <input 
            class="input" 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Re-enter your password"
            autocomplete="new-password"
            :class="{ 'error-input': errors.confirmPassword }"
          />
          <div class="error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
        </div>
        
        <!-- Address -->
        <div class="field-group">
          <label class="field-label">Address <span class="required">*</span></label>
          <input 
            class="input" 
            v-model.trim="address" 
            placeholder="123 Street Name, Suburb, STATE 1234"
            :class="{ 'error-input': errors.address }"
          />
          <div class="address-help">
            <small class="helper">Australian address format: Street number and name, Suburb, State abbreviation, Postcode</small>
          </div>
          <div class="error" v-if="errors.address">{{ errors.address }}</div>
        </div>
      </div>
      
      <!-- Optional Fields Section (only for users, not admins) -->
      <div class="form-section" v-if="role === 'user'">
        <h3 class="section-title">Emergency Contact (Optional)</h3>
        
        <!-- Emergency Contact Name -->
        <div class="field-group">
          <label class="field-label">Emergency Contact Name</label>
          <input 
            class="input" 
            v-model.trim="emergencyContactName" 
            placeholder="Full name of emergency contact"
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
            :class="{ 'error-input': errors.emergencyContactPhone }"
          />
          <div class="error" v-if="errors.emergencyContactPhone">{{ errors.emergencyContactPhone }}</div>
        </div>
      </div>
      
      
      <!-- General Error -->
      <div class="error" v-if="errors.general" style="margin-top: 1rem; text-align: center;">{{ errors.general }}</div>
      
      <!-- Submit Button -->
      <button class="btn" style="margin-top: 2rem; width: 100%;" @click="onSubmit">
        Create Account
      </button>
      
      <!-- Login Link -->
      <div style="text-align: center; margin-top: 1rem;">
        <span class="helper">Already have an account? </span>
        <RouterLink to="/login" class="login-link">Sign in here</RouterLink>
      </div>
    </div>
    
    <!-- Administrator Verification Modal -->
    <div v-if="showAdminVerification" class="modal-overlay" @click="cancelAdminVerification">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Administrator Verification</h3>
        <p class="modal-description">Please enter the 6-digit administrator verification code:</p>
        
        <div class="field-group">
          <input 
            class="input" 
            v-model="adminCode" 
            type="password"
            placeholder="Enter 6-digit code"
            maxlength="6"
            :class="{ 'error-input': errors.adminCode }"
            @keyup.enter="verifyAdminCode"
          />
          <div class="error" v-if="errors.adminCode">{{ errors.adminCode }}</div>
        </div>
        
        <div class="modal-buttons">
          <button class="btn-secondary" @click="cancelAdminVerification">Cancel</button>
          <button class="btn" @click="verifyAdminCode">Verify</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.register-container {
  max-width: 600px;
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

.login-link {
  color: var(--brand-600);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: var(--brand);
  text-decoration: underline;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  margin: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
  text-align: center;
}

.modal-description {
  color: var(--muted);
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
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
  flex: 1;
}

.btn-secondary:hover {
  border-color: var(--text);
  color: var(--text);
}

.btn {
  flex: 1;
}

/* Responsive design */
@media (max-width: 640px) {
  .register-container {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }
  
  .card {
    padding: 1.5rem;
  }
  
  .card h2 {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .modal-title {
    font-size: 1.3rem;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
}
</style>