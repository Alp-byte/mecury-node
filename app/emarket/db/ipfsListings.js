var libs = {};

var emarket = {}
emarket.db = {}

emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.ipfsListings = function () {}

var the = emarket.db.ipfsListings;
the.myname = 'emarket.db.ipfsListings';

//contains all IPFS listings.
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

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS ipfsListings (\
          hashIpfs VARCHAR(65) NOT NULL,\
          addressIpfs VARCHAR(50) NOT NULL DEFAULT "1",\
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
          payload TEXT NOT NULL DEFAULT "",\
          PRIMARY KEY(hashIpfs, addressIpfs))');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_hashIpfs_idx ON ipfsListings (hashIpfs ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_addressIpfs_idx ON ipfsListings (addressIpfs ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_title_idx ON ipfsListings (title ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_storename_idx ON ipfsListings (storename ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_sender_idx ON ipfsListings (sender ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_version_idx ON ipfsListings (version ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_blockNumber_idx ON ipfsListings (blockNumber ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_timestamp_idx ON ipfsListings (timestamp ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_timespan_idx ON ipfsListings (timespan ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_endTimestamp_idx ON ipfsListings (endTimestamp ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_category_idx ON ipfsListings (category ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_tag1_idx ON ipfsListings (tag1 ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_tag2_idx ON ipfsListings (tag2 ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_tag3_idx ON ipfsListings (tag3 ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_currency_idx ON ipfsListings (currency ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_region_idx ON ipfsListings (region ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_origin_idx ON ipfsListings (origin ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_escrow_idx ON ipfsListings (escrow ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_status_idx ON ipfsListings (status ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_price_idx ON ipfsListings (price ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS ipfsListings_saleCount_idx ON ipfsListings (saleCount ASC)');
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

      emarket.db.db.db.run('INSERT OR REPLACE INTO ipfsListings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [ item.hashIpfs, item.addressIpfs, item.title, item.storename, item.sender, item.version,
        item.blockNumber, item.timestamp, item.timespan, item.endTimestamp, item.category,
        item.tag1, item.tag2, item.tag3, item.currency, item.region, item.origin,
        item.escrow, item.status, item.price, item.saleCount, item.payload ],
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

    var items = listings;
    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      //emarket.db.db.db.all('SELECT * FROM ipfsListings ORDER BY rowid ASC', [], function(err, rows) {
      emarket.db.db.db.all(`SELECT l.*, 
        (select case l.storename when '' then '' else ll.storename end from ipfsListings ll where ll.sender = l.sender order by timestamp desc limit 1) as newStoreName 
        FROM ipfsListings l ORDER BY rowid ASC`, [], function(err, rows) {

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
    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM ipfsListings ORDER BY rowid ASC WHERE sender = ?', [sender], function(err, rows) {

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

// use IPFS hash to find items
the.selectWithHashes = function(hashArray, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = listings;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.hashIpfs != hashData) continue;

      itemsNew.push(item);
    }

    items = itemsNew;

    answer.result = 'ok';
    answer.items = items;
    callback(answer);
    return;
  }

  var hashString = "";
  hashArray.forEach((hash,i) => {
    hashArray[i] = '"'+hash+'"';
  })
  hashString += hashArray.join(',');
  

  console.log('query by hashString', hashString);

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM ipfsListings WHERE hashIpfs IN ('+hashString+')',
      [], function(err, rows) {

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

// use IPFS hash to find items
the.selectWithHash = function(hashData, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = listings;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.hashIpfs != hashData) continue;

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

      emarket.db.db.db.all('SELECT * FROM ipfsListings WHERE hashIpfs = ?',
      [ hashData ], function(err, rows) {

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

// use IPFS hash and item address to find the item
the.selectWithAddress = function(hashData, address, callback) {

  var answer = {};

  if(!emarket.db.db.useSqlite) {

    var items = listings;

    var itemsNew = [];
    for(var i = 0; i < items.length; i++) {

      var item = items[i];
      if(item.hashIpfs != hashData) continue;
      if(item.adressIpfs != address) continue;

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

      emarket.db.db.db.all('SELECT * FROM ipfsListings WHERE hashIpfs = ? AND addressIpfs = ?',
      [ hashData, address ], function(err, rows) {

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

      emarket.db.db.db.all('SELECT * FROM ipfsListings WHERE sender = ? ORDER BY rowid ASC',
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

// Select items on which i have placed purchase request
the.selectWithMyPurchases = function(sender, callback) {

  var answer = {};

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT ipfsListings.* FROM ipfsListings JOIN orders ON ipfsListings.escrow = orders.contractAddress COLLATE NOCASE WHERE orders.eventType = 14 AND orders.sender = ? COLLATE NOCASE Group by ipfsListings.hashIpfs',
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

the.selectIPFSStoreName = function (callback) {
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

      // emarket.db.db.db.all('SELECT DISTINCT storename FROM ipfsListings where storename !=""', [], function(err, rows) {
      // emarket.db.db.db.all('SELECT sender,storename, Max(timestamp) as newTimeStamp FROM ipfsListings where storename !="" GROUP BY sender', [], function(err, rows) {
      emarket.db.db.db.all(`SELECT sender,storename,escrow, Max(timestamp) as newTimeStamp FROM ipfsListings GROUP BY sender HAVING storename != ''`, [], function(err, rows) {

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

the.selectIPFSSelectedStore = function (store, callback) {
  var answer = {};
  // var sender = store;

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
      //   (select ll.storename from ipfsListings ll where ll.sender = l.sender and ll.storename != '' order by timestamp desc limit 1) as newStoreName
      //   FROM ipfsListings l where sender IN (${sender.map(e => `"${e}"`)}) AND storename!=''`;

      var qry = `SELECT l.*,
        (select case l.storename when '' then '' else ll.storename end from ipfsListings ll where ll.sender = l.sender order by timestamp desc limit 1) as newStoreName
      FROM ipfsListings l where sender IN (${newArr.map(e => `"${e.sender}"`)}) AND newStoreName IN (${newArr.map(f => `"${f.storename}"`)})`
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
