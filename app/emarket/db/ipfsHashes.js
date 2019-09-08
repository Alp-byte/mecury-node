var libs = {};

var emarket = {}
emarket.db = {}

emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.ipfsHashes = function () {}

var the = emarket.db.ipfsHashes;
the.myname = 'emarket.db.ipfsHashes';

//contains all hashes.
var hashes = {};

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    hashes = {};
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS ipfsHashes (\
          hashData VARCHAR(65) PRIMARY KEY NOT NULL,\
          sender VARCHAR(50) NOT NULL DEFAULT "",\
          version INTEGER NOT NULL DEFAULT 0,\
          blockNumber INTEGER NOT NULL DEFAULT 0,\
          timestamp INTEGER NOT NULL DEFAULT 0)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsHashes_hashData_idx ON ipfsHashes (hashData ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsHashes_sender_idx ON ipfsHashes (sender ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsHashes_version_idx ON ipfsHashes (version ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsHashes_blockNumber_idx ON ipfsHashes (blockNumber ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsHashes_timestamp_idx ON ipfsHashes (timestamp ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  if(!emarket.db.db.useSqlite) {

    hashes[item.hashData] = { hashData: item.hashData, sender: item.sender };
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO ipfsHashes VALUES (?, ?, ?, ?, ?)',
        [ item.hashData, item.sender, item.version, item.blockNumber, item.timestamp ],
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

    var items = [];

    for (var key in hashes) {

      if (!hashes.hasOwnProperty(key)) continue;
      items.push(hashes[key]);
    }

    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM ipfsHashes ORDER BY rowid ASC', [], function(err, rows) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        answer.result = 'ok';
        answer.items = rows;
        callback(answer);
        return;
      });
    },
    callback);
}

the.selectWithHash = function(hashData, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = [];
    
    if(hashes[hashData]) {
      items.push(hashes[hashData]);
    }

    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM ipfsHashes WHERE hashData = ?', [ hashData ], function(err, rows) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        answer.result = 'ok';
        answer.items = rows;
        callback(answer);
        return;
      });
    },
    callback);
}

the.selectWithSender = function(sender, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = [];

    for (var key in hashes) {

      if (!hashes.hasOwnProperty(key)) continue;

      var item = hashes[key];

      if(item.sender != sender) continue;

      items.push(item);
    }
    
    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM ipfsHashes WHERE sender = ? ORDER BY rowid ASC',
        [ sender ], function(err, rows) {

        if(err) {

          callback({ result: 'error', error: err });
          return;
        }

        answer.result = 'ok';
        answer.items = rows;
        callback(answer);
        return;
      });
    },
    callback);
}

module.exports = the
