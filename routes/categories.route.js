const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('express-jwt')
const config = require('../config')
const User = mongoose.model('User')
const Category = mongoose.model('Category')

var auth = jwt({
	secret: process.env.APP_SECRET,
	userProperty: 'payload'
})

router.get('/:user', auth, (req, res) => { // Get user categories
    var categories = []
    User.findById(req.params.user).populate({
        path: 'categories',
        options: {
            sort: { name: 1 }
        }
    }).exec((err, user) => {
        if (err) { return res.status(400).json(err) }
        if (user.categories && user.categories.length > 0) {
            categories = user.categories
        }
        res.json(categories)
    })
})

router.get('/getOne/:category', auth, (req, res) => { // Get a category
    Category.findById(req.params.category, (err, category) => {
        if (err) return res.status(400).json(err)
        if (!category) return res.status(400).json({ msg: 'Category not found'})
        res.json(category)
    })
})

router.put('/update/:category', auth, (req, res) => { // Update a category
    if (!req.body.name || req.body.name === '') {
        return res.status(400).json({ msg: 'Please provide a valid category name'})
    }
    Category.findById(req.params.category, (err, category) => {
        if (err) return res.status(400).json(err)
        if (!category) return res.status(400).json({ msg: 'Category not found'})
        category.name = req.body.name
        category.save((err, cat) => {
            if (err) return res.status(400).json(err)
            res.json(cat)
        })
    })
})

router.post('/add/:user', auth, (req, res) => { // Add a category
    if (!req.body.name || req.body.name === '') {
        return res.status(400).json({ msg: 'Please provide a valid category name'})
    }
    User.findById(req.params.user, (err, user) => {
        if (err) { return res.status(400).json(err) }
        if (!user) {
            return res.status(400).json({ msg: 'User not found' })
        }
        var category = new Category(req.body)
        category.save((err, cat) => {
            if (err) { return res.status(400).json(err) }
            user.categories.push(cat._id)
            user.save((err) => {
                if (err) { return res.status(400).json(err) }
                res.json(category)
            })
        })
    })
})

router.delete('/delete/:user/:category', auth, (req, res) => {
    Category.findByIdAndRemove(req.params.category, { useFindAndModify: false }, (err) => {
        if (err) { return res.status(400).json(err) }
        User.findById(req.params.user, (err, user) => {
            if (err) { return res.status(400).json(err) }
            if (!user) {
                return res.status(400).json({ msg: 'User not found' })
            }
            for (var i = 0; i < user.categories.length; i++) {
                if (user.categories[i] === req.params.category) {
                    user.categories.splice(i, 1)
                }
            }
            user.save((err) => {
                if (err) { return res.status(400).json(err) }
                res.json({ msg: 'deleted' })
            })
        })
    }) 
})

module.exports = router