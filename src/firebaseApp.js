import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBRe8qlFGvGEgFhIkoxzAKqWB8ksVkChsI",
  authDomain: "learning-platform-assign-658de.firebaseapp.com",
  projectId: "learning-platform-assign-658de",
  storageBucket: "learning-platform-assign-658de.firebasestorage.app",
  messagingSenderId: "537783985143",
  appId: "1:537783985143:web:8ff838f3e5b9ac1f0c04f2",
  measurementId: "G-TBV2DHPL9C"
};

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
