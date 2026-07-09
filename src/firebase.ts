import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXTMWGqP1GCAUXN0atufoY7BkOv2uQt1g",
  authDomain: "inspections-surveys.firebaseapp.com",
  projectId: "inspections-surveys",
  storageBucket: "inspections-surveys.firebasestorage.app",
  messagingSenderId: "317588209114",
  appId: "1:317588209114:web:07bb62a6f2504bbf5ad4e3",
  measurementId: "G-9JVHM9NPKG"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
