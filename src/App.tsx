import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Login          from "./pages/Login";
import Register       from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword  from "./pages/ResetPassword";
import Dashboard      from "./pages/Dashboard";
import Trade          from "./pages/Trade";
import Signals        from "./pages/Signals";
import Journal        from "./pages/Journal";
import Statistics     from "./pages/Statistics";
import Profile        from "./pages/Profile";
import Owner          from "./pages/Owner";
import NotFound       from "./pages/NotFound";

import ProtectedRoutes from "./components/ProtectedRoutes";
import OwnerRoute      from "./components/OwnerRoute";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"               element={<Navigate to="/login" replace />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard"  element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
        <Route path="/trade"      element={<ProtectedRoutes><Trade /></ProtectedRoutes>} />
        <Route path="/signals"    element={<ProtectedRoutes><Signals /></ProtectedRoutes>} />
        <Route path="/journal"    element={<ProtectedRoutes><Journal /></ProtectedRoutes>} />
        <Route path="/statistics" element={<ProtectedRoutes><Statistics /></ProtectedRoutes>} />
        <Route path="/profile"    element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
        <Route path="/owner" element={<ProtectedRoutes><OwnerRoute><Owner /></OwnerRoute></ProtectedRoutes>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
