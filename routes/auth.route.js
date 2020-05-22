const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const config = require('../config')
const mailer = require('nodemailer')
const User = mongoose.model('User')

router.post('/login', (req, res) => {
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({
			msg: 'Please fill out all fields'
		})
	}
	req.body.username = req.body.username.toLowerCase().trim()
    User.findOne({username: req.body.username}, (err, user) => {
        if (err) { return res.status(400).json(err) }
        if (!user) {
            return res.status(401).json({ msg: 'Invalid username.'})
        }
        if (!user.validPassword(req.body.password)) {
            return res.status(401).json({ msg: 'Invalid password.'})
        }
        res.json({token: user.generateJWT()})
    })
})

router.post('/register', (req, res) => {
    if (!req.body.username || !req.body.password) {
		return res.status(400).json({
			msg: 'Please fill out all fields'
		})
	}
	req.body.username = req.body.username.toLowerCase().trim()
	User.findOne({username: req.body.username}, (err, user) => {
		if (err) { return res.status(400).json(err) }
		if (!user) {
			var u = new User()
			u.username = req.body.username
			u.setPassword(req.body.password)
			u.save((err) => {
				if (err) { return res.status(401).json(err) }
				return res.json({ token: u.generateJWT() })
			})
		} else if (!user.validPassword(req.body.password)) {
            return res.status(401).json({ msg: 'Invalid password.'})
        } else {
			res.json({token: user.generateJWT()})
		}
	})

})

router.post('/request-password-reset', (req, res) => {
	if (!req.body.email || req.body.email === '') {
		return res.status(400).json({ msg: 'Please enter a valid e-mail address'})
	}

	req.body.email = req.body.email.toLowerCase().trim()

	User.findOne({ username: req.body.email }).exec((err, user) => {
		if (err) return res.status(400).json(err)
		if (!user) {
			return res.status(400).json({ msg: 'The e-mail address that you provided does not exist in our system' })
		}
		user.generateResetPasswordId()
		user.save((err) => {
			if (err) return res.status(400).json(err)
            var subject = '[' + config.appName + '] Reset your password';
			var text = 'We heard that you lost your password. Sorry about that!\n';
			    text+= 'But don\'t worry! You can use the following link to reset your password: '
				text+= config.frontendUrl + '/#/reset-password/' + user.resetPasswordSalt
				text+= 'If you don\'t use this link within 24 hours, it will expire. To get a new password reset link, visit ' + config.frontendUrl + '/#/request-password-reset'
			var html = '<p>We heard that you lost your password. Sorry about that!</p>'
				html+= '<p>But don\'t worry! You can use the following link to reset your password: </p>'
				html+= '<p><a href="' + config.frontendUrl + '/#/reset-password/' + user.resetPasswordSalt + '">' + config.frontendUrl + '/#/reset-password/' + user.resetPasswordSalt + '</a></p>'
                html+= '<p>If you don\'t use this link within 24 hours, it will expire. To get a new password reset link, visit <a href="' + config.frontendUrl + '/#/request-password-reset">' + config.frontendUrl + '/#/request-password-reset' + '</a></p>'
			var options = {
				from: config.smtp.from,
				to: user.username,
				subject: subject,
				text: text,
				html: html
			}
			let transporter = mailer.createTransport({
				service: 'Gmail',
				auth: {
					user: config.smtp.username, // generated ethereal user
					pass: config.smtp.password  // generated ethereal password
				}
			})
			transporter.sendMail(options, (err, info) => {
				if (err) {
					return res.status(400).json({
						msg: 'Something went wrong.  The reset password link was not sent.',
						err: err
					})
				} else {
					console.log('Message sent: ' + info.response)
					return res.json({msg: info.response})
				}
			})
		})
	})
})

router.post('/reset-password', (req, res) => {
    // Verify that a reset Id was provided
    if (!req.body.resetId || req.body.resetId === '') {
        return res.status(400).json({
            message: 'No password reset id was provided.'
        })
	}
	User.findOne({ resetPasswordSalt: req.body.resetId}, (err, user) => {
		if (err) { return res.status(400).json(err) }
		if (!user) {
			return res.status(400).json({
				msg: 'This password reset id is no longer valid'
			})
		}
        if (Date.parse(user.resetPasswordExp) < Date.now()) {
            return res.status(400).json({
                msg: 'This password reset id is no longer valid'
            })   
		}
		user.setPassword(req.body.password)
		user.resetPasswordSalt = ''
		user.resetPasswordHash = ''
		user.save((err) => {
			if (err) { return res.status(400).json(err) }
			var subject = '[' + config.appName + '] Your password has been changed.'
			var text = 'Your password has been successfully changed.\n'
				text+= 'If you did not initiate this change, please contact us immediately.'
			var html = '<p>Your password has been successfully changed.</p>'
				html+= '<p>If you did not initiate this change, please contact us immediately.</p>'
				html+= '<p>Visit: <a href="' + config.frontendUrl + '/#/login">' + config.frontendUrl + '/#/login</a> to log in.</p>'
			var options = {
				from: config.smtp.from,
				to: user.username,
				subject: subject,
				text: text,
				html: html
			}
			let transporter = mailer.createTransport({
				service: 'Gmail',
				auth: {
					user: config.smtp.username, // generated ethereal user
					pass: config.smtp.password  // generated ethereal password
				}
			})
			transporter.sendMail(options, (err, info) => {
				if (err) {
					return res.status(400).json({
						msg: 'Something went wrong.  The reset password link was not sent.',
						err: err
					})
				} else {
					console.log('Message sent: ' + info.response)
					return res.json({msg: info.response})
				}
			})
		})
	})
})


module.exports = router