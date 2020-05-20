const mongoose = require('mongoose')

var Schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, lowercase: true, unique: true }
})

mongoose.model('Category', Schema)