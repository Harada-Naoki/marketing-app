const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let refreshTokens = [];

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).send('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).send('Invalid password');
      }

      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });

      refreshTokens.push(refreshToken);

      res.json({ accessToken, refreshToken });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error logging in user');
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
