import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email,
                password
            });
            
            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            navigate('/chat');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p>Sign in to continue to ChatApp</p>
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary">Sign In</button>
                </form>
                <div className="auth-link">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
