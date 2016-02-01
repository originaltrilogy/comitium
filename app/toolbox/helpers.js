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
  var address = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || ( request.connection.socket ? request.connection.socket.remoteAddress : 'undefined' );

  address = address.split(', ');

  address.forEach( function (item, index, array) {
    address[index] = address[index].replace('::ffff:', '');
  });

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
        lastPage: Math.ceil( parseInt(itemCount) / 25 ),
        pages: {}
      };

  if ( pagination.currentPage <= 3 ) {
    for ( var i = 1; i <= pagination.lastPage; i++ ) {
      pagination.pages[i] = {
        number: i,
        url: i > 1 ? baseUrl + '/page/' + i : baseUrl,
        text: i > 1 ? i.toString() : 'Page 1',
        isCurrentPage: i === pagination.currentPage
      };

      if ( i === 4 && pagination.lastPage > 4 ) {
        break;
      }
    }
  } else {
    // First page
    pagination.pages[1] = {
      number: 1,
      url: baseUrl,
      text: 'Page 1',
      isCurrentPage: false
    };

    // Current page
    pagination.pages[pagination.currentPage] = {
      number: pagination.currentPage,
      url: baseUrl + '/page/' + pagination.currentPage,
      text: pagination.currentPage.toString(),
      isCurrentPage: true
    };

    // Previous page
    pagination.previousPage = pagination.currentPage - 1;
    pagination.pages[pagination.previousPage] = {
      number: pagination.previousPage,
      url: baseUrl + '/page/' + ( pagination.previousPage ),
      text: pagination.previousPage.toString(),
      isCurrentPage: false
    };

    // Next page
    pagination.nextPage = pagination.currentPage + 1;
    if ( pagination.nextPage < pagination.lastPage ) {
      pagination.pages[pagination.nextPage] = {
        number: pagination.nextPage,
        url: baseUrl + '/page/' + ( pagination.nextPage ),
        text: pagination.nextPage.toString(),
        isCurrentPage: false
      };
    }

    // Last page
    if ( pagination.nextPage === pagination.lastPage ) {
      pagination.pages[pagination.lastPage] = {
        number: pagination.lastPage,
        url: baseUrl + '/page/' + pagination.lastPage,
        text: pagination.lastPage.toString(),
        isCurrentPage: pagination.lastPage === pagination.currentPage
      };
    }
  }

  // Extra last page for mirrored navigation
  pagination.pages.lastPage = {
    number: pagination.lastPage,
    url: baseUrl + '/page/' + ( pagination.lastPage ),
    text: pagination.lastPage.toString(),
    isCurrentPage: false
  };

  return pagination;
}
