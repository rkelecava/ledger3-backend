// For dev, check for env var called APP_SECRET
if (!process.env.APP_SECRET) {
    var env = require('./environment_variables');
}

// import dependencies
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const app = express()

// import the config file
const config = require('./config')

// import the models
const models = require('./models')
models.load()

// Mongoose database connection
mongoose.Promise = global.Promise;
mongoose.connect(config.mongo.db, config.mongo.dbOptions, (err) => {
    if (err) { 
        console.log(err)
        process.exit()
    }
})

// make app use dependencies
app.use(morgan('dev'))
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(cors())

// Load the routes
const routes = require('./routes')
routes.load(app)

app.listen(process.env.PORT || 8081, (err) => {
    if (err) { console.log(err) }
    console.log(`App is running on ${process.env.PORT || 8081}`)
})