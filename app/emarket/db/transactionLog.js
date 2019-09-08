var emarket = {};
emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.transactionLog = function () {}

var the = emarket.db.transactionLog;
the.myname = 'emarket.db.transactionLog';

the.create = function(callback) {

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        ///TODO: primary key first
        ///TODO: what is id here? Why hash is not a primary key?
        ///TODO: do we have any indices?
        ///TODO: status is text field. Why?

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS transactionLog (\
          title VARCHAR(50) NOT NULL,\
          status VARCHAR(50) NOT NULL,\
          id INTEGER NOT NULL DEFAULT 0,\
          timestamp INTEGER NOT NULL DEFAULT 0,\
          item VARCHAR(70) NOT NULL DEFAULT "",\
          hash VARCHAR(70) NOT NULL DEFAULT "",\
          payload TEXT NOT NULL DEFAULT "",\
          PRIMARY KEY(id))');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.run('INSERT OR REPLACE INTO transactionLog VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ item.title, item.status, item.id, item.timestamp, item.item, item.hash, item.payload],
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

the.getAll = function(callback) {

  var answer = {};

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM transactionLog ORDER BY timestamp DESC', [], function(err, rows) {

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

the.getLastUnfinished = function(callback) {

  var answer = {};

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM transactionLog WHERE status = ? ORDER BY timestamp DESC', ['TRANSACTION_INITIATED'], function(err, rows) {

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

the.clearAll = function(callback) {
  
  var answer = {};
  
  emarket.db.db.use(
    function(callback) {
      
      emarket.db.db.db.all('DELETE FROM transactionLog', [], function(err, rows) {
        
        if(err) {
          console.log('WE have an error here');
          callback({ result: 'error', error: err });
          return;
        }
        
        answer.result = "ok";
        callback(answer);
        return;
      });
    },
    callback);
}

module.exports = the