import React, { useState, useEffect } from 'react';
import apiRequest from './apiRequest';

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
        const response = await apiRequest('http://localhost:5000/api/progress/status');
        setProgress(response.data.progress);
        setTotalStudyTime(response.data.totalStudyTime);
      } catch (error) {
        console.error('Error fetching progress', error);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div>
      <h2>学習の進捗状況</h2>
      <ul>
        {progress.map((item, index) => (
          <li key={index}>
            チャプター {item.chapterId}: {item.completed ? '完了' : '未完了'} - 勉強時間: {formatTime(item.studyTime)}
          </li>
        ))}
      </ul>
      <p>総勉強時間: {formatTime(totalStudyTime)}</p>
    </div>
  );
};

export default ProgressTracker;

