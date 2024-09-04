import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from './utils/apiRequest';
import './App.css';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        data: { username, password }
      });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      navigate('/marketing-app');
    } catch (error) {
      alert(`Registration error: ${error.message}`); // デバッグ用アラート
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRegister}>
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
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/marketing-app/login">Login here</Link></p>
    </div>
  );
};

export default RegisterForm;










