const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('express-jwt')
const async = require('async')
const config = require('../config')
const User = mongoose.model('User')
const Account = mongoose.model('Account')
const Entry = mongoose.model('Entry')
const Category = mongoose.model('Category')

var auth = jwt({
	secret: process.env.APP_SECRET,
	userProperty: 'payload'
})

router.get('/allCategories/:user', (req, res) => {
    var finalCategories = []
    User.findById(req.params.user).populate({
        path: 'categories',
        options: {
            sort: { name: 1 }
        }
    }).exec((err, user) => {
        if (err) { return res.status(400).json(err) }
        if (user.categories && user.categories.length > 0) {
            async.eachSeries(user.categories, (cat, nextCat) => {
                var newCat = {
                    name: cat.name,
                    entries: []
                }
                Entry.find({ "category": cat.name }).sort({ entered: -1}).limit(24).exec((err, entries) => {
                    if (err) { return res.status(400).json(err) }
                    if (entries && entries.length > 0) {
                        newCat.entries = entries
                    }
                    finalCategories.push(newCat)
                    nextCat() 
                })
            }, (err) => {
                if (err) { return res.status(400).json(err) }
                return res.json(finalCategories)
            })
        } else {
            res.json(finalCategories)
        }
        
    })
})

module.exports = router