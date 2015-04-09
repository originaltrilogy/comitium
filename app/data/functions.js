// General database connectivity

'use strict';

var mysql = require('mysql');

module.exports = {
  // connection: connection,
  pool: pool
};


// function connection() {
//   return mysql.createConnection(app.config.db);
// }


function pool() {
  return mysql.createPool(app.config.db);
}
