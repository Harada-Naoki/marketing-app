import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from './utils/apiRequest'; 
import './App.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        data: { username, password },
        noAuth: true
      });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      navigate('/marketing-app');
    } catch (error) {
      alert('Login error: ' + error.message);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/marketing-app/register">Register here</Link></p>
    </div>
  );
};

export default LoginForm;