var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.listings = function () {}

var the = emarket.db.listings;
the.myname = 'emarket.db.listings';

//contains all listings.
var listings = [];

the.create = function(callback) {

  if(!emarket.db.db.useSqlite) {

    listings = [];
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS listings (\
          address VARCHAR(50) PRIMARY KEY NOT NULL,\
          title TEXT NOT NULL DEFAULT "", \
          storename VARCHAR(50) NOT NULL DEFAULT "",\
          sender VARCHAR(50) NOT NULL DEFAULT "",\
          version INTEGER NOT NULL DEFAULT 0,\
          blockNumber INTEGER NOT NULL DEFAULT 0,\
          timestamp INTEGER NOT NULL DEFAULT 0,\
          timespan INTEGER NOT NULL DEFAULT 0,\
          endTimestamp INTEGER NOT NULL DEFAULT 0,\
          category VARCHAR(40) NOT NULL DEFAULT "", \
          tag1 VARCHAR(40) NOT NULL DEFAULT "", \
          tag2 VARCHAR(40) NOT NULL DEFAULT "", \
          tag3 VARCHAR(40) NOT NULL DEFAULT "", \
          currency VARCHAR(40) NOT NULL DEFAULT "",\
          region VARCHAR(100) NOT NULL DEFAULT "",\
          origin VARCHAR(40) NOT NULL DEFAULT "",\
          escrow VARCHAR(40) NOT NULL DEFAULT "",\
          status INTEGER NOT NULL DEFAULT 0,\
          price VARCHAR(40) NOT NULL DEFAULT "0", \
          saleCount INTEGER NOT NULL DEFAULT 0,\
          availableCount INTEGER NOT NULL DEFAULT 0,\
          pendingCount INTEGER NOT NULL DEFAULT 0,\
          hashIpfs VARCHAR(65) NOT NULL DEFAULT "",\
          addressIpfs VARCHAR(50) NOT NULL DEFAULT "1",\
          payload TEXT NOT NULL DEFAULT "")');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_adress_idx ON listings (address ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_title_idx ON listings (title ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_storename_idx ON listings (storename ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_sender_idx ON listings (sender ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_version_idx ON listings (version ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_blockNumber_idx ON listings (blockNumber ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_timestamp_idx ON listings (timestamp ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_timespan_idx ON listings (timespan ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_endTimestamp_idx ON listings (endTimestamp ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_category_idx ON listings (category ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_tag1_idx ON listings (tag1 ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_tag2_idx ON listings (tag2 ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_tag3_idx ON listings (tag3 ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_currency_idx ON listings (currency ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_region_idx ON listings (region ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_origin_idx ON listings (origin ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_escrow_idx ON listings (escrow ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_status_idx ON listings (status ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_price_idx ON listings (price ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_saleCount_idx ON listings (saleCount ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_availableCount_idx ON listings (availableCount ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_pendingCount_idx ON listings (pendingCount ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_hashIpfs_idx ON listings (hashIpfs ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS listings_addressIpfs_idx ON listings (addressIpfs ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  if(!emarket.db.db.useSqlite) {

    listings.push(item);
    callback({ result: 'ok' });
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO listings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [ item.address, item.title, item.storename, item.sender, item.version, item.blockNumber, item.timestamp,
        item.timespan, item.endTimestamp, item.category, item.tag1, item.tag2, item.tag3,
        item.currency, item.region, item.origin,
        item.escrow, item.status, item.price, item.saleCount, item.availableCount, item.pendingCount,
        item.hashIpfs, item.addressIpfs,
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

the.delete = function (item, callback) {
  if(!emarket.db.db.useSqlite) {
    callback({ result: 'ok' });
    return;
  }
 emarket.db.db.db.run('DELETE from listings where address = ?', [ item.address ], function (err) {
   if(err) {
     callback({result: 'error', error: err});
     return;
   }
   callback({result: 'ok'});
   return;
 });
}

the.select = function(callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = listings;
    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM listings ORDER BY rowid ASC', [], function(err, rows) {
      // emarket.db.db.db.all(`SELECT l.*, 
        // (select case l.storename when '' then '' else ll.storename end from listings ll where ll.sender = l.sender order by timestamp desc limit 1) as newStoreName 
        // FROM listings l ORDER BY rowid ASC`, [], function(err, rows) {
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

the.selectWithAddress = function(address, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = listings;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.adress != address) continue;

      itemsNew.push(item);
    }

    items = itemsNew;

    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM listings WHERE address = ?', [ address ], function(err, rows) {

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

    var items = listings;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.sender != sender) continue;

      itemsNew.push(item);
    }

    items = itemsNew;

    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM listings WHERE sender = ? ORDER BY rowid ASC',
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

the.selectWithIpfsAddressSender = function(hashIpfs, addressIpfs, sender, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = listings;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.hashIpfs != hashIpfs) continue;
      if(item.addressIpfs != addressIpfs) continue;
      if(item.sender != sender) continue;

      itemsNew.push(item);
    }

    items = itemsNew;

    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM listings WHERE hashIpfs = ? AND addressIpfs = ? AND sender = ? ORDER BY rowid ASC',
        [ hashIpfs, addressIpfs, sender ], function(err, rows) {

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

// Select items on which i have placed purchase request
the.selectWithMyPurchases = function(sender, callback) {

  var answer = {};

  // Returning all elements if Sqlite is not availble
  if(!emarket.db.db.useSqlite) {

    var items = listings;
    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all(
        'SELECT listings.* FROM listings JOIN orders ON listings.address = orders.contractAddress ' + 
        'COLLATE NOCASE ' +
        'WHERE (orders.eventType = 1 OR orders.eventType = 5) AND orders.sender = ? ' +
        'COLLATE NOCASE Group by listings.address',
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

the.selectStoreName = function (callback) {
  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = listings;
    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      // emarket.db.db.db.all('SELECT DISTINCT storename FROM listings where storename !=""', [], function(err, rows) {
      // emarket.db.db.db.all('SELECT sender,storename, Max(timestamp) as newTimeStamp FROM listings where storename !="" GROUP BY sender', [], function(err, rows) {
      emarket.db.db.db.all(`SELECT sender,storename,escrow,Max(timestamp) as newTimeStamp FROM listings GROUP BY sender HAVING storename != ''`, [], function(err, rows) {

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

the.selectSelectedStore = function (store, callback) {
  var answer = {};

  var newArr = store.map(e => ({
    sender : e.sender,
    storename : e.storename
  }));

  if(!emarket.db.db.useSqlite) {

    var items = listings;
    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {
      // var qry = `SELECT l.*,
      //   (select ll.storename from listings ll where ll.sender = l.sender and ll.storename != '' order by timestamp desc limit 1) as newStoreName
      //   FROM listings l where sender IN (${sender.map(e => `"${e}"`)}) AND storename!=''`;

      var qry = `SELECT l.*,
        (select case l.storename when '' then '' else ll.storename end from listings ll where ll.sender = l.sender order by timestamp desc limit 1) as newStoreName
      FROM listings l where sender IN (${newArr.map(e => `"${e.sender}"`)}) AND newStoreName IN (${newArr.map(f => `"${f.storename}"`)})`
      emarket.db.db.db.all(qry, function(err, rows) {

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
