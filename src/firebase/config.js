// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHBaz4UzPKwcoUgJhXOZaGibTF0d51h74",
  authDomain: "budgetios.firebaseapp.com",
  projectId: "budgetios",
  storageBucket: "budgetios.firebasestorage.app",
  messagingSenderId: "831329969067",
  appId: "1:831329969067:web:5969c1c32cb91c7dcddddd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);

export default app;
