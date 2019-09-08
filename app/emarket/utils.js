var emarket = {};

emarket.ethereum = {};
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.utils = function () {}

var the = emarket.utils;
the.myname = 'emarket.utils';

//find timestamp for the event
//adapted for async waterfall usage
the.asyncFindTimestampForEvent = function(options, context, asyncCallback) {
  
  var event = context.event;

  if (event.timestamp && (event.timestamp > 0)) {

    asyncCallback(null, context);
    return;
  }

  emarket.ethereum.eth.getBlock(event.blockNumber, options, function (result) {

    if (result.result != 'ok') {

      asyncCallback({ error: result.error, type: 'temporary' }, null);
      return;
    }

    context.event.timestamp = parseInt(result.block.timestamp);

    asyncCallback(null, context);
    return;
  });
}

module.exports = the