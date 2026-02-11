import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCunaeK8RsDBvb7hW9Lnys8BwdKX_JWPqY",
  authDomain: "mosque-clock10.firebaseapp.com",
  projectId: "mosque-clock10",
  storageBucket: "mosque-clock10.firebasestorage.app",
  messagingSenderId: "333460167130",
  appId: "1:333460167130:web:29e16127ee4d369a0408e3",
  measurementId: "G-G2M3X7423F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;