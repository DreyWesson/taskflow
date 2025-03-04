import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import AccessibilityFeatures from './components/AccessibilityFeatures';

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={
                <TaskProvider>
                  <AccessibilityFeatures>
                    <Dashboard />
                  </AccessibilityFeatures>
                </TaskProvider>
              } 
            />
            
            <Route 
              path="/profile" 
              element={<Profile />} 
            />
          </Route>
          
          {/* Redirect root to dashboard or login based on auth status */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;