import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebaseApp";

// ส่งออกฐานข้อมูลและ Authentication เพื่อนำไปใช้กับฟังก์ชัน CRUD
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
