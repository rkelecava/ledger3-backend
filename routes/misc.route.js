const express = require('express')
const router = express.Router()
const config = require('../config')

router.get('/getName', (req, res) => {
    var payload = {
        name: ''
    }
    payload.name = config.appName
    res.json(payload)
})

module.exports = router