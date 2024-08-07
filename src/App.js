import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import Collapsible from 'react-collapsible';
import apiRequest from './utils/apiRequest';
import './App.css';
import Page1 from './components/Page1';
import Page2 from './components/Page2';  // 新しく追加
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProgressTracker from './ProgressTracker';

// 認証チェック
const isAuthenticated = () => !!localStorage.getItem('token');

// ProtectedRouteコンポーネント
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/marketing-app/login" />;
};

// chapterId を解析して prefix と suffix を取得
const parseChapterId = (chapterId) => {
  const parts = chapterId.split('_');
  return {
    prefix: parseInt(parts[0], 10),
    suffix: parseInt(parts[1], 10)
  };
};

// dataフォルダからチャプターデータを動的にインポート
const chapters = [
  {
    title: '第1章',
    sections: Array.from({ length: 7 }, (_, sectionIndex) => {
      const sectionData = require(`./data/chapter1/chapter1_${sectionIndex + 1}.js`);
      return {
        title: sectionData.title,
        chapterId: `1_${sectionIndex + 1}`
      };
    })
  },
  {
    title: '第2章',
    sections: Array.from({ length: 2 }, (_, sectionIndex) => {
      const sectionData = require(`./data/chapter2/chapter2_${sectionIndex + 1}.js`);
      return {
        title: sectionData.title,
        chapterId: `2_${sectionIndex + 1}`
      };
    })
  }
];

// HomePageコンポーネント
const HomePage = ({ onLogout }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [progress, setProgress] = useState([]);

  // 進捗状況を取得
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiRequest('/api/progress/status');
        const sortedProgress = response.data.progress.sort((a, b) => {
          const chapterA = parseChapterId(a.chapterId);
          const chapterB = parseChapterId(b.chapterId);

          if (chapterA.prefix !== chapterB.prefix) {
            return chapterA.prefix - chapterB.prefix;
          }
          return chapterA.suffix - chapterB.suffix;
        });
        setProgress(sortedProgress);
      } catch (error) {
        console.error('Error fetching progress', error);
      }
    };

    fetchProgress();
  }, []);

  // チャプターのトグル
  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // 完了しているかどうかを判定
  const isCompleted = (chapterPrefix, sectionSuffix) => {
    const chapterId = `${chapterPrefix}_${sectionSuffix}`;
    const progressItem = progress.find(item => item.chapterId === chapterId);
    return progressItem && progressItem.completed;
  };

  return (
    <div className="home-container">
      <ProgressTracker />
      <div className="content-section">
        <h1 className="content-title">目次</h1>
        <nav className="content-navigation">
          <ul className="content-list">
            {chapters.map((chapter, chapterIndex) => (
              <li className="content-item" key={chapterIndex}>
                <div
                  className="collapsible-trigger"
                  onClick={() => handleToggle(chapterIndex)}
                >
                  {chapter.title}
                  {activeIndex === chapterIndex ? (
                    <FiChevronDown className="chevron-icon" />
                  ) : (
                    <FiChevronRight className="chevron-icon" />
                  )}
                </div>
                <Collapsible open={activeIndex === chapterIndex}>
                  <ul>
                    {chapter.sections.map((section, sectionIndex) => (
                      <li className="content-item" key={sectionIndex}>
                        <Link
                          to={`/marketing-app/Page${chapterIndex + 1}/${section.chapterId}`}
                          className={`content-link ${
                            isCompleted(chapterIndex + 1, sectionIndex + 1) ? 'completed' : 'incomplete'
                          }`}
                        >
                          {section.title}
                          <span className="completion-status">
                            {isCompleted(chapterIndex + 1, sectionIndex + 1) ? '(完了)' : ''}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Collapsible>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <button onClick={onLogout} className="logout-button">ログアウト</button>
      </div>
    </div>
  );
};

// Appコンポーネント
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
        <Route path="/marketing-app/Page2/:chapterId" element={<ProtectedRoute element={<Page2 />} />} /> {/* 新しいルートを追加 */}
        <Route path="/marketing-app/login" element={<LoginForm />} />
        <Route path="/marketing-app/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/marketing-app" />} />
      </Routes>
    </div>
  );
};

// AppWrapperコンポーネント
const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
