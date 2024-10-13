// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./userAuthentication/Login";
import Signup from "./userAuthentication/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./components/Dashboard/Dashboard";
import StatisticsPage from "./components/Statistics/StatisticsPage";
import Layout from "./components/Layout/Layout";
import { SearchFilterProvider } from "./context/SearchFilterContext";

function App() {
  return (
    <AuthProvider>
      <SearchFilterProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="statistics" element={<StatisticsPage />} />
              {/* Redirect root to dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
              {/* Catch-All Route */}
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SearchFilterProvider>
    </AuthProvider>
  );
}

export default App;
