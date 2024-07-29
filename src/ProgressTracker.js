import React, { useState, useEffect } from 'react';
import apiRequest from './utils/apiRequest';
import './App.css';

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}時間 ${m}分 ${s}秒`;
};

const ProgressTracker = () => {
  const [progress, setProgress] = useState([]);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiRequest('/api/progress/status');
        setProgress(response.data.progress);
        setTotalStudyTime(response.data.totalStudyTime);
      } catch (error) {
        console.error('Error fetching progress', error);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className='progress-container'>
      <h2 className='progress-title'>学習の進捗状況</h2>
      <ul className='progress-list'>
        {progress.map((item, index) => (
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
      <div className='total-study-time'>
        <span className='total-time-label'>総勉強時間:</span>
        <span className='total-time-value'>{formatTime(totalStudyTime)}</span>
      </div>
    </div>
  );
};

export default ProgressTracker;

