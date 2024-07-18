import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Page1 from './Page1';

function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">ホーム</Link>
        </li>
        <li>
          <Link to="/Page1">「マーケティング」ってどう考えればいいの？</Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  const location = useLocation();
  const showNavigation = location.pathname === "/";

  return (
    <div className="App">
      {showNavigation && (
        <div>
          <h1>目次ページ</h1>
          <Navigation />
        </div>
      )}
      <Routes>
        <Route path="/" element={<div>ホームページ</div>} />
        <Route path="/Page1" element={<Page1 />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router basename="/marketing-app">
      <App />
    </Router>
  );
}

export default AppWrapper;
