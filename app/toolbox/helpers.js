// helpers

'use strict';

module.exports = {
  dashes: dashes,
  isoDate: isoDate,
  paginate: paginate
};


function dashes(text) {
	var parsedText = text.trim();

  parsedText = parsedText.replace(/&quot;/g, '-');
  parsedText = parsedText.replace(/\./g, '');
  parsedText = parsedText.replace(/'/g, '');
	parsedText = parsedText.replace(/[^0-9A-Za-z]/g, '-');

	if ( parsedText.replace(/-/g, '').length > 0 ) {
    while ( parsedText.search(/--/) >= 0 ) {
      parsedText = parsedText.replace(/--/g, '-');
    }
	} else {
		parsedText = 'Untitled';
	}

  return parsedText;
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
        total: Math.floor( itemCount / 20 )
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
