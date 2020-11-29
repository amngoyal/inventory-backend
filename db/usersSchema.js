const mongoose = require('mongoose');

const users = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    name: String,
    password: String,
});

module.exports = message = mongoose.model('users', users);