import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRe8qlFGvGEgFhIkoxzAKqWB8ksVkChsI",
  authDomain: "learning-platform-assign-658de.firebaseapp.com",
  projectId: "learning-platform-assign-658de",
  storageBucket: "learning-platform-assign-658de.firebasestorage.app",
  messagingSenderId: "537783985143",
  appId: "1:537783985143:web:8ff838f3e5b9ac1f0c04f2",
  measurementId: "G-TBV2DHPL9C"
};

// เริ่มต้นเชื่อมต่อ Firebase
const app = initializeApp(firebaseConfig);

// ส่งออกฐานข้อมูลและ Authentication เพื่อนำไปใช้กับฟังก์ชัน CRUD
export const db = getFirestore(app);
export const auth = getAuth(app);