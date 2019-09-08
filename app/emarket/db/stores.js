var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.stores = function () {}

var the = emarket.db.stores;
the.myname = 'emarket.db.stores';

the.create = function(callback) {

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS stores (\
          address VARCHAR(50) PRIMARY KEY, \
          storename VARCHAR(70) NOT NULL)');
        emarket.db.db.db.run('CREATE UNIQUE INDEX IF NOT EXISTS stores_address_idx ON stores (address)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO stores VALUES (?, ?)',
        [ item.walletAddress, item.storename ],
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
};

the.select = function(wallet, callback) {

   var answer = {};

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all("SELECT storename FROM stores WHERE address = ?", [ wallet ], function(err, rows) {

        if(err) {
          console.log('WE have an error here');
          callback({ result: 'error', error: err });
          return;
        }

        //answer.result = "ok";
        answer.items = rows;
        callback(answer);
        return;
      });
    },
    callback);
}

the.delete = function(callback) {

  var answer = {};

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('DELETE FROM stores', [], function(err, rows) {

        if(err) {
          console.log('WE have an error here');
          callback({ result: 'error', error: err });
          return;
        }

        answer.result = "ok";
        console.log("store cleared successfull");
        callback(answer);
        return;
      });
    },
    callback);
}


module.exports = the;
