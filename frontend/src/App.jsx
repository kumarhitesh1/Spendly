import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import IncomePage from "./pages/IncomePage";
import ExpensePage from "./pages/ExpensePage";
import AIReportPage from "./pages/AIReportPage";
import ProfilePage from "./pages/Profilepage";

import { ThemeProvider } from "./context/ThemeContext";

// Protect private routes
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-mauve border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

// App routes
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth route */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
      />

      {/* Dashboard route */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Income route */}
      <Route
        path="/income"
        element={
          <PrivateRoute>
            <Layout>
              <IncomePage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Expense route */}
      <Route
        path="/expense"
        element={
          <PrivateRoute>
            <Layout>
              <ExpensePage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* AI report route */}
      <Route
        path="/ai-report"
        element={
          <PrivateRoute>
            <Layout>
              <AIReportPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Profile route */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
