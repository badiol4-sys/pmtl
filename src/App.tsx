import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import HomePage from './pages/index';
import DashboardAnimator from './pages/dashboard/animator';
import DashboardTeacher from './pages/dashboard/teacher';
import DashboardParent from './pages/dashboard/parent';
import AnimatorUploadPDF from './pages/dashboard/animator-upload-pdf';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard/animator"
          element={
            <ProtectedRoute allowedRoles={['animator', 'director', 'alsh']}>
              <DashboardAnimator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/animator/upload-pdf"
          element={
            <ProtectedRoute allowedRoles={['animator', 'director', 'alsh']}>
              <AnimatorUploadPDF />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardTeacher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <DashboardParent />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
