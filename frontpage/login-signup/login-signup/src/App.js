import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import LandingPage from './Components/LandingPage/LandingPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const response = await fetch('http://127.0.0.1:5001/@me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Session check response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Session data:', data);
        setUserData(data);
        setIsAuthenticated(true);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Session check failed:', response.status, errorData);
        setIsAuthenticated(false);
        setUserData(null);
        setError(errorData.message || 'Session check failed');
      }
    } catch (error) {
      console.error('Session check error:', error);
      setIsAuthenticated(false);
      setUserData(null);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, userData });
  }, [isAuthenticated, userData]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/LandingPage" replace />
              ) : (
                <LoginSignup 
                  setIsAuthenticated={setIsAuthenticated}
                  setUserData={setUserData}
                />
              )
            } 
          />
          <Route 
            path="/LandingPage" 
            element={
              isAuthenticated ? (
                <LandingPage 
                  setIsAuthenticated={setIsAuthenticated}
                  userData={userData}
                  setUserData={setUserData}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
