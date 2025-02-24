// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATnKH1BRaVGk6WehhZiN2c6jTQDf8uyYA",
  authDomain: "hacksync-bbb3b.firebaseapp.com",
  projectId: "hacksync-bbb3b",
  storageBucket: "hacksync-bbb3b.firebasestorage.app",
  messagingSenderId: "162478107280",
  appId: "1:162478107280:web:e7fa0263b77584b14cc615"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export default app;