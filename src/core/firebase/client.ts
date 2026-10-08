import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD_hseKbtTHsPsza5bnwGF6BZDUp-N49EQ',
  authDomain: 'portfolio-c1025.firebaseapp.com',
  projectId: 'portfolio-c1025',
  storageBucket: 'portfolio-c1025.firebasestorage.app',
  messagingSenderId: '553904145158',
  appId: '1:553904145158:web:e83560ca6a789221481487'
};

export const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
