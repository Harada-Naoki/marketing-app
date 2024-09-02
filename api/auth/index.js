const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User'); // modelsディレクトリがapi内にあるため相対パスを調整
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// MongoDBに接続
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // DB接続に失敗した場合はプロセスを終了
  }
};

connectDB();

// リフレッシュトークンを保存するための仮のデータベース
let refreshTokens = [];

// ユーザー登録
app.post('/register', async (req, res) => {
  console.log('Received /register request:', req.body);
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    console.log('MongoDB query result for existingUser:', existingUser);

    if (existingUser) {
      console.log('User already exists:', username);
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    const accessToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: newUser._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });
    refreshTokens.push(refreshToken);

    console.log('User registered successfully:', username);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error creating user:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).send('Error creating user');
  }
});

// ユーザーログイン
app.post('/login', async (req, res) => {
  console.log('Received /login request:', req.body);
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log('MongoDB query result for user:', user);

    if (!user) {
      console.log('User not found:', username);
      return res.status(400).send('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return res.status(400).send('Invalid password');
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });

    refreshTokens.push(refreshToken);

    console.log('User logged in successfully:', username);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error logging in user:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).send('Error logging in user');
  }
});

// トークンのリフレッシュ
app.post('/token', (req, res) => {
  console.log('Received /token request with token:', req.body.token);
  const { token } = req.body;
  if (!token) {
    console.log('Token not provided');
    return res.sendStatus(401);
  }
  if (!refreshTokens.includes(token)) {
    console.log('Invalid refresh token:', token);
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) {
      console.log('Invalid refresh token during verification:', token);
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    console.log('Access token refreshed successfully');
    res.json({ accessToken });
  });
});

// リフレッシュトークンの削除
app.post('/logout', (req, res) => {
  console.log('Received /logout request with token:', req.body.token);
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);
  console.log('Token removed successfully');
  res.sendStatus(204);
});

module.exports = app;
