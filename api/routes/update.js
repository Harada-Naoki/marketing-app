const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  authenticateToken(req, res, async () => {
    const { chapterId, visibleStep, quizStarted, currentQuestionIndex, score, completed, studyTime } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).send('User not found');
      }

      let progressItems = user.progress.filter(p => p.chapterId === chapterId);

      if (progressItems.length > 1) {
        const minVisibleStep = Math.min(...progressItems.map(p => p.visibleStep));
        user.progress = user.progress.filter(p => !(p.chapterId === chapterId && p.visibleStep === minVisibleStep));
        progressItems = user.progress.filter(p => p.chapterId === chapterId);
      }

      let progress = progressItems[0];
      if (!progress) {
        progress = { chapterId, visibleStep: 0, quizStarted: false, currentQuestionIndex: 0, score: 0, completed: false, studyTime: 0 };
        user.progress.push(progress);
      }

      const previousStudyTime = progress.studyTime;
      progress.visibleStep = visibleStep !== undefined ? visibleStep : progress.visibleStep;
      progress.quizStarted = quizStarted !== undefined ? quizStarted : progress.quizStarted;
      progress.currentQuestionIndex = currentQuestionIndex !== undefined ? currentQuestionIndex : progress.currentQuestionIndex;
      progress.score = score !== undefined ? score : progress.score;

      if (!progress.completed) {
        progress.completed = completed !== undefined ? completed : progress.completed;
      }

      const newStudyTime = Math.max(studyTime - previousStudyTime, 0);
      progress.studyTime = previousStudyTime + newStudyTime;

      user.totalStudyTime += newStudyTime;

      await user.save();

      res.status(200).send('Progress updated');
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).send('Error updating progress');
    }
  });
};
