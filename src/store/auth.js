// Firebase Authentication Store
import { reactive, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase/init';

const state = reactive({
  user: null,
  role: null,
  token: null,
  isLoading: true
});

// Initialize auth state listener
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // User is signed in
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        state.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: userData.username,
          address: userData.address,
          emergencyContactName: userData.emergencyContactName || '',
          emergencyContactPhone: userData.emergencyContactPhone || ''
        };
        state.role = userData.role || 'user';
        state.token = await firebaseUser.getIdToken();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  } else {
    // User is signed out
    state.user = null;
    state.role = null;
    state.token = null;
  }
  state.isLoading = false;
});

export function useAuth(){
  const isAuthed = computed(() => !!state.user);
  const role = computed(() => state.role);
  const isLoading = computed(() => state.isLoading);

  async function register({ username, email, password, address, emergencyContactName, emergencyContactPhone, role}) {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        username,
        email,
        address,
        emergencyContactName: emergencyContactName || '',
        emergencyContactPhone: emergencyContactPhone || '',
        role,
        createdAt: new Date().toISOString()
      });

      // State will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async function login({ email, password }) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // State will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      // State will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  }

  async function updateUserInfo({ username, address, emergencyContactName, emergencyContactPhone, currentPassword, newPassword }) {
    if (!state.user) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'users', state.user.uid);

      // If changing password, reauthenticate first
      if (newPassword && currentPassword) {
        const credential = EmailAuthProvider.credential(state.user.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
      }

      // Update user info in Firestore
      await updateDoc(userRef, {
        username,
        address,
        emergencyContactName: emergencyContactName || '',
        emergencyContactPhone: emergencyContactPhone || '',
        updatedAt: new Date().toISOString()
      });

      // Update local state
      state.user = {
        ...state.user,
        username,
        address,
        emergencyContactName: emergencyContactName || '',
        emergencyContactPhone: emergencyContactPhone || ''
      };

    } catch (error) {
      console.error('Update user info error:', error);
      throw new Error(error.message || 'Failed to update user information');
    }
  }

  return { state, isAuthed, role, isLoading, register, login, logout, updateUserInfo };
}