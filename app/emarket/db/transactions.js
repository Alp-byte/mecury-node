var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');

emarket.db.transactions = function () {}

var the = emarket.db.transactions;
the.myname = 'emarket.db.transactions';

the.create = function(callback) {

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.serialize(function() {

        ///TODO: add primary key
        ///TODO: use text field for wallet
        ///TODO: better name for 'recipents'

        emarket.db.db.db.run('CREATE TABLE IF NOT EXISTS transactions (\
          recipents VARCHAR(70) NOT NULL,\
          amount VARCHAR(50) NOT NULL DEFAULT 0,\
          wallet INTEGER NOT NULL DEFAULT 0, \
          timestamp INTEGER NOT NULL DEFAULT 0)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS transactions_recipents_idx ON transactions (recipents ASC)');
        emarket.db.db.db.run('CREATE INDEX IF NOT EXISTS transactions_timestamp_idx ON transactions (timestamp ASC)');
        callback({ result: 'ok' });
        return;
      });
    },
    callback);
}

the.insert = function(item, callback) {

  emarket.db.db.use(
    function(callback) {

      // var date = Date.now()
      // var dd = Math.floor(Date.now() / 1000);
      var date = new Date();

      // var utcSeconds = 1234567890;
      // var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      // var dt = d.setUTCSeconds(utcSeconds);

      ///TODO: use names for item fields, not indices

      emarket.db.db.db.run('INSERT INTO transactions VALUES (?, ?, ?, ?)',
        [ item[0], item[1], item[2], date ],
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

the.select = function(request, callback) {

  var wallet = request.wallet;

  var answer = {};

  emarket.db.db.use(
    function(callback) {

      emarket.db.db.db.all('SELECT * FROM transactions WHERE wallet = ?  ORDER BY timestamp DESC', [ wallet ], function(err, rows) {

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


module.exports = the;
