import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import UserProfile from './pages/UserProfile';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProblems from './pages/admin/AdminProblems';
import ProblemForm from './pages/admin/ProblemForm';
import AdminContests from './pages/admin/AdminContests';
import ContestForm from './pages/admin/ContestForm';
import AdminTopics from './pages/admin/AdminTopics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            },
          }}
        />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/contests/:id" element={<ContestDetail />} />
            <Route path="/users/:username" element={<UserProfile />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/problems" replace />} />
              <Route path="problems" element={<AdminProblems />} />
              <Route path="problems/new" element={<ProblemForm />} />
              <Route path="problems/:id/edit" element={<ProblemForm />} />
              <Route path="contests" element={<AdminContests />} />
              <Route path="contests/new" element={<ContestForm />} />
              <Route path="contests/:id/edit" element={<ContestForm />} />
              <Route path="topics" element={<AdminTopics />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
