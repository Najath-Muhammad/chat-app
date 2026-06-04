import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../socket/socket';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });
            
            const { token, user } = response.data;
            
            // Step 29 - Login Page
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Step 30 - Connect User to Socket
            socket.emit('add-user', user._id);
            
            navigate('/chat');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
