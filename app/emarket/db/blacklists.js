var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.blacklists = function () {}

var the = emarket.db.blacklists;
the.myname = 'emarket.db.blacklists';

//contains all blacklisted addresses. Blacklisted address is a primary key.
//contractAddress is a blacklist source.
//[address, contractAddress, blacklisted]
var blacklists = {};

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    blacklists = {};
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS blacklists (\
          address VARCHAR(50) PRIMARY KEY NOT NULL,\
          contractAddress VARCHAR(50) NOT NULL DEFAULT "",\
          blacklisted INTEGER NOT NULL DEFAULT 0)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS blacklists_contractAddress_idx ON blacklists (contractAddress ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(address, item, callback) {

  if(!emarket.db.db.useSqlite) {

    blacklists[address] = item;
    callback({result: 'ok'});
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO blacklists VALUES (?, ?, ?)',
        [ address, item.blacklist, item.blacklisted ],
        function(err) {

          if(err) {

            callback({ result: 'error', error: err });
            return;
          }

          callback({ result: 'ok' });
          return;
        });
      
      return;
    },
    callback);
}

the.select = function(address, callback) {

  var answer = {};
  if(!emarket.db.db.useSqlite) {

    var items = blacklists;

    answer.result = "ok";
    answer.item = items[address];
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM blacklists WHERE address = ?',
        [ address ], function(err, rows) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        answer.result = "ok";
        if(!rows || (rows.length == 0)) {

          answer.item = {address: address, blacklisted: false};
        } else {

          answer.item = rows[0];
        }
        callback(answer);
        return;
      });
    },
    callback);
}

module.exports = the