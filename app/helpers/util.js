// helpers

export const activationCode = () => {
  return Math.random().toString().replace('0.', '')
}


export const compareHash = async (str, hash) => {
  return await app.helpers.bcrypt.compare(str, hash).then(result => {
    return result
  }).catch(err => { throw err })
}


export const copy = (object) => {
  let objectCopy

  if ( !object || typeof object === 'number' || typeof object === 'string' || typeof object === 'boolean' || typeof object === 'symbol' || typeof object === 'function' || object.constructor === Date || object._onTimeout ) { // Node returns typeof === 'object' for setTimeout()
    objectCopy = object
  } else if ( Array.isArray(object) ) {
    objectCopy = []
  
    object.forEach( function (item, index) {
      objectCopy[index] = copy(item)
    })
  } else if ( object.constructor === Object || Object(object) === object ) {
    objectCopy = Object.assign({}, object)

    for ( var property in objectCopy ) {
      objectCopy[property] = copy(object[property])
    }
  } else {
    objectCopy = object
  }
  
  return objectCopy
}


export const extend = (original, extension) => {
  let mergedObject = Object.assign({}, original) || {}

  extension = Object.assign({}, extension) || {}

  Object.keys(extension).forEach( item => {
    if ( extension[item] && extension[item].constructor === Object ) {
      mergedObject[item] = extend(mergedObject[item], extension[item])
    } else {
      mergedObject[item] = copy(extension[item])
    }
  })

  return mergedObject
}


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
export const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min
}


export const hash = async (str) => {
  return await app.helpers.bcrypt.hash(str, 12).then(result => {
    return result
  }).catch(err => { throw err })
}


export const ip = (remoteAddress, includeProxies) => {
  let address = remoteAddress.split(', ')

  // Include proxies and return as an array
  if ( includeProxies ) {
    address.forEach( function (item, index) {
      address[index] = address[index].replace('::ffff:', '')
    })
  // Ignore proxies, keep only the client IP, and return as string
  } else {
    address = address[0].replace('::ffff:', '')
  }

  return address
}


export const isoDate = (date) => {
  let givenDate = date || new Date(),
      isoformattedDate

  try {
    isoformattedDate = givenDate.toISOString()
  } catch ( err ) {
    err.message = 'The object provided is not a valid date.'
    throw err
  }

  return isoformattedDate
}


export const paginate = (baseUrl, currentPage, itemCount) => {
  let pagination = {
        // Make sure currentPage and itemCount are number types
        currentPage: parseInt(currentPage, 10),
        lastPage: Math.ceil( parseInt(itemCount, 10) / 25 ),
        pages: {}
      },
      i

  // Sanitize URLs to prevent duplicate page values
  baseUrl = baseUrl.replace(/\/page\/[0-9]+/g, '')

  if ( pagination.lastPage <= 5 ) {
    for ( i = 1; i <= pagination.lastPage; i++ ) {
      pagination.pages[i] = {
        number: i,
        url: baseUrl + '/page/' + i,
        text: i === 1 ? 'Page 1' : i.toString(),
        isCurrentPage: i === pagination.currentPage
      }
    }
  } else {
    // First page
    pagination.pages[1] = {
      number: 1,
      url: baseUrl + '/page/1',
      text: 'Page 1',
      isCurrentPage: pagination.currentPage === 1
    }

    // Last page
    pagination.pages[pagination.lastPage] = {
      number: pagination.lastPage,
      url: baseUrl + '/page/' + pagination.lastPage,
      text: pagination.lastPage,
      isCurrentPage: pagination.currentPage === pagination.lastPage
    }

    // Middle pages
    let from, to

    if ( pagination.currentPage <= 3 ) {
      from = 2
      to = 4
    } else if ( pagination.currentPage >= pagination.lastPage - 2 ) {
      from = pagination.lastPage - 3
      to = pagination.lastPage - 1
    } else {
      from = pagination.currentPage - 1
      to = pagination.currentPage + 1
    }

    for ( i = from; i <= to; i++ ) {
      pagination.pages[i] = {
        number: i,
        url: baseUrl + '/page/' + i,
        text: i.toString(),
        isCurrentPage: i === pagination.currentPage
      }
    }
  }

  return pagination
}


export const previousAndNext = (baseUrl, currentPage, itemCount) => {
  let pagination = {
        // Make sure currentPage and itemCount are number types
        currentPage: parseInt(currentPage, 10),
        lastPage: parseInt(itemCount, 10) ? Math.ceil( parseInt(itemCount, 10) / 25 ) : parseInt(currentPage, 10),
        pages: {}
      },
      output = false

  // Sanitize URLs to prevent duplicate page values
  baseUrl = baseUrl.replace(/\/page\/[0-9]+/g, '')

  if ( pagination.currentPage > 1 ) {
    pagination.pages.previous = {
      class: 'previous',
      number: pagination.currentPage - 1,
      url: baseUrl + '/page/' + ( pagination.currentPage - 1 ),
      text: 'Page ' + ( pagination.currentPage - 1 )
    }
    output = true
  }

  if ( pagination.currentPage !== pagination.lastPage ) {
    pagination.pages.next = {
      class: 'next',
      number: pagination.currentPage + 1,
      url: baseUrl + '/page/' + ( pagination.currentPage + 1 ),
      text: 'Page ' + ( pagination.currentPage + 1 )
    }
    output = true
  }

  if ( output ) {
    return pagination
  } else {
    return false
  }
}
