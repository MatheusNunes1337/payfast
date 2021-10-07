const winston = require('winston')

const logger = new winston.Logger({
    transports: [
      new winston.transports.File({
        level: "info", //nivel do log
        filename: "logs/payfast.log", //onde ele será escrito
        maxsize: 1048576, //tamanho máximo do arquivo
        maxFiles: 10, //quantidade máxima de arquivos que devem ser mantidos para essa camada de log
        colorize: false //se o log deve usar cores ou não
      })
    ]
});

module.exports = logger