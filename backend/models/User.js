const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ユーザースキーマの定義
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// ユーザーモデルの作成
const User = mongoose.model('User', UserSchema);

module.exports = User;
