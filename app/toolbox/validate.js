// validation methods


export const email = (e) => {
  var emailRegex = new RegExp(/[a-z0-9!##$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!##$%&''*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i)
  return emailRegex.test(e)
}


export const password = (p) => {
  var passwordRegex = new RegExp(/^[^\s\n\t\r\v]{8,50}$/)
  return passwordRegex.test(p)
}


export const url = (u) => {
  let urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/)
  return urlRegex.test(u)
}


export const username = (u) => {
  var usernameRegex = new RegExp(/^[^\n\t\r\v@:!<>(),[\]]{1,30}$/)
  if ( !u.trim().length ) {
    return false
  } else {
    return usernameRegex.test(u)
  }
}
