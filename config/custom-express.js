const express = require('express')
const consign = require('consign')
const expressValidator = require('express-validator')
const morgan = require('morgan')
const logger = require('../servicos/logger')


module.exports = function() {
    const app = express()

    app.use(morgan("common", {
        stream: {
          write: function(mensagem){
              logger.info(mensagem);
          }
        }
    }))    

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    app.use(expressValidator())

    consign()
    .include('controllers')
    .then('persistencia')
    .then('servicos')
    .into(app)

    return app
}
