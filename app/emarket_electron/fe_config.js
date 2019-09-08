var emarket_electron = {};

emarket_electron.fe_config = function () {};

var the = emarket_electron.fe_config;
the.myname = 'emarket_electron.fe_config';

///TODO: is it OK to allow everyone use this secret?

var CONFIG = {
  reviews_secret: 'wprSpCmjZmLYcUqaNl0F',
  imgur: {
    id: '9cfdf4c19b67690',
    secret: '2bdecb291b5d67ce72fb6dde38b96508db9e43db'
  },
  chat_secret: 'testFEsecret'
}

the.getConfig = function(callback) {
  callback(CONFIG);
}

module.exports = the