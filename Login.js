import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', { username, password });
            setMessage(response.data.message);
            console.log(response);
    
            navigate('/clients');
           
        } catch (error) {
            setMessage(error.response.data.message || 'An error occurred');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>
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
                <label htmlFor="password">Password</label>
                <div className="input-container">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <i className="fas fa-lock"></i>
                </div>
               
                <div className="forgot-password">
                    <a href="/forgot-password">Forgot Password?</a>
                </div>
                <button type="submit" className="login-button">Login</button>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
};

export default Login;
