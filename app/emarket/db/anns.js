var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.anns = function () {}

var the = emarket.db.anns;
the.myname = 'emarket.db.anns';

var anns = [];

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    anns = [];
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS anns (\
          version INTEGER NOT NULL DEFAULT 0,\
          blockNumber INTEGER NOT NULL DEFAULT 0,\
          payload TEXT NOT NULL DEFAULT "")');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS anns_version_idx ON anns (version ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  if(!emarket.db.db.useSqlite) {

    anns.push(item);
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO anns VALUES (?, ?, ?)',
        [ item.address, item.blockNumber, item.payload ],
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

the.select = function(callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = anns;

    answer.result = "ok";
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM anns ORDER BY rowid ASC', [], function(err, rows) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        answer.result = "ok";
        answer.items = rows;
        callback(answer);
        return;
      });
    },
    callback);
}

module.exports = the