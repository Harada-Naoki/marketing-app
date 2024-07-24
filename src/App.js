import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import Page1 from './Page1';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const isAuthenticated = () => !!localStorage.getItem('token');

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
        <Route path="/Page1" element={<ProtectedRoute element={<Page1 />} />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </div>
  );
}

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const HomePage = () => {
  return (
    <div>
      <h1>目次ページ</h1>
      <nav className="Navigation">
        <ul>
          <li>
            <Link to="/Page1">「マーケティング」ってどう考えればいいの？</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

function AppWrapper() {
  return (
    <Router basename="/marketing-app">
      <App />
    </Router>
  );
}

export default AppWrapper;
