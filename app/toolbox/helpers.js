// helpers

'use strict';

module.exports = {
  activationCode: activationCode,
  hash: hash,
  compareHash: compareHash,
  ip: ip,
  isoDate: isoDate,
  paginate: paginate,
  previousAndNext: previousAndNext
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
        lastPage: Math.ceil( parseInt(itemCount, 10) / 25 ),
        pages: {}
      };

  if ( pagination.lastPage <= 5 ) {
    for ( var i = 1; i <= pagination.lastPage; i++ ) {
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
    if ( pagination.currentPage <= 3 ) {
      for ( var i = 2; i <= 4; i++ ) {
        pagination.pages[i] = {
          number: i,
          url: baseUrl + '/page/' + i,
          text: i.toString(),
          isCurrentPage: i === pagination.currentPage
        };
      }
    } else if ( pagination.currentPage >= pagination.lastPage - 2 ) {
      for ( var i = pagination.lastPage - 3; i <= pagination.lastPage - 1; i++ ) {
        pagination.pages[i] = {
          number: i,
          url: baseUrl + '/page/' + i,
          text: i.toString(),
          isCurrentPage: i === pagination.currentPage
        };
      }
    } else {
      for ( var i = pagination.currentPage - 1; i <= pagination.currentPage + 1; i++ ) {
        pagination.pages[i] = {
          number: i,
          url: baseUrl + '/page/' + i,
          text: i.toString(),
          isCurrentPage: i === pagination.currentPage
        };
      }
    }
  }

  return pagination;
}



function previousAndNext(baseUrl, currentPage, itemCount) {
  var pagination = {
        // Make sure currentPage and itemCount are number types
        currentPage: parseInt(currentPage, 10),
        lastPage: Math.ceil( parseInt(itemCount, 10) / 25 ),
        pages: {}
      },
      output = false;

  if ( pagination.currentPage > 1 ) {
    pagination.pages.previous = {
      number: pagination.currentPage - 1,
      url: baseUrl + '/page/' + ( pagination.currentPage - 1 ),
      text: 'Previous page (' + ( pagination.currentPage - 1 ).toString() + ')'
    };
    output = true;
  }

  if ( pagination.currentPage !== pagination.lastPage ) {
    pagination.pages.next = {
      number: pagination.currentPage + 1,
      url: baseUrl + '/page/' + ( pagination.currentPage + 1 ),
      text: 'Next page (' + ( pagination.currentPage + 1 ).toString() + ')'
    };
    output = true;
  }

  if ( output ) {
    return pagination;
  } else {
    return false;
  }
}
