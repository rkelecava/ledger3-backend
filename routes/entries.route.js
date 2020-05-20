const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('express-jwt')
const config = require('../config')
const Entry = mongoose.model('Entry')
const Account = mongoose.model('Account')

var auth = jwt({
	secret: process.env.APP_SECRET,
	userProperty: 'payload'
})

router.get('/:account/:skip/:limit', auth, (req, res) => { // Get user accounts
    var entries = []
    Account.findById(req.params.account).populate({
        path: 'entries', 
        options: {
            limit: parseInt(req.params.limit),
            sort: { entered: -1 },
            skip: parseInt(req.params.skip)
        }}).exec((err, account) => {
        if (err) { return res.status(400).json(err) }
        if (account.entries && account.entries.length > 0) {
            entries = account.entries
        }
        res.json(entries)
    })
})

router.get('/getOne/:entry', auth, (req, res) => {
    Entry.findById(req.params.entry, (err, entry) => {
        if (err) return res.status(400).json(err)
        if (!entry) return res.status(400).json({ msg: 'Entry not found'})
        res.json(entry)
    })
})

router.put('/update/:entry', auth, (req, res) => {
    if (!req.body.description || req.body.description === '') {
        return res.status(400).json({ msg: 'Please provide a valid account name'})
    }
    if (!req.body.category || req.body.category === '') {
        return res.status(400).json({ msg: 'Please provide a valid category'})
    }
    if (!req.body.type || req.body.type === '') {
        return res.status(400).json({ msg: 'Please provide a valid type'})
    }
    if (!req.body.amount || req.body.amount === 0) {
        return res.status(400).json({ msg: 'Please provide an amount that is greater than $0'})
    }
    Entry.findById(req.params.entry, (err, entry) => {
        if (err) return res.status(400).json(err)
        if (!entry) return res.status(400).json({ msg: 'Entry not found'})
        entry.description = req.body.description
        entry.category = req.body.category
        entry.type = req.body.type
        entry.amount = req.body.amount
        entry.save((err, etry) => {
            if (err) return res.status(400).json(err)
            res.json(etry)
        })
    })
})

router.post('/add/:account', auth, (req, res) => { // Add user account
    if (!req.body.description || req.body.description === '') {
        return res.status(400).json({ msg: 'Please provide a valid account name'})
    }
    if (!req.body.category || req.body.category === '') {
        return res.status(400).json({ msg: 'Please provide a valid category'})
    }
    if (!req.body.type || req.body.type === '') {
        return res.status(400).json({ msg: 'Please provide a valid type'})
    }
    if (!req.body.amount || req.body.amount === 0) {
        return res.status(400).json({ msg: 'Please provide an amount that is greater than $0'})
    }
    Account.findById(req.params.account, (err, account) => {
        if (err) { return res.status(400).json(err) }
        if (!account) {
            return res.status(400).json({ msg: 'Account not found' })
        }
        var entry = new Entry(req.body)
        if (req.body.type === 'deposit') {
            account.balance+=req.body.amount
        }
        if (req.body.type === 'withdrawl' || req.body.type === 'payment') {
            account.balance-=req.body.amount
        }
        entry.balanceAfterTransaction = account.balance
        entry.save((err, etry) => {
            if (err) { return res.status(400).json(err) }
            account.entries.push(etry._id)
            account.save((err) => {
                if (err) { return res.status(400).json(err) }
                res.json(etry)
            })
        })
    })
})

router.delete('/delete/:account/:entry', auth, (req, res) => {
    Entry.findByIdAndRemove(req.params.entry, { useFindAndModify: false }, (err) => {
        if (err) { return res.status(400).json(err) }
        Account.findById(req.params.account, (err, account) => {
            if (err) { return res.status(400).json(err) }
            if (!account) {
                return res.status(400).json({ msg: 'Account not found' })
            }
            for (var i = 0; i < account.entries.length; i++) {
                if (account.entries[i] === req.params.entry) {
                    account.entries.splice(i, 1)
                }
            }
            account.save((err) => {
                if (err) { return res.status(400).json(err) }
                res.json({ msg: 'deleted' })
            })
        })
    }) 
})

module.exports = router