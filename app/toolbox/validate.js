// validation methods

'use strict';

module.exports = {
  email: email,
  password: password,
  username: username
};


function email(e) {
  var emailRegex = new RegExp(/[a-z0-9!##$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!##$%&''*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
  return emailRegex.test(e);
}


function password(p) {
  var passwordRegex = new RegExp(/[^\s]{8,}$/);
  return passwordRegex.test(p);
}


function username(u) {
  var usernameRegex = new RegExp(/^[A-Za-z0-9 \-]{1,}$/);
  if ( !u.trim().length ) {
      return false;
  } else {
      return usernameRegex.test(u);
  }
}
