// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDMXbxzOC4DWi8iOnBPMH_0sP0rFgVcW4",
  authDomain: "fit5032-weekly.firebaseapp.com",
  projectId: "fit5032-weekly",
  storageBucket: "fit5032-weekly.firebasestorage.app",
  messagingSenderId: "985809779887",
  appId: "1:985809779887:web:1550d1cc93eedfcb17a85a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default db;