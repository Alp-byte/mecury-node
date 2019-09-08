var libs = {};
libs.crypto = require('crypto');
libs.ethereumjsUtil = require('ethereumjs-util');

var emarket = {};
emarket.wallets = {};
emarket.wallets.curve25519 = require.main.require('./emarket/wallets/curve25519');

emarket.wallets.aes = function () {}

var the = emarket.wallets.aes;

//sender - sender's private key eg wallet.getCurve25519PrivateKey()
//recipient - recipient's public key eg wallet.getCurve25519PublicKey()
//message - utf8 string
the.encryptFor = function (sender, recipient, message) {

  var nonce = libs.crypto.randomBytes(32);
  var sharedkey = Buffer.from(emarket.wallets.curve25519.convertToByteArray(emarket.wallets.curve25519.create(
    emarket.wallets.curve25519.convertToShortArray(sender),
    emarket.wallets.curve25519.convertToShortArray(recipient),
    null)));

  for (var i = 0; i < 32; i++) {
    sharedkey[i] ^= nonce[i];
  }

  var sharedkeyhash = libs.ethereumjsUtil.sha256(sharedkey);
  var iv = libs.crypto.randomBytes(16);

  var encipher = libs.crypto.createCipheriv('aes-256-cbc', sharedkeyhash, iv);
  var encryptdata  = encipher.update(message, 'utf8', 'binary');

  encryptdata += encipher.final('binary');
  var encoded = Buffer.from(encryptdata, 'binary').toString('base64');

  var result = {};

  result.msg = encoded;
  result.iv = libs.ethereumjsUtil.bufferToHex(iv);
  result.cipher = 'aes-256-cbc';
  result.nonce = libs.ethereumjsUtil.bufferToHex(nonce);

  return result;
}

//sender - sender's public key eg wallet.getCurve25519PublicKey()
//recipient - recipient's private key eg wallet.getCurve25519PrivateKey()
//message - object {msg, iv, cipher, nonce}
//  msg - base64 encoded encrypted message
//  iv - hex encoded 16 random bytes
//  cipher - optional, always aes-256-cbc
//  nonce - hex encoded 32 random bytes
the.decryptFor = function (sender, recipient, message) {

  var nonce = Buffer.alloc(32);
  nonce.fill(0);
  var nonceVal = libs.ethereumjsUtil.toBuffer(message.nonce);
  nonceVal.copy(nonce, 0);

  var sharedkey = Buffer.from(emarket.wallets.curve25519.convertToByteArray(emarket.wallets.curve25519.create(
    emarket.wallets.curve25519.convertToShortArray(recipient),
    emarket.wallets.curve25519.convertToShortArray(sender),
    null)));

  for (var i = 0; i < 32; i++) {
    sharedkey[i] ^= nonce[i];
  }

  var sharedkeyhash = libs.ethereumjsUtil.sha256(sharedkey);

  var iv = Buffer.alloc(16);
  iv.fill(0);
  var ivVal = libs.ethereumjsUtil.toBuffer(message.iv);
  ivVal.copy(iv, 0);

  var processdata = Buffer.from(message.msg, 'base64').toString('binary');

  var decipher = libs.crypto.createDecipheriv('aes-256-cbc', sharedkeyhash, iv);
  var decoded  = decipher.update(processdata, 'binary', 'utf8');

  decoded += decipher.final('utf8');

  var result = {};
  result.msg = decoded;

  return result;
}

//create session key and encrypted copy for recipient
///HACK: delete unencrypted key (key.key) when sending to external source
the.createSessionKey = function (sender, recipient) {

  var keydata = libs.crypto.randomBytes(32);
  var keystr = libs.ethereumjsUtil.bufferToHex(keydata);

  var result = the.encryptFor(sender, recipient, keystr);

  var key = {};
  key.key = keystr;
  key.enc = result;

  return key;
}

//decrypt session key with recipient private key
the.readSessionKey = function (sender, recipient, key) {

  var result = the.decryptFor(sender, recipient, key.enc);
  key.key = result.msg;

  return key;
}

//encrypt text with session key
///HACK: delete unencrypted key (result.key.key) when sending to external source
the.encryptForSession = function (message, key) {

  var iv = libs.crypto.randomBytes(16);

  var encipher = libs.crypto.createCipheriv('aes-256-cbc', libs.ethereumjsUtil.toBuffer(key.key), iv);
  var encryptdata  = encipher.update(message, 'utf8', 'binary');

  encryptdata += encipher.final('binary');
  var encoded = Buffer.from(encryptdata, 'binary').toString('base64');

  var result = {};

  result.msg = encoded;
  result.iv = libs.ethereumjsUtil.bufferToHex(iv);
  result.cipher = 'aes-256-cbc';
  result.key = key;

  return result;
}

//decrypt encrypted message with session key
the.decryptForSession = function (message, key) {

  var iv = libs.ethereumjsUtil.toBuffer(message.iv);

  var processdata = Buffer.from(message.msg, 'base64').toString('binary');

  var decipher = libs.crypto.createDecipheriv('aes-256-cbc', libs.ethereumjsUtil.toBuffer(key.key), iv);
  var decoded  = decipher.update(processdata, 'binary', 'utf8');

  decoded += decipher.final('utf8');

  var result = {};

  result.msg = decoded;
  result.key = key;

  return result;
}

module.exports = the