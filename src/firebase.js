// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "pantrytracker-1a7a3.firebaseapp.com",
  projectId: "pantrytracker-1a7a3",
  storageBucket: "pantrytracker-1a7a3.appspot.com",
  messagingSenderId: "18468417422",
  appId: "1:18468417422:web:2d9d989142a825ff627edf",
  measurementId: "G-SDJ82XPFHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
// const analytics = getAnalytics(app);

export { firestore };