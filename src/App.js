import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Page1 from './components/Page1';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProgressTracker from './ProgressTracker';
import Collapsible from 'react-collapsible';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';  // 矢印アイコンのインポート

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
        <Route path="/marketing-app/Page1/:chapterId" element={<ProtectedRoute element={<Page1 />} />} />
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
  const chapters = Array.from({ length: 20 }, (_, i) => require(`./data/chapter1_${i + 1}.js`));
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="home-container">
      <ProgressTracker />
      <div className="content-section">
        <h1 className="content-title">目次</h1>
        <nav className="content-navigation">
          <ul className="content-list">
            <li className="content-item">
              <div 
                className="collapsible-trigger" 
                onClick={() => handleToggle(0)}
              >
                第1章
                {activeIndex === 0 ? <FiChevronDown className="chevron-icon" /> : <FiChevronRight className="chevron-icon" />}
              </div>
              <Collapsible open={activeIndex === 0}>
                <ul>
                  {chapters.map((chapter, i) => (
                    <li className="content-item" key={i}>
                      <Link to={`/marketing-app/Page1/${i + 1}`} className="content-link">
                        {chapter.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            </li>
            {/* ここに第2章以降を追加します */}
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
