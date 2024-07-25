import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Page1 from './Page1';
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
        <Route path="/marketing-app/Page1" element={<ProtectedRoute element={<Page1 />} />} />
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
    <div>
      <h1>学習の進捗状況</h1>
      <ProgressTracker />
      <h1>目次ページ</h1>
      <button onClick={onLogout}>ログアウト</button>
      <nav className="Navigation">
        <ul>
          <li>
            <Link to="/marketing-app/Page1">「マーケティング」ってどう考えればいいの？</Link>
          </li>
        </ul>
      </nav>
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

