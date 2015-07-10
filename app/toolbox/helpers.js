// helpers

'use strict';

module.exports = {
  activationCode: activationCode,
  hash: hash,
  compareHash: compareHash,
  ip: ip,
  isoDate: isoDate,
  paginate: paginate
};



function activationCode() {
  return Math.random().toString().replace('0.', '');
}



function hash(str, emitter) {
  app.toolbox.bcrypt.hash(str, 12, function (err, hash) {
    if ( !err ) {
      emitter.emit('ready', hash);
    } else {
      emitter.emit('error', err);
    }
  });
}



function compareHash(str, hash, emitter) {
  app.toolbox.bcrypt.compare(str, hash, function (err, result) {
    if ( !err ) {
      emitter.emit('ready', result);
    } else {
      emitter.emit('error', err);
    }
  });
}



function ip(request) {
  return request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || ( request.connection.socket ? request.connection.socket.remoteAddress : 'undefined' );
}



function isoDate(date) {
  var givenDate = date || new Date(),
      isoformattedDate;

  try {
    isoformattedDate = givenDate.toISOString();
  } catch ( err ) {
    throw {
      thrownBy: 'app.toolbox.helpers.isoDate()',
      message: 'The object provided is not a valid date.'
    };
  }

  return isoformattedDate;
}



function paginate(url, page, itemCount) {
  var pagination = {
        current: +page,
        total: Math.ceil( itemCount / 25 )
      };

  if ( pagination.current > 1 ) {
    pagination.first = {
      number: 1,
      url: url
    };
    pagination.previous = {
      number: pagination.current - 1
    };
    if ( pagination.previous.number === 1 ) {
      pagination.previous.url = url;
    } else {
      pagination.previous.url = url + '/page/' + pagination.previous.number;
    }
  }

  if ( pagination.current < pagination.total ) {
    pagination.next = {
      number: pagination.current + 1
    };
    pagination.next.url = url + '/page/' + pagination.next.number;
    pagination.last = {
      number: pagination.total,
      url: url + '/page/' + pagination.total
    };
  }

  return pagination;
}
