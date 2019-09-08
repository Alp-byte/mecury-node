var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.escrows = function () {}

var the = emarket.db.escrows;
the.myname = 'emarket.db.escrows';

//contains escrow info. Contract address is a primary key.
//[address, height, arbiter, freezePeriod, feePromille, rewardPromille]
var escrows = {};

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    escrows = {};
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {
        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS escrows (\
          address VARCHAR(50) PRIMARY KEY NOT NULL,\
          height INTEGER NOT NULL DEFAULT 0,\
          arbiter VARCHAR(50) NOT NULL DEFAULT "",\
          freezePeriod  INTEGER NOT NULL DEFAULT 0,\
          feePromille INTEGER NOT NULL DEFAULT 0,\
          rewardPromille INTEGER NOT NULL DEFAULT 0)');
          emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS escrows_arbiter_idx ON escrows (arbiter ASC)');
          emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS escrows_freezePeriod_idx ON escrows (freezePeriod ASC)');
          emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS escrows_feePromille_idx ON escrows (feePromille ASC)');
          emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS escrows_rewardPromille_idx ON escrows (rewardPromille ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(address, item, callback) {

  if(!emarket.db.db.useSqlite) {

    escrows[address] = item;
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO escrows VALUES (?, ?, ?, ?, ?, ?)',
        [ address, item.height, item.arbiter, item.freezePeriod, item.feePromille, item.rewardPromille ],
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

    var items = escrows;

    answer.result = "ok";
    answer.item = items[address];
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM escrows WHERE address = ?',
        [ address ], function(err, rows) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        answer.result = "ok";
        if(!rows || (rows.length == 0)) {

          answer.item =  { address: address, height: 0, arbiter: '', freezePeriod: 0, feePromille: 0, rewardPromille: 0 };
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