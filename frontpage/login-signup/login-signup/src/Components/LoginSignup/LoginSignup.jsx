import React, { useState } from "react";
import './LoginSignup.css';
import { useNavigate } from 'react-router-dom';

import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const LoginSignup = ({ setIsAuthenticated, setUserData }) => {
    const [action, setAction] = useState('Login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (action === 'Sign Up' && !name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
        setErrors({ ...errors, name: '' });
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        setErrors({ ...errors, email: '' });
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
        setErrors({ ...errors, password: '' });
    };

    const handleSignUp = async () => {
        if (!validateForm()) {
            return;
        }

        const data = { name, email, password };

        try {
            const response = await fetch('http://127.0.0.1:5001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (response.ok) {
                alert('User registered successfully');

                setName('');
                setEmail('');
                setPassword('');
                setErrors({});

                setAction('Login');
            } else if (response.status === 409) {
                setErrors({ email: 'User already exists. Please log in.' });
                setAction('Login');
            } else {
                setErrors({ submit: responseData.message || 'Sign up failed. Try again.' });
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setErrors({ submit: 'Network error. Please try again later.' });
        }
    };

    const handleLogin = async (e) => {

        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!validateForm()) {
            return;
        }

        const data = { email, password };

        try {
            console.log('LoginSignup: Attempting login with:', email);

            const response = await fetch('http://127.0.0.1:5001/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            console.log('LoginSignup: Response status:', response.status);
            
            const responseData = await response.json();
            console.log('LoginSignup: Server response:', responseData);

            if (response.ok) {
                console.log('LoginSignup: Login successful');

                setIsAuthenticated(true);

                setUserData(responseData);

                setEmail('');
                setPassword('');
                setErrors({});

                console.log('LoginSignup: Navigating to landing page');
                navigate('/LandingPage', { replace: true });
            } else {
                console.error('LoginSignup: Login failed:', responseData.message);
                setErrors({ 
                    submit: `Login failed: ${responseData.message}. Please check your credentials and try again.`
                });
            }
        } catch (error) {
            console.error('LoginSignup: Network error:', error);
            setErrors({ 
                submit: `Network error: ${error.message}. Please check if the server is running at http://127.0.0.1:5001` 
            });
        }
    };

    const handleForgotPassword = (event) => {
        event.preventDefault();
        alert('Password reset functionality will be implemented soon.');
    };

    const switchMode = (newAction) => {
        setAction(newAction);
        setErrors({});
        setEmail('');
        setPassword('');
        if (newAction === 'Sign Up') {
            setName('');
        }
    };

    return (
        <div className="container">
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>
            {errors.submit && <div className="error-message">{errors.submit}</div>}
            <div className="inputs">
                {action === "Login" ? null : (
                    <div className="input">
                        <img src={user_icon} alt="User Icon" />
                        <input 
                            type="text" 
                            value={name} 
                            onChange={handleNameChange} 
                            placeholder="Name" 
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                    </div>
                )}
                <div className="input">
                    <img src={email_icon} alt="Email Icon" />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={handleEmailChange} 
                        placeholder="Email ID" 
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="input">
                    <img src={password_icon} alt="Password Icon" />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={handlePasswordChange} 
                        placeholder="Password" 
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
            </div>
            {action === "Sign Up" ? null : (
                <div className="forgot-password">
                    Lost Password? <span><a href="#" onClick={handleForgotPassword}>Click Here!</a></span>
                </div>
            )}
            <div className="submit-container">
                <button 
                    type="button"
                    className={action === "Login" ? "submit gray" : "submit"} 
                    onClick={() => {
                        if (action === "Sign Up") {
                            handleSignUp();
                        } else {
                            switchMode("Sign Up");
                        }
                    }}
                >
                    Sign Up
                </button>
                <button 
                    type="button"
                    className={action === "Sign Up" ? "submit gray" : "submit"} 
                    onClick={action === "Login" ? handleLogin : () => switchMode("Login")}
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default LoginSignup;
