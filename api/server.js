const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = require('./api/auth/index.js'); // パスはプロジェクトの構成に合わせて変更してください

const port = process.env.PORT || 5000;

// CORSの設定
app.use(cors({
  origin: 'https://marketing-app-eight.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));

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

// サーバーを起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
