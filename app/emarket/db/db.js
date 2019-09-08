var libs = {};
libs.sqlite3 = require('sqlite3');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.db = {};

emarket.db.db = function () {}

var the = emarket.db.db;

//database storage
the.db;
the.path = 'block.sqlite';

//use persistent storage with sqlite or RAM based storage
the.useSqlite = true;

the.open = function(path) {

  the.path = path;
  the.db = new libs.sqlite3.Database(path);
}

the.close = function() {

  try {
    if(the.db) {
      the.db.close();
    }
  } catch (err) {

  }
}

the.use = function(fn, callback) {

  the.db = new libs.sqlite3.Database(the.path, function(err) {

    if(err) {

      callback({ result: 'error', error: err });
      return;
    }

    try {
        
      fn(function(result) {

        callback(result);
        return;
      });
    } catch(err2) {

      the.close();
      callback({ result: 'error', error: err2 });
      return;
    }
  });
}

module.exports = the