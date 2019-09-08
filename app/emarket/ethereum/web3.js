var libs = {};
libs.async = require('async');
libs.web3 = require('web3');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.ethereum = {};
emarket.ethereum.httpprovider = require.main.require('./emarket/ethereum/proxyhttpprovider');

emarket.ethereum.web3 = function () {}

var the = emarket.ethereum.web3;
the.myname = 'emarket.ethereum.web3';

the.newState = function(_name) {

  var newProvider = null;
  if(emarket.defaults.proxyAllow) {

    newProvider = new emarket.ethereum.httpprovider(
      emarket.defaults.hostsProxies[0],
      emarket.defaults.ethRpcHosts[0]);
  } else {

    newProvider = new libs.web3.providers.HttpProvider(emarket.defaults.ethRpcHosts[0]);
  }

  return {
    current: 0,
    retry: 0,
    source: '',
    name: _name,
    web3: new libs.web3(newProvider)
  };
}

the.nextState = function(state, reason) {

  state.current++;
  state.retry++;
  if(state.current >= emarket.defaults.ethRpcHosts.length) state.current = 0;

  var newProvider = null;
  if(emarket.defaults.proxyAllow) {

    newProvider = new emarket.ethereum.httpprovider(
      emarket.defaults.hostsProxies[0],
      emarket.defaults.ethRpcHosts[state.current]);
  } else {

    newProvider = new libs.web3.providers.HttpProvider(emarket.defaults.ethRpcHosts[state.current]);
  }

  state.web3 = new libs.web3(newProvider);

  console.log('[' + state.name + ']' + ' Switched to new geth provider: ' + emarket.defaults.ethRpcHosts[state.current] +
              '.\r\nReason: ' + reason);
  console.log('Retry: ' + state.retry);

  if(state.source && state.source.length > 0) {
    console.log('Source: ' + state.source );
  }
  return state;
}

the.web3Retry = function(web3state, bodyCallback, okCallback, errorCallback) {

  libs.async.retry({
    times: emarket.defaults.ethRpcRetries,
    errorFilter: function(err) {
      return err.status == 'temporary';
    }},
    function(asyncCallback, asyncResults) {

      libs.async.retry({
        times: emarket.defaults.nonceDuplicateRetries,
        interval: emarket.defaults.nonceDuplicateInterval,
        errorFilter: function(err) {
          if(err.status)
            return err.status == 'nonceError';

          return false;
        }},
        function(asyncCallback1){

        try {
          bodyCallback(web3state, function(err, result) {

            if(err) {
              var msg = "" + err.message;
              if(msg.indexOf('replacement transaction underpriced') >= 0) {
                asyncCallback1({ status: 'nonceError' }, null);
                return;
              }

              if(msg.indexOf('nonce is too low') >= 0) {
                asyncCallback1({ status: 'nonceError' }, null);
                return;
              }

              asyncCallback1(err, null);
              return;
            }

            asyncCallback1(null, result);
            return;
          });
        } catch(err) {
          asyncCallback1({ status: 'temporary', message: err }, null);
          return;
        }
      },
      function(err, result) {
        if(err) {

          the.nextState(web3state, err.message);

          if(!err.status)
            err.status = 'permanent';

          var msg = "" + err.message;
          if(msg.indexOf('connect ECONNREFUSED') >= 0) {
            err.status = 'temporary';
          } else if(msg.indexOf('connect ETIMEDOUT') >= 0) {
            err.status = 'temporary';
          } else if(msg.indexOf('Invalid JSON RPC response: ""') >= 0) {
            err.status = 'temporary';
          } else if(msg.indexOf('Transaction was not mined') >= 0) {
            err.status = 'temporary';
          } else if(msg.indexOf('Failed to check for transaction') >= 0) {
            err.status = 'temporary';
          }

          asyncCallback(err, null);
          return;
        }

        asyncCallback(null, result);
        return;
      }
    );

    },
    function(asyncError, asyncResults) {

      if(asyncError) {

        errorCallback({ result: 'error', error: asyncError.message });
        return;
      }

      okCallback(asyncResults);
    }
  );
}

module.exports = the
