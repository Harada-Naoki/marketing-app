const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const authenticateToken = require('./middleware/authenticateToken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// デバッグ用：環境変数の確認
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// ミドルウェア
app.use(cors()); // ここでCORSミドルウェアを追加
app.use(bodyParser.json());

// データベース接続
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// 認証ルート
app.use('/api/auth', authRoutes);

// 学習進捗ルート
app.use('/api/progress', progressRoutes);

// 保護されたエンドポイント
app.get('/protected', authenticateToken, (req, res) => {
  res.send('This is a protected route');
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



