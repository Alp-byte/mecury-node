var libs = {};
libs.lodash = require('lodash');
libs.electron_settings = require('electron-settings');

var emarket_electron = {};
emarket_electron.utils = function () {}

var the = emarket_electron.utils;
the.myname = 'emarket_electron.utils';

the.saveSettings = function(settings, callback) {

  return new Promise((resolve, reject) => {
    libs.lodash.forEach(settings, function(setting) {

      console.log('setting setting', setting);
      libs.electron_settings.set(setting.key, setting.value);
    });
    resolve();
  });
}

the.getSettings = function(key, callback) {

  console.log('getSettings', key);
  return new Promise((resolve, reject) => {
    resolve(libs.electron_settings.get(key));
  });
}

the.resetSettings = function(key, callback) {
  
  console.log('resetSettings');
  return new Promise((resolve, reject) => {
    libs.electron_settings.deleteAll();
    libs.electron_settings.getAll();
    resolve(true);
  });
}


the.sendReport = function(report, callback) {
  console.log('SEND REPORT TO SERVER', report);
}

module.exports = the