const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();


// 進捗を更新するエンドポイント
router.post('/update', authenticateToken, async (req, res) => {
  const { 
    chapterId, 
    visibleStep = 0, 
    quizStarted = false, 
    currentQuestionIndex = 0, 
    score = 0, 
    completed = false, 
    studyTime = 0 
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('ユーザーが見つかりません');
    }

    // progress配列が存在しない場合に初期化
    user.progress = user.progress || [];

    // 既存の進捗を検索
    let progress = user.progress.find(p => p.chapterId === chapterId);

    if (!progress) {
      // 進捗エントリが存在しない場合に新規作成
      progress = { 
        chapterId, 
        visibleStep: 0, 
        quizStarted: false, 
        currentQuestionIndex: 0, 
        score: 0, 
        completed: false, 
        studyTime: 0 
      };
      user.progress.push(progress);
    }

    // 進捗フィールドを更新
    progress.visibleStep = Math.max(progress.visibleStep, visibleStep);
    progress.quizStarted = quizStarted || progress.quizStarted;
    progress.currentQuestionIndex = Math.max(progress.currentQuestionIndex, currentQuestionIndex);
    progress.score = Math.max(progress.score, score);
    
    // completedがtrueの場合のみ更新
    if (completed) {
      progress.completed = true;
    }

    // studyTimeを慎重に計算
    const newStudyTime = studyTime > progress.studyTime ? studyTime : progress.studyTime;
    progress.studyTime = newStudyTime;

    // 総学習時間を再計算
    user.totalStudyTime = user.progress.reduce((total, item) => total + item.studyTime, 0);

    await user.save();

    res.status(200).send('進捗が更新されました');
  } catch (error) {
    console.error('進捗更新エラー:', error);
    res.status(500).send('進捗更新中にエラーが発生しました');
  }
});

// 全ての進捗を取得するエンドポイント
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress totalStudyTime');
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json({
      progress: user.progress,
      totalStudyTime: user.totalStudyTime
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).send('Error fetching progress');
  }
});

// 特定のチャプターの進捗を取得するエンドポイント
router.get('/:chapterId', authenticateToken, async (req, res) => {
  const { chapterId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const progress = user.progress.find(p => p.chapterId === chapterId) || {
      chapterId,
      visibleStep: 0,
      quizStarted: false,
      currentQuestionIndex: 0,
      score: 0,
      completed: false,
      studyTime: 0
    };
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).send('Error fetching progress');
  }
});

module.exports = router;
