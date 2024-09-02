const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User'); // 適切にインポートされていると仮定します

const router = express.Router();

// MongoDBに接続
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // 接続に失敗した場合、プロセスを終了
  }
};

connectDB();

// テスト用エンドポイント
router.get('/test-db-connection', async (req, res) => {
  try {
    const user = await User.findOne(); // 任意のクエリを実行
    if (user) {
      res.status(200).send('MongoDB connection is successful');
    } else {
      res.status(200).send('Connected to MongoDB, but no users found');
    }
  } catch (error) {
    console.error('Error testing DB connection:', error);
    res.status(500).send('MongoDB connection failed');
  }
});

module.exports = router;
