// allows absolute paths in 'require'
//require('module-alias/register');

var libs = {};
libs.path = require('path');
libs.electron = require('electron');
libs.notifier = require('node-notifier');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.store = require.main.require('./emarket/store');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');
emarket.db.dbmigrate = require.main.require('./emarket/db/dbmigrate');
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.transactionLog = require.main.require('./emarket/db/transactionLog');
emarket.db.stores = require.main.require('./emarket/db/stores');

var emarket_electron = {};
emarket_electron.transactions = require.main.require('./emarket_electron/transactions');
emarket_electron.fe_config = require.main.require('./emarket_electron/fe_config');

const marketbindings = require('./marketbindings');
const appbindings = require('./appbindings');


//TODO: move out into another module to not spoil the index.js, run on the window.create

const IPFSFactory = require('ipfsd-ctl')

const f = IPFSFactory.create({ remote: false })

f.spawn({ defaultAddrs: true }, function (err, ipfsd) {
  if (err) { throw err }

  // console.log('ipfsFactory create spawn: ', ipfsd)

  ipfsd.api.id(function (err, id) {
    if (err) { throw err }

    console.log('IPFSD.api.id success: ', id)
    // ipfsd.stop()
  })
})


// Module to control application life.

const electronApp = libs.electron.app
var Menu = libs.electron.Menu;

// Module to create native browser window.
const BrowserWindow = libs.electron.BrowserWindow
var fs = require('fs');
var mainWindow = {};
var ipc = libs.electron.ipcMain;

//for running 2 accounts
let arg = process.argv[2];
if (!arg) arg = process.argv[1];
let suffix = '-' + arg;
if (!arg || (arg != 'first' && arg != 'second')) suffix = '';
var dbName = libs.path.join(electronApp.getPath('documents'), 'bitboost.sqlite');
if (emarket.defaults.isTestnet) dbName = libs.path.join(electronApp.getPath('documents'), 'bitboost-testnet' + suffix + '.sqlite');

var keyStorePath = global['keyStorePath'] = libs.path.join(electronApp.getPath('documents'), 'bitboost_keystore' + suffix + '');
var loggingPath = libs.path.join(electronApp.getPath('documents'), 'bitboost_logging.txt');

var initialSyncDone = false;

marketbindings.keyStorePath = keyStorePath;


var thisSessionContent = ``;
appbindings.log = (info, type = null, result = null) => {


  if (info.requestType != 'getBalance' && info.requestType != 'allListings') {
    console.log(info);
    // let rn = new Date();
    let infoToWrite = "";
    if (result) {
      infoToWrite += type + " on " + info['requestType'] + ": " + JSON.stringify(result) + `
`;
    } else {
      infoToWrite += type + ": " + JSON.stringify(info) + `
`;
    }
    thisSessionContent += infoToWrite;
    fs.writeFile(loggingPath, thisSessionContent, (err) => {
      if (err) {
        console.log("An error ocurred creating the logging file " + err.message)
      }

      console.log("The logging file has been succesfully saved");
    });
  }
};

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1300, height: 726, minWidth: 1245, webPreferences: { nodeIntegrationInWorker: false, nodeIntegration: true, scrollBounce: true } })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/app/dist/index.html`)

  // Open the DevTools if running in dev mode (with 'first' or 'second' suffix)
  if (suffix.length) {
    mainWindow.webContents.openDevTools();
    // var electornDebug = require('electron-debug')()
  }


  ipc.on('reload', (event, args) => {
    libs.electron.getCurrentWindow().reload();
  })

  ipc.on('changelly', (event, args) => {
    openChangelly(args.address);
  })

  ipc.on('api', (event, args) => {
    appbindings.log(args, 'REQUEST'); //shows request sent from FE in exact format we send it
    var actionId = Date.now();
    emarket_electron.transactions.addTransaction(args, actionId);


    var apiCall = marketbindings.api[args.requestType];
    if (!apiCall) apiCall = appbindings.api[args.requestType];
    if (apiCall) {

      if (!args.options) args.options = {};

      apiCall(args, function (result) {

        appbindings.log(args, 'RESULT', result); //shows result of apiCall callback, includes args.requestType for recognition, CUTS OUT viewALL and getBalance

        if (args.id)
          event.sender.send(args.id, JSON.stringify(result));
        else
          event.sender.send(args.requestType, JSON.stringify(result));

        emarket_electron.transactions.updateTransaction(result, args, actionId);
      });
    } else {
      console.error('SOMEHOW THERE IS NO APICALL!!!', args, marketbindings.api[args.requestType]);
      event.sender.send(args.requestType, 'ERROR');
    }

  });




  ipc.on('syncStore', (event, args) => {
    if (!initialSyncDone)
      initialSync(event);
    else syncStore(event);
  })

  ipc.on('syncStoreIPFS', (event, args) => {
    syncStoreIpfs(event);
  })

  ipc.on('message', (event, args) => {
    libs.notifier.notify({
      'title': 'The App: New Message',
      'message': args['message']
    });
  })


  const { dialog } = require('electron');

  function openChangelly(address) {

    let changelly = new BrowserWindow({ width: 800, height: 526, webPreferences: { webSecurity: false, preload: 'preload.js', nodeIntegrationInWorker: false, nodeIntegration: false } })

    changelly.loadURL('https://changelly.com/widget/v1?auth=email&from=USD&to=ETH&merchant_id=31f51620dd07&address=' + address + '&amount=100&ref_id=31f51620dd07&color=efac40');
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  // Create the Application's main menu
  var template = [
    {
      label: "Application",
      submenu: [
        { label: "About The App", selector: "orderFrontStandardAboutPanel:", },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function () { electronApp.quit(); } }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
        { type: 'separator' },
        { label: "Exit", role: 'quit' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electronApp.on('ready', createWindow)

// Quit when all windows are closed.
electronApp.on('window-all-closed', function () {

  console.log('Stopping database');
  emarket.db.db.close();

  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    console.log("createWindow");
    createWindow()
  }
})

function initialSync(event) {
  console.log('initalSync started');
  marketbindings.emarketSyncFeedBBT({ options: {} }, function (resultF) {
    console.log("syncFeedBBT done");

    marketbindings.emarketSyncStore({ options: {} }, () => {
      console.log('synced the whole store');

      //TODO: make it right by doing initial purchases sync only at the start of the app and then sync purchases by escrows and addresses
      // marketbindings.emarketSyncInitialPurchases({ options: {} }, function (result2) {
      // console.log("syncInitialPurchases done");
      marketbindings.emarketIpfsStoreSync({ options: {} }, (syncResult) => {
        console.log('IPFS storesync result', syncResult);
        emarket.db.transactionLog.getLastUnfinished(unfinished => {
          console.log('TRANZACTIONS: getLastUnfinished result', unfinished);
          if (unfinished && unfinished.items && unfinished.items.length) {
            console.log('TRANZACTIONS: getLastUnfinished result passed first');
            emarket.db.events.selectWithTimestamp(unfinished.items[0].timestamp/1000-15, (res) => {
              console.log('TRANZACTIONS: selectWithTimestamp result', res);

              if (res && res.items && res.items.length) {
                unfinished.items[0].status = 'TRANSACTION_SUCCESS';
                unfinished.items[0].hash = 'TRANSACTION_SUCCESS_NO_HASH';
                emarket.db.transactionLog.insert(unfinished.items[0], () => { console.log('unfinished transaction appeared to be successful, updated the status'); })
              } else {
                unfinished.items[0].status = 'TRANSACTION_NEUTRAL';
                unfinished.items[0].hash = 'TRANSACTION_ERROR_NOT_FOUND';
                emarket.db.transactionLog.insert(unfinished.items[0], () => { console.log('unfinished transaction not found, updated the status'); })
              }
            })
          }
        })
        console.log('synced the whole store (initialSync)');
        initialSyncDone = true;
        event.sender.send('syncStore', JSON.stringify({ result: 'ok', type: 'viewall' }));
        // setTimeout(() => syncStore(event), 60000);
        // });
      })
    }, (intermediateResult) => {

      ///TODO: syncEventsStep event does not have 'title' field.

      if ((intermediateResult.source == 'emarket.store.sync') &&
        (intermediateResult.type == 'syncEventsStep')) {

        if (intermediateResult['item']) {
          // event.sender.send('syncStore', JSON.stringify({ result: 'intermediateResult', data: { address: intermediateResult['item']['address'], title: intermediateResult['item']['title'] } }));
        } else {
          // event.sender.send('syncStore', JSON.stringify({ result: 'intermediateResult', data: intermediateResult }));
        }
      }
    });
  });
}

function syncStore(event) {
  //TODO: get errors and successes from here, emit to FE each time
  marketbindings.emarketSyncStore({ options: {} }, () => {
    console.log('synced the whole store');
    // setTimeout(() => syncStore(event), 60000);
    event.sender.send('syncStore', JSON.stringify({ result: 'ok', type: 'viewall' }));
  })

}

function syncStoreIpfs(event) {
  console.log('syncStoreIpfs started');
  marketbindings.emarketIpfsStoreSync({ options: {} }, (syncResult) => {
    console.log('IPFS storesync result', syncResult);
    // setTimeout(() => syncStoreIpfs(event), 60000);
    event.sender.send('syncStoreIPFS', JSON.stringify({ result: 'ok', type: 'storeIpfs', syncResult: syncResult }))
  });
}


emarket.db.dbmigrate.open(dbName, function (result) {
  console.log('Database ready.');
});

