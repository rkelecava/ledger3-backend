function load() {
    require('./user.model')
    require('./account.model')
    require('./category.model')
    require('./entry.model')
}

module.exports = { load }