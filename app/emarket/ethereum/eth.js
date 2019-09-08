var libs = {};
libs.async = require('async');
libs.request = require('request');
libs.lodash = require('lodash');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.web3 = require.main.require('./emarket/ethereum/web3');

/* Caching layer for slow Eth calls. Can be optionally turned off. */

emarket.ethereum.eth = function () {}

var the = emarket.ethereum.eth;
the.myname = 'emarket.ethereum.eth';

//limit simultaneous field fetching
the.parallelRequestsLimit = 10;

the.newState = function(_name) {

  return { current: 0, name: _name, retry: 0, source: '', }
}

the.nextState = function(state, reason) {

  state.current++;
  state.retry++;
  if(state.current >= emarket.defaults.cachingServers.length) state.current = 0;

  console.log('[' + state.name + ']' + ' Switched to new caching server: ' + emarket.defaults.cachingServers[state.current] +
              '.\r\nReason: ' + reason);
  console.log('Retry: ' + state.retry);

  if(state.source && state.source.length > 0) {
    console.log('Source: ' + state.source );
  }

  return state;
}

the.getEventsCached = function(contractAddress, abi, method, options, callback) {

  var startBlock = emarket.defaults.startBlock;
  if(options.startBlock) startBlock = options.startBlock;

  var endBlock = 'latest';

  ///HACK: now only all recent cached events can be fetched
  ///HACK: we do not know what is the last block on the caching server

  cachedCall(the.myname + '.getEventsCached',
    { requestType: 'getEvents', address: contractAddress, method: method, abi: JSON.stringify(abi),
      fromBlock: startBlock, toBlock: endBlock },
    function(result) {

      if(result.result != 'ok') {

        callback(result);
        return;
      }

      if(result.events == null) {

        callback({ result: 'error', error: 'Wrong cached data'} );
        return;
      }

      ///HACK: convert to new args format
      var items = [];
      libs.lodash.forEach(result.events, function(event) {

        if(typeof event.returnValues === 'undefined') event.returnValues = event.args;
        items.push(event);
      });

      callback({ result: 'ok', items: items,
        lastBlock: result.lastBlock, updatedTimestamp: result.updatedTimestamp });
      return;
    });
  return;
}

the.getEventsDirect = function(contractAddress, abi, method, options, callback) {

  var web3state = emarket.ethereum.web3.newState(the.myname + '.getEventsDirect');
  web3state.source = method;

  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3state, asyncCallback) {

      //get status from contract
      var contract = new web3state.web3.eth.Contract(abi, contractAddress);

      var startBlock = emarket.defaults.startBlock;
      if(options.startBlock) startBlock = options.startBlock;

      var endBlock = 'latest';
      if(options.endBlock) endBlock = options.endBlock;

      var eventOptions = { filter: {}, fromBlock: startBlock, toBlock: endBlock };
      if(options.filterVersion) {

        eventOptions.filter.version = options.filterVersion;
      }

      contract.getPastEvents(method, eventOptions, asyncCallback);
      return;
    },

    //okCallback
    function(result) {

      var arrayResult = [];
      if(Array.isArray(result)) {
        arrayResult = result;
      } else {
        arrayResult.push(result);
      }

      callback({ result: 'ok', items: arrayResult });
      return;
    },

    //errorCallback
    callback
  );
}

the.getEvents = function(contractAddress, abi, method, options, callback) {

  if(!options.noCaching && emarket.defaults.cachingAllow && (emarket.defaults.cachingServers.length > 0)) {

    the.getEventsCached(contractAddress, abi, method, options, function(result) {

      if(result.result != 'ok') {

        the.getEventsDirect(contractAddress, abi, method, options, callback);
        return;
      }

      callback(result);
      return;
    });
    return;
  }

  the.getEventsDirect(contractAddress, abi, method, options, callback);
  return;
}

the.getFieldsCached = function(contractAddress, abi, fields, callback) {

  var state = { total: fields.length, processed: 0, skipped: 0, item: {} };

  libs.async.filterLimit(fields, the.parallelRequestsLimit,

    function(field, callback1) {

      if(typeof state.item[field] != 'undefined') {

        state.processed++;
        callback1(null, true);
        return;
      }

      cachedCall(
        the.myname + '.getFieldsCached',
        { requestType: 'getField', address: contractAddress, method: field, abi: JSON.stringify(abi) },
        function(result) {

          state.processed++;

          if(result.result != 'ok') {

            //terminate further processing of the fields - fail early
            state.skipped++;
            callback1(result, true);
            return;
          }

          state.item[field] = result.value;
          callback1(null, true);
          return;
        }
      );
    },
    function(err, result) {

      if(err) {

        callback(err);
        return;
      }

      callback({ result: 'ok', item: state.item, processed: state.processed, skipped: state.skipped });
      return;
    }
  );
}

the.getFieldsDirect = function(contractAddress, abi, fields, callback) {

  var state = { total: fields.length, processed: 0, skipped: 0, item: {} };

  libs.async.filterLimit(fields, the.parallelRequestsLimit,

    function(field, callback1) {

      if(typeof state.item[field] != 'undefined') {

        state.processed++;
        callback1(null, true);
        return;
      }

      emarket.ethereum.api.ethget(
        contractAddress, abi,
        field,
        [ ],
        emarket.defaults.ethTimeoutBlocks,
        function(result) {
    
          state.processed++;

          if(result.result != 'ok') {

            //terminate further processing of the fields - fail early
            state.skipped++;
            callback1(result, true);
            return;
          }
    
          state.item[field] = result.data.toString();
          callback1(null, true);
          return;
        }  
      );
      return;
    },
    function(err, result) {

      if(err) {

        callback(err);
        return;
      }

      callback({ result: 'ok', item: state.item, processed: state.processed, skipped: state.skipped });
      return;
    });
}

the.getFields = function(contractAddress, abi, fields, options, callback) {

  if(!options.noCaching && emarket.defaults.cachingAllow && (emarket.defaults.cachingServers.length > 0)) {

    the.getFieldsCached(contractAddress, abi, fields, function(result) {

      if(result.result != 'ok') {

        the.getFieldsDirect(contractAddress, abi, fields, callback);
        return;
      }

      callback(result);
      return;
    });
    return;
  }

  the.getFieldsDirect(contractAddress, abi, fields, callback);
  return;
}

the.getBlock = function(height, options, callback) {

  if(!options.noCaching && emarket.defaults.cachingAllow && (emarket.defaults.cachingServers.length > 0)) {

    cachedCall(the.myname + '.getBlock',
      {requestType: 'getBlock', height: height}, function(result) {

        if(result.result != 'ok') {

          emarket.ethereum.api.getBlockByNumber(height, options.fullTransactions? true: false, callback);
          return;
        }

        result.block = JSON.parse(result.block);
        callback(result);
        return;
      }
    );
    return;
  }

  //direct blockchain access
  emarket.ethereum.api.getBlockByNumber(height, options.fullTransactions? true: false, callback);
  return;
}

the.getCode = function(address, options, callback) {

  if(!options.noCaching && emarket.defaults.cachingAllow && (emarket.defaults.cachingServers.length > 0)) {

    cachedCall(the.myname + '.getCode',
      { requestType: 'getCode', address: address }, function(result) {

        if(result.result != 'ok') {

          emarket.ethereum.api.getContractCode(address, callback);
          return;
        }

        callback(result);
        return;
      }
    );
    return;
  }

  emarket.ethereum.api.getContractCode(address, callback);
  return;
}

function cachedCall(_name, request, callback) {

  var cachestate = the.newState(_name);

  var requestCopy = libs.lodash.clone(request);
  delete requestCopy.abi;
  
  cachestate.source = JSON.stringify(requestCopy);
  
  libs.async.retry({

    times: emarket.defaults.cachingRetries,
    errorFilter: function(err) {
      return err.status == 'temporary';
    }},
    function(asyncCallback, asyncResults) {

      try {

        var server = emarket.defaults.cachingServers[cachestate.current];
        var serverOptions = { form: request };

        if(emarket.defaults.proxyAllow) {
          serverOptions.proxy = emarket.defaults.hostsProxies[0];
        }
        
        libs.request.post(server, serverOptions,
          function (error, response, body) {

          if(error) {

            the.nextState(cachestate, error);        
            asyncCallback({ status: 'temporary', message: error }, null);
            return;
          }

          if(response.statusCode != 200) {

            var errString = 'error: bad status code ' + response.statusCode;
            asyncCallback({ status: 'temporary', message: errString }, null);
            return;
          };

          var cachedData = {};
          try {

            cachedData = JSON.parse(body);
          } catch(err) {
          }

          if(cachedData.result != 'ok') {

            var errString = 'Cannot parse ' + body;
            if(cachedData.result == 'error') {

              errString = cachedData.error;
              asyncCallback({ status: 'temporary', message: errString }, null);
              return;
            }

            asyncCallback({ status: 'temporary', message: errString }, null);
            return;
          }

          asyncCallback(null, cachedData);
          return;
        });
      } catch(err) {

        the.nextState(cachestate, err);
        asyncCallback({ status: 'temporary', message: err }, null);
        return;
      }
    },
    function(asyncError, asyncResults) {

      if(asyncError) {

        callback({ result: 'error', error: asyncError.message });
        return;
      }

      callback(asyncResults);
      return;
    }
  );
}

module.exports = the