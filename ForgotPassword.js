import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); 

    const handleChangePassword = async (e) => {
        e.preventDefault(); 

        try {
            const response = await axios.post('http://localhost:5000/change-password', { username, newPassword });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response.data.message || 'An error occurred');
        }
    };

    const handleBackToLogin = () => {
        navigate('/');
    };

    return (
        <div className="forgot-password-container">
            <form onSubmit={handleChangePassword} className="forgot-password-form">
                <h2>Change Password</h2>
                <label htmlFor="username">Username</label>
                <div className="input-container">
                <i className="fas fa-user input-icon"></i>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    
                </div>
                <label htmlFor="password">New Password</label>
                <div className="input-container">
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <i className="fas fa-lock"></i>
                </div>
                <button type="submit" className="change-password-button">Change Password</button>
                {message && <p className="message">{message}</p>}
                
                
                <button type="button" className="back-to-login-button" onClick={handleBackToLogin}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
