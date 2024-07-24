const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // 追加
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authenticateToken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// デバッグ用：環境変数の確認
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// ミドルウェア
app.use(cors()); // CORSミドルウェアを追加
app.use(bodyParser.json());

// データベース接続
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// 認証ルート
app.use('/api/auth', authRoutes);

// 保護されたエンドポイント
app.get('/protected', authenticateToken, (req, res) => {
  res.send('This is a protected route');
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

