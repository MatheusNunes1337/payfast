var mysql  = require('mysql');
const dotenv = require('dotenv')

dotenv.config()

function createDBConnection(){
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
}

module.exports = function() {
  return createDBConnection;
}