import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateExam from './pages/CreateExam';
import ViewExam from './pages/ViewExam';
import UploadOMR from './pages/UploadOMR';
import ViewResult from './pages/ViewResult';
import ExamStatistics from './pages/ExamStatistics';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/create-exam"
            element={
              <ProtectedRoute requiredRole="teacher">
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/exam/:examId/statistics"
            element={
              <ProtectedRoute requiredRole="teacher">
                <ExamStatistics />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/upload-omr"
            element={
              <ProtectedRoute requiredRole="student">
                <UploadOMR />
              </ProtectedRoute>
            }
          />

          {/* Common Protected Routes */}
          <Route
            path="/exam/:examId"
            element={
              <ProtectedRoute>
                <ViewExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:examId/:rollNumber"
            element={
              <ProtectedRoute>
                <ViewResult />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;