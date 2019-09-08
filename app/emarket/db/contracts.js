var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.contracts = function () {}

var the = emarket.db.contracts;
the.myname = 'emarket.db.contracts';

//contains contract info. Contract address is a primary key.
//[address, height, contentCount]
var contracts = {};

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    contracts = {};
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {
        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS contracts (\
          address VARCHAR(50) PRIMARY KEY NOT NULL,\
          height INTEGER NOT NULL DEFAULT 0,\
          contentCount INTEGER NOT NULL DEFAULT 0,\
          contractCode TEXT NOT NULL DEFAULT "")');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(address, item, callback) {

  if(!emarket.db.db.useSqlite) {

    contracts[address] = item;
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO contracts VALUES (?, ?, ?, ?)',
        [ address, item.height, item.contentCount, item.contractCode ],
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

    var items = contracts;

    answer.result = "ok";
    answer.item = items[address];
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM contracts WHERE address = ?',
        [ address ], function(err, rows) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        answer.result = "ok";
        if(!rows || (rows.length == 0)) {

          answer.item = { address: address, height: 0, contentCount: 0, contractCode: '' };
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