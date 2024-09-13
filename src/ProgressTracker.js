import React, { useState, useEffect } from 'react';
import apiRequest from './utils/apiRequest';
import './App.css';
import Collapsible from 'react-collapsible';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { chapters } from './chapters';  // chapters.js からデータをインポート

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}時間 ${m}分 ${s}秒`;
};

// 同じ chapterId の進捗データを取得
const getProgressForChapter = (progress, chapterId) => {
  return progress.find((item) => item.chapterId === chapterId) || {
    visibleStep: 0,
    quizStarted: false,
    currentQuestionIndex: 0,
    score: 0,
    completed: false,
    studyTime: 0
  };
};

const ProgressTracker = () => {
  const [progress, setProgress] = useState([]);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiRequest('/api/progress/status');
        if (response.data && Array.isArray(response.data.progress)) {
          setProgress(response.data.progress);
          setTotalStudyTime(response.data.totalStudyTime);
        } else {
          setErrorMessage('Progress data is not available or not an array.');
        }
      } catch (error) {
        setErrorMessage(`Error fetching progress: ${error.message}`);
      }
    };

    fetchProgress();
  }, []);

  const handleToggle = (chapterIndex) => {
    setActiveChapter(activeChapter === chapterIndex ? null : chapterIndex);
  };

  const handleSubToggle = (chapterIndex, sectionIndex) => {
    setActiveSubIndex((prev) => ({
      ...prev,
      [chapterIndex]: prev[chapterIndex] === sectionIndex ? null : sectionIndex,
    }));
  };

  return (
    <div className='progress-container'>
      <h2 className='progress-title'>学習の進捗状況</h2>

      {errorMessage && (
        <div className='error-message'>
          <p>{errorMessage}</p>
        </div>
      )}

      <ul className='progress-list-container'>
        {chapters?.length > 0 ? (
          chapters.map((chapter, chapterIndex) => (
            <li key={chapterIndex} className='progress-item-container'>
              <div
                className='progress-chapter'
                onClick={() => handleToggle(chapterIndex)}
              >
                {chapter.title}
                {activeChapter === chapterIndex ? (
                  <FiChevronDown className='chevron-icon' />
                ) : (
                  <FiChevronRight className='chevron-icon' />
                )}
              </div>
              <Collapsible open={activeChapter === chapterIndex}>
                <ul className='progress-list'>
                  {chapter.sections?.length > 0 ? chapter.sections.map((section, sectionIndex) => (
                    <li key={sectionIndex} className='progress-item-container'>
                      <div
                        className='progress-section'
                        onClick={() => handleSubToggle(chapterIndex, sectionIndex)}
                      >
                        {section.title}
                        {activeSubIndex[chapterIndex] === sectionIndex ? (
                          <FiChevronDown className='chevron-icon' />
                        ) : (
                          <FiChevronRight className='chevron-icon' />
                        )}
                      </div>
                      <Collapsible open={activeSubIndex[chapterIndex] === sectionIndex}>
                        <ul>
                          {section.subSections?.length > 0 ? section.subSections.map((subSection, subIndex) => {
                            const subSectionProgress = getProgressForChapter(progress, subSection.chapterId);

                            return (
                              <li key={subIndex} className='progress-item'>
                                <div className='chapter-info'>
                                  <span className='chapter-id'>
                                    {subSection.title}
                                  </span>
                                  <span
                                    className={`chapter-status ${
                                      subSectionProgress.completed
                                        ? 'status-completed'
                                        : 'status-incomplete'
                                    }`}
                                  >
                                    {subSectionProgress.completed ? '完了' : '未完了'}
                                  </span>
                                </div>
                                <span className='study-time'>
                                  勉強時間: {formatTime(subSectionProgress.studyTime)}
                                </span>
                              </li>
                            );
                          }) : (
                            <li className='progress-item'>
                              <p>No subSections available.</p>
                            </li>
                          )}
                        </ul>
                      </Collapsible>
                    </li>
                  )) : (
                    <li className='progress-item'>
                      <p>No sections available.</p>
                    </li>
                  )}
                </ul>
              </Collapsible>
            </li>
          ))
        ) : (
          <p>No chapters available.</p>
        )}
      </ul>
      <div className='total-study-time'>
        <span className='total-time-label'>総勉強時間:</span>
        <span className='total-time-value'>{formatTime(totalStudyTime)}</span>
      </div>
    </div>
  );
};

export default ProgressTracker;
