// message model

'use strict';

module.exports = {
  info: info
};



function info(messageID, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select m."id", m."conversationID", m."html", m."markdown", m."dateCreated", m."draft", t."discussionID", d."url" as "discussionUrl", u.id as "authorID", u.username as author, u.url as "authorUrl", t.url as "topicUrl" from posts p join users u on p."userID" = u.id join topics t on p."topicID" = t.id join discussions d on t."discussionID" = d."id" where p.id = $1;',
        [ messageID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            if ( result.rows.length ) {
              emitter.emit('ready', result.rows[0]);
            } else {
              emitter.emit('ready', false);
            }
          }
        }
      );
    }
  });
}
