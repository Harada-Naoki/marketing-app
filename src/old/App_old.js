import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Page1_1 from './Page1_1';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProgressTracker from './ProgressTracker';

const isAuthenticated = () => !!localStorage.getItem('token');

const App = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/marketing-app/login';
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/marketing-app" element={<ProtectedRoute element={<HomePage onLogout={handleLogout} />} />} />
        <Route path="/marketing-app/Page1_1" element={<ProtectedRoute element={<Page1_1 />} />} />
        <Route path="/marketing-app/login" element={<LoginForm />} />
        <Route path="/marketing-app/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/marketing-app" />} />
      </Routes>
    </div>
  );
};

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/marketing-app/login" />;
};

const HomePage = ({ onLogout }) => {
  return (
    <div className="home-container">
      <ProgressTracker />
      <div className="content-section">
        <h1 className="content-title">目次</h1>
        <nav className="content-navigation">
          <ul className="content-list">
            <li className="content-item">
              <Link to="/marketing-app/Page1_1" className="content-link">「マーケティング」ってどう考えればいいの？</Link>
            </li>
            {/* 必要に応じて他の目次項目を追加 */}
          </ul>
        </nav>      
      </div>
      <div>
        <button onClick={onLogout} className="logout-button">ログアウト</button>
      </div>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;

