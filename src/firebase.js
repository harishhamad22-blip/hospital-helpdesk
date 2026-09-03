// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvanNa2MvQqQARAAei2eJHmvCmiz2cqxk",
  authDomain: "hospital-helpdesk-190ef.firebaseapp.com",
  projectId: "hospital-helpdesk-190ef",
  storageBucket: "hospital-helpdesk-190ef.appspot.com",
  messagingSenderId: "597837051549",
  appId: "1:597837051549:web:6b800ad07ef0c4b84b4674",
  measurementId: "G-83MXF06KC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export { serverTimestamp }; // serverTimestamp को भी एक्सपोर्ट करें ताकि इसे app.js में इस्तेमाल किया जा सके
