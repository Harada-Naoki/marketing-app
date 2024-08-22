require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
const PORT = process.env.PORT || 5000;

// デバッグ用：環境変数の確認
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// CORS設定
const allowedOrigins = ['https://marketing-app-steel.vercel.app'];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 200
// };

// ミドルウェア
// app.use(cors(corsOptions)); 
app.use(cors({
  origin: '*', // 必要に応じて特定のオリジンに制限
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 許可するHTTPメソッド
  allowedHeaders: ['Content-Type', 'Authorization'], // 許可するヘッダー
  optionsSuccessStatus: 200
}));
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
