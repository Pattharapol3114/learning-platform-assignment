import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import AssignmentDetailPage from "./pages/AssignmentDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="assignments/new" element={<CreateAssignmentPage />} />
        <Route path="assignments/:assignmentId" element={<AssignmentDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
