import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFbqbyWW6e7nbzYvvd8qMfBF6GS42xQic",
  authDomain: "jaffaz-pos-9f87d.firebaseapp.com",
  projectId: "jaffaz-pos-9f87d",
  storageBucket: "jaffaz-pos-9f87d.firebasestorage.app",
  messagingSenderId: "607053687098",
  appId: "1:607053687098:web:701768feb01850f54c8803"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);