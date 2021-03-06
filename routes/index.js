function load(app) {
    app.use('/', require('./misc.route'))
    app.use('/auth', require('./auth.route'))
    app.use('/accounts', require('./accounts.route'))
    app.use('/categories', require('./categories.route'))
    app.use('/entries', require('./entries.route'))
    app.use('/reporting', require('./reporting.route'))
}

module.exports = { load }