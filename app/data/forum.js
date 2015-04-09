// Global SQL queries (forum categories, stats, etc.)

'use strict';

module.exports = {
  categoriesByGroup: categoriesByGroup
};


function categoriesByGroup(groupID, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.categoriesByGroup),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}
