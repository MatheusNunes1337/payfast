const express = require('express')
const consign = require('consign')
const expressValidator = require('express-validator')


module.exports = function() {
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    app.use(expressValidator())

    consign().include('controllers').into(app)

    return app
}
