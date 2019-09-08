var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.feedbbt = function () {}

var the = emarket.db.feedbbt;
the.myname = 'emarket.db.feedbbt';

//contains all BBT price feeds. transactionHash is a primary key.
//[transactionHash, price]
var priceFeeds = [];

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    priceFeeds = [];
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS feedbbt (\
          transactionHash VARCHAR(70) PRIMARY KEY NOT NULL,\
          blockNumber INTEGER NOT NULL DEFAULT 0,\
          timestamp INTEGER NOT NULL DEFAULT 0,\
          payment VARCHAR(40) NOT NULL DEFAULT "0")');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS feedbbt_blockNumber_idx ON feedbbt (blockNumber ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS feedbbt_timestamp_idx ON feedbbt (timestamp ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  if(!emarket.db.db.useSqlite) {

    priceFeeds.push(item);
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO feedbbt VALUES (?, ?, ?, ?)',
        [ item.transactionHash, item.blockNumber, item.timestamp, item.payment ],
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

the.selectWithHash = function(hash, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = priceFeeds;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.transactionHash != hash) continue;

      itemsNew.push(item);
    }

    items = itemsNew;

    answer.result = "ok";
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM feedbbt WHERE transactionHash = ?',
        [ hash ], function(err, rows) {

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

the.select = function(callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = priceFeeds;

    answer.result = "ok";
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM feedbbt ORDER BY rowid ASC', function(err, rows) {

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

the.getBBTRate = function(blockNumber, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = priceFeeds;

    for(var item in items) {

      if(item.blockNumber > blockNumber) break;
      answer.payment = item.payment;
    }

    answer.result = "ok";
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.get('SELECT * FROM feedbbt WHERE blockNumber <= ? ORDER BY blockNumber DESC LIMIT 1',
        [ blockNumber ], function(err, row) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        if(typeof row === 'undefined') {

          callback({ result: 'error', error: 'No feedbbt records found' });
          return;
        }

        answer.result = "ok";
        answer.payment = row.payment;
        callback(answer);
        return;
      });
    },
    callback);
}

module.exports = the
