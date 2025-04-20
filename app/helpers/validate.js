// validation methods


export const email = (e) => {
  let emailRegex = new RegExp(/^[a-z0-9!##$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!##$%&''*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i)
  return emailRegex.test(e)
}


export const password = (p) => {
  let passwordRegex = new RegExp(/^[^\s\n\t\r\v]{8,50}$/)
  return passwordRegex.test(p)
}


// Members with restricted posting privileges have their posts screened for contact info, URLs, etc.
export const restrictedContent = (pc) => {
  let containsEmail = new RegExp(/[a-z0-9!##$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!##$%&''*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i).test(pc),
      containsPhoneNumber = new RegExp(/[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/).test(pc),
      urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i),
      containsUrl = urlRegex.test(pc)

  // Links within the site are allowed
  if ( containsUrl ) {
    let siteUrlCheck = pc.replaceAll(app.config.comitium.baseUrl, 'foo')
    containsUrl = urlRegex.test(siteUrlCheck)
  }
  
  return containsEmail || containsPhoneNumber || containsUrl
}


export const url = (u) => {
  let urlRegex = new RegExp(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/i)
  return urlRegex.test(u)
}


export const username = (u) => {
  let usernameRegex = new RegExp(/^[^\n\t\r\v@:!<>(),[\]]{1,30}$/)
  if ( !u.trim().length ) {
    return false
  } else {
    return usernameRegex.test(u)
  }
}


export const positiveInteger = (string) => {
  // Verifies a string is a positive integer by replacing any character NOT 0-9 with the letter "a" and checking if the result is greater than 0.
  // string === '1234'  -> true
  // string === '0'     -> false
  // string === '123.'  -> false
  // string === '123.4' -> false
  // string === '-1234' -> false
  return Number(string.replace(/[^0-9]/g, 'a')) > 0
}
