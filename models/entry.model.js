const mongoose = require('mongoose')

var Schema = new mongoose.Schema({
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    description: String,
    category: { type: String, lowercase: true },
    type: { type: String, lowercase: true },
    amount: Number,
    entered: {type: Date, default: Date.now},
    balanceAfterTransaction: Number
})

mongoose.model('Entry', Schema)