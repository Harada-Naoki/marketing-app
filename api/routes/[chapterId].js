const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  authenticateToken(req, res, async () => {
    const { chapterId } = req.query; // Vercelでは req.params の代わりに req.query を使用することが多いです
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
};
