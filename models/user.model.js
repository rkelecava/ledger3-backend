const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true},
	hash: String,
	salt: String,
	lastLogin: Date,
	resetPasswordExp: Date,
    resetPasswordSalt: String,
	resetPasswordHash: String,
	accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
	categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
})

UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(32).toString('hex')

	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex')
}

UserSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex')

	return this.hash === hash
}

// Generate a resetPassword id
UserSchema.methods.generateResetPasswordId = function () {
    this.resetPasswordSalt = crypto.randomBytes(20).toString('hex')
    this.resetPasswordHash = crypto.pbkdf2Sync(process.env.APP_SECRET, this.resetPasswordSalt, 1000, 64, 'sha1').toString('hex')
    var today = new Date(),
        exp = new Date(today);
    exp.setDate(today.getDate() + 1)
    this.resetPasswordExp = exp
}

// Validate resetPassword id
UserSchema.methods.validResetPasswordId = function () {
    var resetPasswordHash = crypto.pbkdf2Sync(process.env.APP_SECRET, this.resetPasswordSalt, 1000, 64, 'sha1').toString('hex')

    return this.resetPasswordHash === resetPasswordHash
}

UserSchema.methods.generateJWT = function () {

	// set expiration to 1 day
	var today = new Date()
	var exp = new Date(today)
	exp.setDate(today.getDate() + 1)

	return jwt.sign({
		_id: this._id,
		username: this.username,
		exp: parseInt(exp.getTime() / 1000),
	}, process.env.APP_SECRET)
};

mongoose.model('User', UserSchema)