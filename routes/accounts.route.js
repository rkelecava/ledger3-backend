const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('express-jwt')
const config = require('../config')
const User = mongoose.model('User')
const Account = mongoose.model('Account')
const Entry = mongoose.model('Entry')
const Category = mongoose.model('Category')

var auth = jwt({
	secret: process.env.APP_SECRET,
	userProperty: 'payload'
})

router.get('/:user', auth, (req, res) => { // Get user accounts
    var accounts = []
    User.findById(req.params.user).populate('accounts').exec((err, user) => {
        if (err) { return res.status(400).json(err) }
        if (user.accounts && user.accounts.length > 0) {
            accounts = user.accounts
        }
        res.json(accounts)
    })
})

router.get('/getOne/:account', auth, (req, res) => {
    Account.findById(req.params.account, (err, account) => {
        if (err) return res.status(400).json(err)
        if (!account) return res.status(400).json({ msg: 'Account not found'})
        res.json(account)
    })
})

router.put('/update/:account', auth, (req, res) => {
    if (!req.body.name || req.body.name === '') {
        return res.status(400).json({ msg: 'Please provide a valid account name'})
    }
    Account.findById(req.params.account, (err, account) => {
        if (err) return res.status(400).json(err)
        if (!account) return res.status(400).json({ msg: 'Account not found'})
        account.name = req.body.name
        account.balance = req.body.balance
        account.type = req.body.type
        account.save((err, acct) => {
            if (err) return res.status(400).json(err)
            res.json(acct)
        })
    })
})

router.post('/add/:user', auth, (req, res) => { // Add user account
    if (!req.body.name || req.body.name === '') {
        return res.status(400).json({ msg: 'Please provide a valid account name'})
    }
    User.findById(req.params.user, (err, user) => {
        if (err) { return res.status(400).json(err) }
        if (!user) {
            return res.status(400).json({ msg: 'User not found' })
        }
        var account = new Account(req.body)
        account.save((err, acct) => {
            if (err) { return res.status(400).json(err) }
            user.accounts.push(acct._id)
            user.save((err) => {
                if (err) { return res.status(400).json(err) }
                res.json(account)
            })
        })
    })
})

router.delete('/delete/:user/:account', auth, (req, res) => {
    Entry.remove({ account: req.params.account }, (err) => {
        if (err) { return res.status(400).json(err) }

        Account.findByIdAndRemove(req.params.account, { useFindAndModify: false }, (err) => {
            if (err) { return res.status(400).json(err) }
            User.findById(req.params.user, (err, user) => {
                if (err) { return res.status(400).json(err) }
                if (!user) {
                    return res.status(400).json({ msg: 'User not found' })
                }
                for (var i = 0; i < user.accounts.length; i++) {
                    if (user.accounts[i] === req.params.account) {
                        user.accounts.splice(i, 1)
                    }
                }
                user.save((err) => {
                    if (err) { return res.status(400).json(err) }
                    res.json({ msg: 'deleted' })
                })
            })
        }) 

    })
})

module.exports = router