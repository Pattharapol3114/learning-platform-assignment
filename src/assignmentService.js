import { db } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";

// 1. CREATE: สร้างงานใหม่
export const createAssignment = async (assignmentData) => {
  try {
    const docRef = await addDoc(collection(db, "assignments"), {
      cohortId: assignmentData.cohortId,
      instructorId: assignmentData.instructorId,
      title: assignmentData.title,
      description: assignmentData.description,
      criteria: assignmentData.criteria,
      dueDate: assignmentData.dueDate,
      attachmentUrl: assignmentData.attachmentUrl || null,
      createdAt: serverTimestamp()
    });
    console.log("Created assignment with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating assignment: ", error);
    throw error;
  }
};

// 2. READ: ดึงรายการงานตาม cohortId และ instructorId
export const getAssignmentsByCohort = async (cohortId, instructorId) => {
  try {
    const q = query(
      collection(db, "assignments"),
      where("cohortId", "==", cohortId),
      where("instructorId", "==", instructorId)
    );
    const querySnapshot = await getDocs(q);
    const assignments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return assignments;
  } catch (error) {
    console.error("Error getting assignments: ", error);
    throw error;
  }
};

// 3. UPDATE: อัปเดตรายละเอียดงาน
export const updateAssignment = async (assignmentId, updatedFields) => {
  try {
    const assignmentRef = doc(db, "assignments", assignmentId);
    await updateDoc(assignmentRef, updatedFields);
    console.log("Updated assignment: ", assignmentId);
  } catch (error) {
    console.error("Error updating assignment: ", error);
    throw error;
  }
};

// 4. DELETE: ลบงาน
export const deleteAssignment = async (assignmentId) => {
  try {
    const assignmentRef = doc(db, "assignments", assignmentId);
    await deleteDoc(assignmentRef);
    console.log("Deleted assignment: ", assignmentId);
  } catch (error) {
    console.error("Error deleting assignment: ", error);
    throw error;
  }
};