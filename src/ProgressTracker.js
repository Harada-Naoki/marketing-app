import React, { useState, useEffect } from 'react';
import apiRequest from './utils/apiRequest';
import './App.css';
import Collapsible from 'react-collapsible';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}時間 ${m}分 ${s}秒`;
};

const parseChapterId = (chapterId) => {
  const parts = chapterId.split('_');
  return {
    prefix: parseInt(parts[0], 10),
    suffix: parseInt(parts[1], 10)
  };
};

// 同じ chapterId の進捗を studyTime に基づいてフィルタリング
const filterProgressByStudyTime = (progress) => {
  const filteredProgress = progress.reduce((acc, item) => {
    if (!acc[item.chapterId] || acc[item.chapterId].studyTime < item.studyTime) {
      acc[item.chapterId] = item;
    }
    return acc;
  }, {});

  return Object.values(filteredProgress);
};

const ProgressTracker = () => {
  const [progress, setProgress] = useState([]);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [activeChapter, setActiveChapter] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiRequest('/api/progress/status');
        console.log('API response:', response);

        if (response.data && Array.isArray(response.data.progress)) {
          // 同じ chapterId の進捗をフィルタリング
          const filteredProgress = filterProgressByStudyTime(response.data.progress);

          // 進捗をソート
          const sortedProgress = filteredProgress.sort((a, b) => {
            const chapterA = parseChapterId(a.chapterId);
            const chapterB = parseChapterId(b.chapterId);

            if (chapterA.prefix !== chapterB.prefix) {
              return chapterA.prefix - chapterB.prefix;
            }
            return chapterA.suffix - chapterB.suffix;
          });

          setProgress(sortedProgress);
          setTotalStudyTime(response.data.totalStudyTime);
        } else {
          const message = 'Progress data is not available or not an array.';
          console.error(message);
          setErrorMessage(message);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setErrorMessage(`Error fetching progress: ${error.message}`);
      }
    };

    fetchProgress();
  }, []);

  const handleToggle = (chapterPrefix) => {
    setActiveChapter(activeChapter === chapterPrefix ? null : chapterPrefix);
  };

  const groupedProgress = progress?.reduce((acc, item) => {
    const { prefix } = parseChapterId(item.chapterId);
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className='progress-container'>
      <h2 className='progress-title'>学習の進捗状況</h2>
      
      {errorMessage && (
        <div className='error-message'>
          <p>{errorMessage}</p>
        </div>
      )}

      <ul className='progress-list-container'>
        {Object.keys(groupedProgress).length > 0 ? (
          Object.keys(groupedProgress).map((prefix) => (
            <li key={prefix} className='progress-item-container'>
              <div
                className='progress-chapter'
                onClick={() => handleToggle(prefix)}
              >
                第{prefix}章
                {activeChapter === prefix ? (
                  <FiChevronDown className='chevron-icon' />
                ) : (
                  <FiChevronRight className='chevron-icon' />
                )}
              </div>
              <Collapsible open={activeChapter === prefix}>
                <ul className='progress-list'>
                  {groupedProgress[prefix].map((item, index) => (
                    <li key={index} className='progress-item'>
                      <div className='chapter-info'>
                        <span className='chapter-id'>チャプター {item.chapterId}</span>
                        <span className={`chapter-status ${item.completed ? 'status-completed' : 'status-incomplete'}`}>
                          {item.completed ? '完了' : '未完了'}
                        </span>
                      </div>
                      <span className='study-time'>
                        勉強時間: {formatTime(item.studyTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            </li>
          ))
        ) : (
          <p>No progress data available.</p>
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
