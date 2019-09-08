var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.default_contracts = require.main.require('./emarket/default_contracts');
emarket.sync = require.main.require('./emarket/sync');

emarket.db = {};
emarket.db.anns = require.main.require('./emarket/db/anns');

emarket.anns = function () {}

var the = emarket.anns;
the.myname = 'emarket.anns';

the.sync = function(options, progressCallback, callback) {

  emarket.sync.syncHelper(
    options, the.myname + '.sync',
    emarket.default_contracts.annContractAddress, emarket.default_contracts.annContractAbi, 'LogMessage',
    function(item) {

      return true;
    },
    syncBody,
    progressCallback, callback);
}

function syncBody(address, event, options, progressCallback, callback) {

  ///HACK: DB format conversion
  event.version = event.returnValues.version;
  event.payload = event.returnValues.dataInfo;
  emarket.db.anns.insert(event, function(result) {

    callback({ result: 'ok', event: event });
    return;
  });
}

module.exports = the