const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  authenticateToken(req, res, async () => {
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
};
