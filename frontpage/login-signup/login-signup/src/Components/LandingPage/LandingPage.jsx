import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = ({ setIsAuthenticated, userData, setUserData }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('LandingPage: Checking authentication...');
        if (userData) {
          console.log('LandingPage: Using existing user data:', userData);
          return;
        }

        console.log('LandingPage: Fetching user data from server...');
        const response = await fetch('http://127.0.0.1:5001/@me', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('LandingPage: Received user data:', data);
          setUserData(data);
        } else {
          console.log('LandingPage: Unauthorized, redirecting to login');
          setIsAuthenticated(false);
          setUserData(null);
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('LandingPage: Error checking auth:', error);
        setIsAuthenticated(false);
        setUserData(null);
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, setIsAuthenticated, setUserData, userData]);

  const handleLogout = async () => {
    try {
      console.log('LandingPage: Logging out...');
      const response = await fetch('http://127.0.0.1:5001/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log('LandingPage: Logout successful');
        setIsAuthenticated(false);
        setUserData(null);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('LandingPage: Error during logout:', error);
    }
  };

  if (!userData) {
    console.log('LandingPage: No user data, showing loading...');
    return <div className="loading">Loading...</div>;
  }

  console.log('LandingPage: Rendering with user data:', userData);
  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="user-info">
          <span className="welcome">Welcome, {userData.name}</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <div className="user-details">
        <div className="user-card">
          <h2>User Data from MongoDB</h2>
          <div className="profile-info">
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>ID:</strong> {userData.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
