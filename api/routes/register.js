const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let refreshTokens = [];

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).send('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      const accessToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: newUser._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });
      refreshTokens.push(refreshToken);

      res.json({ accessToken, refreshToken });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Error creating user');
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
