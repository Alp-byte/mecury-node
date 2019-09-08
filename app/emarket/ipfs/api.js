var libs = {};

///HACK: use non-official version to add timeouts to fetch data
libs.ipfsApi = require('ipfs-api-with-timeouts');

var emarket = {}
emarket.ipfs = {};

emarket.defaults = require.main.require('./emarket/defaults');

emarket.ipfs.api = function () {}

var the = emarket.ipfs.api;
the.myname = 'emarket.ipfs.api';

the.ipfsConfig = {
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  timeout: 10 * 1000
};

the.add = function(options, item, callback) {

  var ipfs = libs.ipfsApi(the.ipfsConfig);

  ipfs.object.put(Buffer.from(JSON.stringify(item)), {}, function(err, result) {

    if(err) {

      callback({ result: 'error', error: err.message });
      return;
    }

    var hash = result.toJSON().multihash;
    callback({ result: 'ok', hash: hash });
    return;
  });
}

the.get = function(options, hash, callback) {

  var ipfs = libs.ipfsApi(the.ipfsConfig);

  ipfs.object.get(hash, {}, function(err, result) {

    if(err) {

      callback({ result: 'error', error: err.message });
      return;
    }

    var data = result.toJSON().data.toString();
    var dataObject = {};

    try {
      dataObject = JSON.parse(data);
    } catch(e) {

      callback({ result: 'error', error: ('Could not parse JSON data: "' + data + '"') });
      return;
    }

    callback({ result: 'ok', item: dataObject });
    return;
  });
}

//check if IPFS daemon is running
the.isDaemonActive = function(callback) {

  var ipfs = libs.ipfsApi(the.ipfsConfig);

  ipfs.version(function(err, result) {

    if(err) {

      callback({ result: 'ok', running: false });
      return;
    }

    callback({ result: 'ok', running: true });
    return;
  });
}

module.exports = the
