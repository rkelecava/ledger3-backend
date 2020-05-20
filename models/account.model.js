const mongoose = require('mongoose')

var Schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, lowercase: true, default: 'asset'},
    name: String,
    balance: { type: Number, default: 0 },
    entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }]
})

mongoose.model('Account', Schema)