var libs = {};
libs.fs = require('fs');
libs.lodash = require('lodash');

var emarket = {};
emarket.wallets = {};
emarket.wallets.myetherwallet = require.main.require('./emarket/wallets/myetherwallet');

emarket.wallets.wallets = function () { }

var the = emarket.wallets.wallets;

the.currentWallet = {};

the.listWallets = function (keystorepath, callback) {
  console.log('called listWallets');
  var wallets = [];
  libs.fs.readdir(keystorepath, function (err, files) {

    if (err) {

      console.log('error reading keystore: ' + err);
      callback({ result: 'error', error: err });
      return;
    }

    // check for empty wallets
    if(!files || (files.length == 0)) {

      callback({ result: 'ok', wallets: wallets });
      return;
    }

    // prepare a callback to call after all items are processed
    var afterCallback = libs.lodash.after(files.length, function() {

      wallets.sort(function (a, b) { return (a.index - b.index); });
      callback({ result: 'ok', wallets: wallets });
    });

    libs.lodash.forEach(files, function(fileValue) {

      var filename = keystorepath + '/' + fileValue;
      var stats = libs.fs.statSync(filename);
      if (stats.isDirectory()) {
        afterCallback();
        return true;
      }

      libs.fs.readFile(filename, function (err2, data) {

        if (err2) {

          console.log('error reading file: ' + err2);
        } else {

          try {

            var dataobject = JSON.parse(data);
            if (dataobject.index !== undefined) {

              var wallet = {};
              var index = parseInt(dataobject.index);

              wallet.filename = filename;
              wallet.content = dataobject;
              wallet.index = index;
              wallets.push(wallet);
            }
          } catch (err) {
          }
        }

        afterCallback();
      });
    });
  });
}

the.createWallet = function (keystorepath, index, password, callback) {

  //new wallet
  var wallet = emarket.wallets.myetherwallet.generate(false);
  var opts = {
    kdf: 'pbkdf2',
    c: 10000
  }

  var walletInfo = wallet.toV3(password, opts);
  walletInfo.privkey = wallet.getPrivateKeyString();
  walletInfo.index = index;
  walletInfo.address = wallet.getAddressString();

  //save to keystore
  var walletFile = walletInfo;
  delete walletFile.privkey;

  libs.fs.stat(keystorepath, function (err, stats) {

    console.log(err, stats);
    if (err && (err['code'] == 'ENOENT')) {

      libs.fs.mkdir(keystorepath, function (err) {

        console.log('folder made', err);
        libs.fs.writeFile(keystorepath + '/' + walletFile.id + '.txt', JSON.stringify(walletFile), function (err) {

          if (err) {

            console.log('error writing keystore: ' + err);
            callback({ result: 'error', error: err });
            return;
          } else {

            console.log('wallet creation success');
            callback({ result: 'ok', wallet: walletInfo });
            return;
          }
        });

        return;
      });

      return;
    }

    libs.fs.writeFile(keystorepath + '/' + walletFile.id + '.txt', JSON.stringify(walletFile), function (err) {

      if (err) {

        console.log('error writing keystore: ' + err);
        callback({ result: 'error', error: err });
        return;
      } else {

        console.log('wallet creation success');
        callback({ result: 'ok', wallet: walletInfo });
        return;
      }
    });

    return;
  });

}

the.useWallet = function (keystorepath, index, password, callback) {

  the.listWallets(keystorepath, function (result) {

    //look for a wallet with desired index
    var wallets = result.wallets;

    var matchIndex = libs.lodash.findIndex(wallets,
      
      function(item) { return item.index == index; }
    );

    if(matchIndex < 0) {

      callback({ result: 'error', error: 'index not found' });
      return;
    }

    wallet = wallets[matchIndex].content;
    wallet.index = matchIndex;

    var privateWallet = {};
    try {

      ///HACK: compatibility with wallet formats
      if (wallet.Crypto !== undefined) {
        wallet.crypto = wallet.Crypto;
      }
      privateWallet = emarket.wallets.myetherwallet.fromV3(wallet, password, true);
    } catch (err) {

      callback({ result: 'error', error: 'Wallet use error: ' + err });
      return;
    }

    the.currentWallet = privateWallet;
    callback({ result: 'ok', wallet: privateWallet });
    return;
  });
}

the.checkWallet = function (keystorepath, callback) {

  try {

    libs.fs.accessSync(keystorepath, libs.fs.F_OK);

    var p1 = new Promise((resolve, reject) => {

      the.listWallets(keystorepath, resolve);
    }).then(res => {

      console.log('res', res);
      if (res.result != 'ok') {
        callback(res);
        return;
      }

      if (res.wallets && res.wallets.length > 0) {

        callback({ result: 'ok', haveWallet: true });
        return;
      }

      callback({ result: 'ok', haveWallet: false });
      return;
    });
  } catch (e) {

    callback({ result: 'ok', haveWallet: false });
    return;
  }
}

module.exports = the