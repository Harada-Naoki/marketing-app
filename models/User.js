const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 進捗スキーマの定義
const ProgressSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true }, // `ObjectId`型に変更し、リファレンスを指定
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
  progress: {
    type: [ProgressSchema],
    validate: {
      validator: function (v) {
        const chapterIds = v.map(p => p.chapterId.toString());
        return new Set(chapterIds).size === chapterIds.length; // 重複チェック
      },
      message: props => `Duplicate chapterId found in progress array`
    }
  }, // 進捗
  totalStudyTime: { type: Number, default: 0 } // 総勉強時間（秒）
});

// ユーザーモデルの作成
const User = mongoose.model('User', UserSchema);

module.exports = User;
