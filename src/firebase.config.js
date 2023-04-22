import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxvrbt455HJ97dsmC2TR1kQ_t_ga0_hnU",
  authDomain: "house-biz.firebaseapp.com",
  projectId: "house-biz",
  storageBucket: "house-biz.appspot.com",
  messagingSenderId: "349970996292",
  appId: "1:349970996292:web:f3a750077850dd74bb3011"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore()