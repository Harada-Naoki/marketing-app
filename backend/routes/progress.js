const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// 進捗を更新するエンドポイント
router.post('/update', authenticateToken, async (req, res) => {
  const { chapterId, completed, studyTime } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const progressIndex = user.progress.findIndex(p => p.chapterId === chapterId);

    if (progressIndex !== -1) {
      // 既存の進捗がある場合
      user.progress[progressIndex].completed = completed !== undefined ? completed : user.progress[progressIndex].completed;
      user.progress[progressIndex].studyTime += studyTime;
    } else {
      // 新しい進捗を追加する場合
      user.progress.push({ chapterId, completed: completed !== undefined ? completed : false, studyTime });
    }

    user.totalStudyTime += studyTime;
    await user.save();

    res.status(200).send('Progress updated');
  } catch (error) {
    console.error('Error updating progress:', error); // 追加: エラーログの詳細を出力
    res.status(500).send('Error updating progress');
  }
});

// 進捗を取得するエンドポイント
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress totalStudyTime');
    res.json(user);
  } catch (error) {
    console.error('Error fetching progress:', error); // 追加: エラーログの詳細を出力
    res.status(500).send('Error fetching progress');
  }
});

module.exports = router;





