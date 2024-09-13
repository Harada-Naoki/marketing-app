import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import Collapsible from 'react-collapsible';
import apiRequest from './utils/apiRequest';
import KeepAlive from './utils/KeepAlive';
import './App.css';
import Page1 from './components/Page1';
import Page2 from './components/Page2';  
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProgressTracker from './ProgressTracker';
import { chapters } from './chapters'; 

// 認証チェック
const isAuthenticated = () => !!localStorage.getItem('token');

// ProtectedRouteコンポーネント
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};

// chapterId を解析して prefix と suffix を取得
const parseChapterId = (chapterId) => {
  const parts = chapterId.split('_');
  return {
    prefix: parseInt(parts[0], 10),
    suffix: parseInt(parts[1], 10)
  };
};

// HomePageコンポーネント
const HomePage = ({ onLogout }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState({});
  const [progress, setProgress] = useState([]);

  // プログレスの取得と並び替え
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

  // チャプターの展開/折りたたみのトグル
  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // セクションの展開/折りたたみのトグル
  const handleSubToggle = (chapterIndex, sectionIndex) => {
    setActiveSubIndex((prev) => ({
      ...prev,
      [chapterIndex]: prev[chapterIndex] === sectionIndex ? null : sectionIndex,
    }));
  };

  // プログレスの取得
  const getProgress = (chapterPrefix, sectionSuffix) => {
    const chapterId = `${chapterPrefix}_${sectionSuffix}`;
    return (
      progress.find((item) => item.chapterId === chapterId) || {
        visibleStep: 0,
        quizStarted: false,
        currentQuestionIndex: 0,
        score: 0,
        completed: false,
        studyTime: 0,
      }
    );
  };

  return (
    <div className="home-container">
      {/* Progress Tracker Component */}
      <ProgressTracker />

      {/* Main Content Section */}
      <div className="content-section">
        <h1 className="content-title">目次</h1>

        {/* Navigation for Chapters */}
        <nav className="content-navigation">
          <ul className="content-list">
            {chapters.length > 0 && chapters.map((chapter, chapterIndex) => (
              <li className="content-item" key={chapterIndex}>
                {/* Chapter Title (Collapsible Trigger) */}
                <div
                  className="collapsible-trigger"
                  onClick={() => handleToggle(chapterIndex)}
                >
                  <span className="icon-chapter"></span>
                  {chapter.title}
                  {activeIndex === chapterIndex ? (
                    <FiChevronDown className="chevron-icon" />
                  ) : (
                    <FiChevronRight className="chevron-icon" />
                  )}
                </div>

                {/* Collapsible Sections under Chapter */}
                {chapter.sections && chapter.sections.length > 0 && (
                  <Collapsible open={activeIndex === chapterIndex}>
                    <ul>
                      {chapter.sections.map((section, sectionIndex) => (
                        <li className="content-item-sub" key={sectionIndex}>
                          {/* Section Title (Collapsible Trigger for Subsections) */}
                          <div
                            className="collapsible-trigger-sub"
                            onClick={() => handleSubToggle(chapterIndex, sectionIndex)}
                          >
                            <span className="icon-section"></span>
                            {section.title}
                            {activeSubIndex[chapterIndex] === sectionIndex ? (
                              <FiChevronDown className="chevron-icon" />
                            ) : (
                              <FiChevronRight className="chevron-icon" />
                            )}
                          </div>

                          {/* Collapsible Subsections under Section */}
                          {section.subSections && section.subSections.length > 0 && (
                            <Collapsible open={activeSubIndex[chapterIndex] === sectionIndex}>
                              <ul>
                                {section.subSections.map((subSection, subIndex) => {
                                  // `chapterId` を `1_1` から `1_20` までの範囲で生成
                                  const subSectionProgress = getProgress(
                                    chapterIndex + 1,
                                    subSection.chapterId.split('_')[1]
                                  );

                                  return (
                                    <li className="content-item-sub2" key={subIndex}>
                                      <Link
                                        to={`/marketing-app/Page${chapterIndex + 1}/${subSection.chapterId}`}
                                        className={`content-link ${
                                          subSectionProgress.completed ? 'completed' : 'incomplete'
                                        }`}
                                      >
                                        <span className="icon-page"></span>
                                        {subSection.title}
                                        <span className="completion-status">
                                          {subSectionProgress.completed ? '(済)' : ''}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </Collapsible>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Collapsible>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Logout Button */}
      <div>
        <button onClick={onLogout} className="logout-button">
          ログアウト
        </button>
      </div>
    </div>
  );
};

// Appコンポーネント
const App = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');  
  };


  return (
    <div className="App">
      <KeepAlive />
      <Routes>
        <Route path="/marketing-app" element={<ProtectedRoute element={<HomePage onLogout={handleLogout} />} />} />
        <Route path="/marketing-app/Page1/:chapterId" element={<ProtectedRoute element={<Page1 />} />} />
        <Route path="/marketing-app/Page2/:chapterId" element={<ProtectedRoute element={<Page2 />} />} /> 
        <Route path="/" element={<LoginForm />} />
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
