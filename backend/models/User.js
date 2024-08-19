const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 進捗スキーマの定義
const ProgressSchema = new Schema({
  chapterId: { type: String, required: true, unique: true },
  visibleStep: { type: Number, default: 0 },
  quizStarted: { type: Boolean, default: false },
  currentQuestionIndex: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  studyTime: { type: Number, default: 0 } // 勉強時間（秒）
});

// ユーザースキーマの定義
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  progress: [ProgressSchema], // 進捗
  totalStudyTime: { type: Number, default: 0 } // 総勉強時間（秒）
});

// ユーザーモデルの作成
const User = mongoose.model('User', UserSchema);

module.exports = User;