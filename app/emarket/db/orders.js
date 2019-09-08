var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.orders = function () {}

var the = emarket.db.orders;
the.myname = 'emarket.db.orders';

//contains orders.
//[contractAddress, order]
var orders = [];

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    orders = [];
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS orders (\
          transactionHash VARCHAR(70) NOT NULL,\
          contractAddress VARCHAR(50) NOT NULL DEFAULT "",\
          logIndex INTEGER NOT NULL DEFAULT 0,\
          version INTEGER NOT NULL DEFAULT 0,\
          sender VARCHAR(50) NOT NULL DEFAULT "",\
          recipient VARCHAR(50) NOT NULL DEFAULT "",\
          eventType INTEGER NOT NULL DEFAULT 0,\
          blockNumber INTEGER NOT NULL DEFAULT 0,\
          timestamp INTEGER NOT NULL DEFAULT 0,\
          tradeId VARCHAR(40) NOT NULL DEFAULT "",\
          payload TEXT NOT NULL DEFAULT "",\
          PRIMARY KEY(transactionHash, contractAddress, logIndex))');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_contractAddress_idx ON orders (contractAddress ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_version_idx ON orders (version ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_sender_idx ON orders (sender ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_recipient_idx ON orders (recipient ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_eventType_idx ON orders (eventType ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_blockNumber_idx ON orders (blockNumber ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_timestamp_idx ON orders (timestamp ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS orders_tradeId ON orders (tradeId ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  if(!emarket.db.db.useSqlite) {

    orders.push(item);
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO orders VALUES (?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?)',
        [ item.transactionHash, item.address,  item.logIndex, item.version, item.sender, item.recipient, item.eventType,
        item.blockNumber, item.timestamp, item.tradeId, item.payload ],
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

    var items = orders;

    answer.result = "ok";
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM orders ORDER BY rowid ASC', [], function(err, rows) {

        if(err) {
          console.log('WE have an error here');
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

the.selectWithAddressAndTradeId = function(address, tradeId, callback) {

  var answer = {};
  if(!emarket.db.db.useSqlite) {

    var items = orders;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.contractAddress != address) continue;
      if(item.tradeId != tradeId) continue;

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

      emarket.db.db.db.all('SELECT * FROM orders WHERE contractAddress = ? AND tradeId = ? ORDER BY rowid ASC',
        [ address, tradeId ], function(err, rows) {

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

the.selectWithTradeId = function(tradeId, callback) {

  var answer = {};
  if(!emarket.db.db.useSqlite) {

    var items = orders;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.tradeId != tradeId) continue;

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

      emarket.db.db.db.all('SELECT * FROM orders WHERE tradeId = ? ORDER BY rowid ASC',
        [ tradeId ], function(err, rows) {

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

the.selectWithAddressAndEventType = function(address, eventType, callback) {

  var answer = {};
  if(!emarket.db.db.useSqlite) {

    var items = orders;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.contractAddress != address) continue;
      if(item.eventType != eventType) continue;

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

      emarket.db.db.db.all('SELECT * FROM orders WHERE contractAddress = ? AND eventType = ? ORDER BY rowid ASC',
        [ address, eventType ], function(err, rows) {

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