const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// リフレッシュトークンを保存するための仮のデータベース
let refreshTokens = [];

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Register request received:', { username, password });

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists:', { username });
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    const accessToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: newUser._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });
    refreshTokens.push(refreshToken);

    console.log('User created:', { username });
    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

// ユーザーログイン
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login request received:', { username, password });

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', { username });
      return res.status(400).send('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', { username });
      return res.status(400).send('Invalid password');
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });

    refreshTokens.push(refreshToken);
    console.log('Tokens issued for user:', { username });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Error logging in user');
  }
});

// トークンのリフレッシュ
router.post('/token', (req, res) => {
  const { token } = req.body;
  console.log('Token refresh request received:', { token });

  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) {
    console.log('Refresh token not found:', { token });
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) {
      console.log('Refresh token verification failed:', { token });
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    console.log('Access token refreshed for user:', { userId: user.id });

    res.json({ accessToken });
  });
});

// リフレッシュトークンの削除
router.post('/logout', (req, res) => {
  const { token } = req.body;
  console.log('Logout request received:', { token });

  refreshTokens = refreshTokens.filter(t => t !== token);
  console.log('Refresh token removed:', { token });

  res.sendStatus(204);
});

module.exports = router;

