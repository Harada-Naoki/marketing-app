const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');

const app = express();
app.use(express.json());

// CORSの設定
app.use(cors({
  origin: 'https://marketing-app-eight.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));

// MongoDBに接続
connectDB();


// ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// キープアライブ用エンドポイントの追加
app.get('/keepalive', (req, res) => {
  res.status(200).send('Server is alive');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
