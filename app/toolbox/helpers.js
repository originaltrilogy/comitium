// helpers

'use strict';

module.exports = {
  activationCode: activationCode,
  compareHash: compareHash,
  hash: hash,
  ip: ip,
  isoDate: isoDate,
  paginate: paginate,
  previousAndNext: previousAndNext,
  query: query
};



function activationCode() {
  return Math.random().toString().replace('0.', '');
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



function hash(str, emitter) {
  app.toolbox.bcrypt.hash(str, 12, function (err, hash) {
    if ( !err ) {
      emitter.emit('ready', hash);
    } else {
      emitter.emit('error', err);
    }
  });
}



function ip(request, includeProxies) {
  var address = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || ( request.connection.socket ? request.connection.socket.remoteAddress : 'undefined' );

  address = address.split(', ');

  // Include proxies and return as an array
  if ( includeProxies ) {
    address.forEach( function (item, index, array) {
      address[index] = address[index].replace('::ffff:', '');
    });
  // Ignore proxies, keep only the client IP, and return as string
  } else {
    address = address[0].replace('::ffff:', '');
  }

  return address;
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



function paginate(baseUrl, currentPage, itemCount) {
  var pagination = {
        // Make sure currentPage and itemCount are number types
        currentPage: parseInt(currentPage, 10),
        lastPage: Math.ceil( parseInt(itemCount, 10) / 25 ),
        pages: {}
      },
      i;

  // Sanitize URLs to prevent duplicate page values
  baseUrl = baseUrl.replace(/\/page\/[0-9]+/g, '')

  if ( pagination.lastPage <= 5 ) {
    for ( i = 1; i <= pagination.lastPage; i++ ) {
      pagination.pages[i] = {
        number: i,
        url: baseUrl + '/page/' + i,
        text: i === 1 ? 'Page 1' : i.toString(),
        isCurrentPage: i === pagination.currentPage
      };
    }
  } else {
    // First page
    pagination.pages[1] = {
      number: 1,
      url: baseUrl + '/page/1',
      text: 'Page 1',
      isCurrentPage: pagination.currentPage === 1
    };

    // Last page
    pagination.pages[pagination.lastPage] = {
      number: pagination.lastPage,
      url: baseUrl + '/page/' + pagination.lastPage,
      text: pagination.lastPage,
      isCurrentPage: pagination.currentPage === pagination.lastPage
    };

    // Middle pages
    var from, to;

    if ( pagination.currentPage <= 3 ) {
      from = 2;
      to = 4;
    } else if ( pagination.currentPage >= pagination.lastPage - 2 ) {
      from = pagination.lastPage - 3;
      to = pagination.lastPage - 1;
    } else {
      from = pagination.currentPage - 1;
      to = pagination.currentPage + 1;
    }

    for ( i = from; i <= to; i++ ) {
      pagination.pages[i] = {
        number: i,
        url: baseUrl + '/page/' + i,
        text: i.toString(),
        isCurrentPage: i === pagination.currentPage
      };
    }
  }

  return pagination;
}



function previousAndNext(baseUrl, currentPage, itemCount) {
  var pagination = {
        // Make sure currentPage and itemCount are number types
        currentPage: parseInt(currentPage, 10),
        lastPage: parseInt(itemCount, 10) ? Math.ceil( parseInt(itemCount, 10) / 25 ) : parseInt(currentPage, 10),
        pages: {}
      },
      output = false;

  if ( pagination.currentPage > 1 ) {
    pagination.pages.previous = {
      class: 'previous',
      number: pagination.currentPage - 1,
      url: baseUrl + '/page/' + ( pagination.currentPage - 1 ),
      text: 'Page ' + ( pagination.currentPage - 1 )
    };
    output = true;
  }

  if ( pagination.currentPage !== pagination.lastPage ) {
    pagination.pages.next = {
      class: 'next',
      number: pagination.currentPage + 1,
      url: baseUrl + '/page/' + ( pagination.currentPage + 1 ),
      text: 'Page ' + ( pagination.currentPage + 1 )
    };
    output = true;
  }

  if ( output ) {
    return pagination;
  } else {
    return false;
  }
}


function query(options, emitter) {

  // Options:
  // {
  //   cache: boolean,
  //   model: 'model-name',
  //   method: 'methodName',
  //   sql: 'select * from blah where something = $1 and otherthing = $2;',
  //   values: [ value1, value2 ]
  // }

  let cacheKey = options.method + ( options.values ? '-' + options.values.join('-') : ''),
      cacheScope = options.model,
      cached = options.cache ? app.cache.get({ scope: cacheScope, key: cacheKey }) : false

  // If it's cached, return the cache object
  if ( options.cache && cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: options.cacheScope + '_' + options.cacheKey,
          text: options.sql,
          values: options.values || []
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            if ( options.cache && !app.cache.exists({ scope: cacheScope, key: cacheKey }) ) {
              app.cache.set({
                scope: cacheScope,
                key: cacheKey,
                value: result.rows[0]
              })
            }
            emitter.emit('ready', result.rows[0])
          }
        })
      }
    })
  }
}
