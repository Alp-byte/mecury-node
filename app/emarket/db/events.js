var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.events = function () {}

var the = emarket.db.events;
the.myname = 'emarket.db.events';

//contains all events. transactionHash is a primary key.
//contractAddress - source of the event.
//synced - true if the event has been fully processed and no longer requires syncing.
//[transactionHash, contractAddress, synced]
var events = [];

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    events = [];
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS events (\
          transactionHash VARCHAR(70) NOT NULL,\
          contractAddress VARCHAR(50) NOT NULL DEFAULT "",\
          logIndex INTEGER NOT NULL DEFAULT 0,\
          synced INTEGER NOT NULL DEFAULT 0,\
          version INTEGER NOT NULL DEFAULT 0,\
          sender VARCHAR(40) NOT NULL DEFAULT "",\
          eventType INTEGER NOT NULL DEFAULT 0,\
          blockNumber INTEGER NOT NULL DEFAULT 0,\
          timestamp INTEGER NOT NULL DEFAULT 0,\
          payment VARCHAR(40) NOT NULL DEFAULT "0", \
          payload TEXT NOT NULL DEFAULT "", \
          PRIMARY KEY(transactionHash, contractAddress, logIndex))');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_contractAddress_idx ON events (contractAddress ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_synced_idx ON events (synced ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_version_idx ON events (version ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_sender_idx ON events (sender ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_eventType_idx ON events (eventType ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_blockNumber_idx ON events (blockNumber ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_timestamp_idx ON events (timestamp ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS events_payment_idx ON events (payment ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  if(!emarket.db.db.useSqlite) {

    events.push(item);
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [ item.transactionHash, item.address, item.logIndex, item.synced? 1: 0,
        item.version, item.sender, item.eventType,
        item.blockNumber, item.timestamp, item.payment,
        item.payload ],
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

the.selectWithAddress = function(address, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = events;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.contractAddress != address) continue;

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

      emarket.db.db.db.all('SELECT * FROM events WHERE contractAddress = ? ORDER BY rowid ASC',
        [ address ], function(err, rows) {

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

the.selectWithHash = function(hash, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = events;

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

      emarket.db.db.db.all('SELECT * FROM events WHERE transactionHash = ?',
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

the.selectWithHashAndContractAddress = function(hash, contractAddress, logIndex, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = events;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.transactionHash != hash) continue;
      if(item.contractAddress != contractAddress) continue;
      if(item.logIndex != logIndex) continue;

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

      emarket.db.db.db.all('SELECT * FROM events WHERE transactionHash = ? AND contractAddress = ? AND logIndex = ?',
        [ hash, contractAddress, logIndex ], function(err, rows) {

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

the.selectWithSynced = function(synced, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = events;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.synced != (synced? 1 : 0)) continue;

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

      emarket.db.db.db.all('SELECT * FROM events WHERE synced = ? ORDER BY rowid ASC',
        [ synced? 1 : 0 ], function(err, rows) {

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

the.selectWithAddressAndSynced = function(address, synced, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = events;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.synced != (synced? 1 : 0)) continue;
      if(item.contractAddress != address) continue;

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

      emarket.db.db.db.all('SELECT * FROM events WHERE contractAddress = ? AND synced = ? ORDER BY rowid ASC',
        [ address, synced? 1 : 0 ], function(err, rows) {

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

the.selectWithTimestamp = function(timestamp, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    answer.result = "ok";
    answer.items = [];
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM events WHERE timestamp > ? ORDER BY rowid ASC',
        [timestamp / 1000], function(err, rows) {

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
