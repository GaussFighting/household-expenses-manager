import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Button from "react-bootstrap/Button";

import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";

import { checkAuth } from "./services/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [error, setError] = useState("");

  const verifySession = async () => {
    setError("");
    try {
      const isValid = await checkAuth();
      setIsAuthenticated(isValid);
    } catch (error) {
      console.error("Auth check failed:", error);
      setError("Cannot check auth, try again");
    }
  };

  useEffect(() => {
    verifySession();
  }, []);
  if (error) {
    return (
      <div className="login-container">
        <p>{error}</p>
        <Button variant="primary" onClick={verifySession}>
          Try Again
        </Button>
      </div>
    );
  }
  if (isAuthenticated === null) {
    return <p>Session checking ...</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/payments" replace />
            ) : (
              <LoginForm onLoginSuccess={verifySession} />
            )
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/payments" : "/"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
