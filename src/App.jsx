import { useState } from "react";
import { createAssignment, getAssignmentsByCohort } from "./assignmentService";

export default function App() {
  const [status, setStatus] = useState("พร้อมทดสอบระบบ CRUD");
  const [items, setItems] = useState([]);

  // ข้อมูลจำลองสำหรับทดสอบ (ตาม Schema ที่ออกแบบไว้)
  const mockCohortId = "cohort_cs101_demo";
  const mockInstructorId = "instructor_test_01";

  // ฟังก์ชันทดสอบสร้างข้อมูล (Create)
  const handleCreate = async () => {
    try {
      setStatus("กำลังสร้างข้อมูลขึ้น Cloud Firestore...");
      const newId = await createAssignment({
        cohortId: mockCohortId,
        instructorId: mockInstructorId,
        title: "Assignment 1: Database Design",
        description: "ออกแบบฐานข้อมูลและทดสอบ CRUD ผ่าน React",
        criteria: "1. โครงสร้างถูกต้อง 2. เรียกใช้งานได้จริง",
        dueDate: new Date("2026-09-30T23:59:00Z"),
        attachmentUrl: null
      });
      setStatus(`สร้างข้อมูลสำเร็จ! Document ID: ${newId}`);
    } catch (error) {
      setStatus(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  // ฟังก์ชันทดสอบดึงข้อมูล (Read)
  const handleFetch = async () => {
    try {
      setStatus("กำลังดึงข้อมูลจาก Cloud Firestore...");
      const data = await getAssignmentsByCohort(mockCohortId, mockInstructorId);
      setItems(data);
      setStatus(`ดึงข้อมูลสำเร็จ! พบ ${data.length} รายการ`);
    } catch (error) {
      setStatus(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "auto" }}>
      <h2>Assignment Management (CRUD Test)</h2>
      <p><b>สถานะ:</b> {status}</p>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={handleCreate} style={{ padding: "10px 16px", cursor: "pointer" }}>
          1. ทดสอบ Create Assignment
        </button>
        <button onClick={handleFetch} style={{ padding: "10px 16px", cursor: "pointer" }}>
          2. ทดสอบ Read Assignments
        </button>
      </div>

      <div>
        <h3>รายการงานที่ดึงมาจากฐานข้อมูล:</h3>
        {items.length === 0 ? (
          <p>ยังไม่มีข้อมูล (ลองกดปุ่ม Read ดูครับ)</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: "10px" }}>
                <b>{item.title}</b> (ID: {item.id})<br />
                รายละเอียด: {item.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}