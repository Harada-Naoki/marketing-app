const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();


// 進捗を更新するエンドポイント
router.post('/update', authenticateToken, async (req, res) => {
  const { chapterId, visibleStep, quizStarted, currentQuestionIndex, score, completed, studyTime } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // 同じ chapterId を持つ進捗をすべて取得
    let progressItems = user.progress.filter(p => p.chapterId === chapterId);

    if (progressItems.length > 1) {
      // visibleStep が少ない進捗を削除
      const minVisibleStep = Math.min(...progressItems.map(p => p.visibleStep));
      user.progress = user.progress.filter(p => !(p.chapterId === chapterId && p.visibleStep === minVisibleStep));
      progressItems = user.progress.filter(p => p.chapterId === chapterId); // 削除後に再取得
    }

    // 既存の進捗を取得または新しい進捗を追加
    let progress = progressItems[0];
    if (!progress) {
      // 新しい進捗を追加する場合
      progress = { chapterId, visibleStep: 0, quizStarted: false, currentQuestionIndex: 0, score: 0, completed: false, studyTime: 0 };
      user.progress.push(progress);
    }

    // 前の studyTime の保存
    const previousStudyTime = progress.studyTime;

    // 進捗を更新
    progress.visibleStep = visibleStep !== undefined ? visibleStep : progress.visibleStep;
    progress.quizStarted = quizStarted !== undefined ? quizStarted : progress.quizStarted;
    progress.currentQuestionIndex = currentQuestionIndex !== undefined ? currentQuestionIndex : progress.currentQuestionIndex;
    progress.score = score !== undefined ? score : progress.score;

    // `completed` がすでに `true` である場合は、`false` に戻さない
    if (!progress.completed) {
      progress.completed = completed !== undefined ? completed : progress.completed;
    }

    // studyTime の修正
    const newStudyTime = Math.max(studyTime - previousStudyTime, 0);
    progress.studyTime = previousStudyTime + newStudyTime;

    // 全体の totalStudyTime を更新
    user.totalStudyTime += newStudyTime;

    await user.save();

    res.status(200).send('Progress updated');
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).send('Error updating progress');
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
