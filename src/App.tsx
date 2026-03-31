import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import TeacherLayout from './layouts/TeacherLayout'
import TeacherDashboard from './pages/teacher/Dashboard'
import ClassRecordsList from './pages/teacher/ClassRecordsList'
import ClassRecordView from './pages/teacher/ClassRecordView'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Teacher routes */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<ClassRecordsList />} />
        <Route path="records" element={<ClassRecordsList />} />
        <Route path="records/:classAssignmentId" element={<ClassRecordView />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
