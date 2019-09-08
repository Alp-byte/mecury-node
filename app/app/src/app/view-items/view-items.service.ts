import { Injectable } from '@angular/core';
import { GlobalService, CATEGORIES } from '../utils/global.service';
import { environment } from '../../environments/environment';
import { Observable } from '../../../node_modules/rxjs';
import { Http } from '@angular/http';

const TIMESTAMP = 1520508133; //filtering out old items

export interface Category {
  goods: number;
  code: string;
}

const API = 'http://localhost:1337/api';

declare var ipc: any;

@Injectable()

export class ViewItemsService {

  public isElectron: boolean = true;
  private ipcRenderer = ipc;

  public publicCategories: Category[] = [];

  private actionInProgress: boolean = false;


  constructor(
    private http: Http,
    private globalService: GlobalService,
  ) {

  }

  public getPublicCategories(): Array<Category> {
    return this.publicCategories;
  }

  viewAll(loader = true): Promise<{ result: string, items: any }> {
//    if (loader) this.globalService.(true);
    let callName = 'allListings';
    let args = { "requestType": callName };

    return new Promise((resolve, reject) => {
      if (this.isElectron) {
        this.ipcRenderer.send('api', args)
        this.ipcRenderer.once(callName, (event, arg) => {
          let res = JSON.parse(arg);
          return resolve(res);

        })
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          return resolve(res);
        })
      }

    });
  }

  viewAllIPFSListings(loader = true): Promise<{ result: string, items: any }> {
//    if (loader) this.globalService.(true);
    let callName = 'ipfsStoreAllListings';
    let args = { "requestType": callName };

    return new Promise((resolve, reject) => {
      let ipfsPreference = this.globalService.ipfsPreference.value;
      if (this.isElectron) {
        if (ipfsPreference) {
          this.ipcRenderer.send('api', args)
          this.ipcRenderer.once(callName, (event, arg) => {
            let res = JSON.parse(arg);
            console.log('IPFS items inside', res);
            return resolve(res);
          })
        }
        else {
          return resolve({ result: 'ok', items: [] });
        }
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          return resolve(res);
        })
      }

    });
  }

  getAllListings(loader: any = false) {
    let res = { result: 'ok', items: [] };
    return new Observable((observer) => {
      this.viewAll(loader)
        .then(allItems => {
          console.log('got all ETH', allItems);
          allItems && allItems.items.forEach((item, itemI) => {
            item._address = item.address;
          })
          res.items.push(...allItems.items);
          return this.viewAllIPFSListings(loader)
            .then(IPFSItems => {
              console.log('got all IPFS', IPFSItems);

              //TODO confirm with Andrew that this is OK
              IPFSItems.items.forEach((item, itemI) => {
                item._address = item.hashIpfs;
              })
              res.items.push(...IPFSItems.items);
            })
            .then(() => {
              this.viewAllProcess(res, observer, loader)
            })
        });
    })
  }

  getListingByIpfsHash(hashIpfs: string) {
    return new Observable(observer => {
      this.globalService.cached.viewAll.forEach(item => {
        if (item.hashIpfs == hashIpfs) observer.next(item)
      })
    })

  }

  viewAllProcess(res, observer, loader) {
//    if (loader) this.globalService.(false);
    let items = [];
    let now = Date.now() / 1000;
    if (res['error']) observer.error(res['error']['code']);
    this.publicCategories.forEach(cat => cat.goods = 0)
    res['items'] && res['items'].forEach((item, i) => {


      if (item.timestamp > TIMESTAMP) {
        if (!item.priceEth) item.priceEth = this.globalService.toEth(item.price);
        if (item.pendingCount >= item.availableCount)
          item.pending = true;
        if (item.endTimestamp > now && item.availableCount > 0) {
          let itemCat = item['cat'][0];

          //categories hack from the bulk upload
          if (itemCat == 'TOYS AND HOBBIES') {
            itemCat = 'TOY';
            item['cat'][0] = 'TOY';
          }

          if (itemCat == 'Blockbuster' || itemCat == 'DVDs and Movies') {
            itemCat = 'UNCATEGORISED';
            item['cat'][0] = 'UNCATEGORISED';
          }

          if (CATEGORIES.indexOf(itemCat) == -1) {
            itemCat = 'UNCATEGORISED';
            item['cat'][0] = 'UNCATEGORISED';
          }


          let catFound: boolean = false;
          if (item.status != 2) {
            this.publicCategories.forEach(cat => {
              if (cat.code == itemCat) {
                cat.goods = cat.goods + 1;
                catFound = true;
              }
            })
            if (!catFound) {
              this.publicCategories.push({
                code: itemCat,
                goods: 1
              });
            }
          }

          if (item.status != 2) {
            items.push(item);
          }
        }
      }

      if (i == res['items'].length - 1) {
        items = items.sort((a: any, b: any) => {
          return this.globalService.sortBackwards(a, b, 'timestamp');
        });

        res['items'] = items;

        this.publicCategories.sort((a, b) => {
          if (a.goods > b.goods) return -1;
          else if (a.goods < b.goods) return 1;
          else return 0;
        })

        console.log('viewall result', res);

        observer.next(res);
      }
    })

  }

  geStoreName(address) {
    let callName = 'getOwnStoreName';
    let args = { "requestType": callName, "wallet": address };
    return new Observable((observer) => {
      if (this.isElectron) {
        this.ipcRenderer.send('api', args)
        this.ipcRenderer.once(callName, (event, arg) => {
          let res = JSON.parse(arg);
          observer.next(res);
        })
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          observer.next(res)
        })
      }
    });
  }

  viewAllStoreName(loader = true) {
    let res = {result: 'ok', items: []};
    return new Observable((observer) => {
      this.viewAllBlockStoreName(loader)
        .then(allItems => {
          console.log('got all ETH', allItems);
          res.items.push(...allItems.items);
          return this.viewAllIPFSStorenames(loader)
            .then(IPFSItems => {
              console.log('got all IPFS', IPFSItems);
              res.items.push(...IPFSItems.items);
            })
            .then(() => {
              observer.next(res);
            })
        });
    })
  }

  viewAllBlockStoreName(loader = true): Promise<{ result: string, items: any }> {
//    if (loader) this.globalService.(true);
    let callName = 'getAllStoreName';
    let args = {"requestType": callName};

    return new Promise((resolve, reject) => {
      if (this.isElectron) {
        this.ipcRenderer.send('api', args)
        this.ipcRenderer.once(callName, (event, arg) => {
          let res = JSON.parse(arg);
          return resolve(res);

        })
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          return resolve(res);
        })
      }

    });
  }

  viewAllIPFSStorenames(loader = true): Promise<{ result: string, items: any }> {
//    if (loader) this.globalService.(true);
    let callName = 'getAllIPFSStoreName';
    let args = {"requestType": callName};

    return new Promise((resolve, reject) => {
      let ipfsPreference = this.globalService.ipfsPreference.value;
      if (this.isElectron) {
        if(ipfsPreference) {
          this.ipcRenderer.send('api', args)
          this.ipcRenderer.once(callName, (event, arg) => {
            let res = JSON.parse(arg);
            console.log('IPFS items inside', res);
            return resolve(res);
          })
        }
        else {
          return resolve({result: 'ok', items: []});
        }
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          return resolve(res);
        })
      }

    });
  }

  viewAllSelectedStoresItem(store, loader = true) {
    let res = {result: 'ok', items: []};
    return new Observable((observer) => {
      this.viewAllBlockSelectedStoresItem(store, loader)
        .then(allItems => {
          console.log('got all ETH', allItems);
          res.items.push(...allItems.items);
          return this.viewAllIPFSSelectedStoresItem(store, loader)
            .then(IPFSItems => {
              if(IPFSItems.items.length != 0){
                console.log('got all IPFS', IPFSItems);
                res.items.push(...IPFSItems.items);
              }
            })
            .then(() => {
              this.viewAllProcessStores(res, observer, loader)
            })
        });
    })
  }

  viewAllBlockSelectedStoresItem(store, loader = true): Promise<{ result: string, items: any }> {
//    if (loader) this.globalService.(true);
    let callName = 'getSelectedItemStore';
    let args = {"requestType": callName, "storename": store};

    return new Promise((resolve, reject) => {
      if (this.isElectron) {
        this.ipcRenderer.send('api', args)
        this.ipcRenderer.once(callName, (event, arg) => {
          let res = JSON.parse(arg);

          if(res.result == 'error'){
            return resolve({result: 'ok', items: []});
          }
          else{
            return resolve(res);
          }
        })
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          return resolve(res);
        })
      }
    });
  }

  viewAllIPFSSelectedStoresItem(store, loader = true): Promise<{ result: string, items: any }> {
//    if (loader) this.globalService.(true);
    let callName = 'getIPFSSelectedItemStore';
    let args = {"requestType": callName, "storename": store};

    return new Promise((resolve, reject) => {
      let ipfsPreference = this.globalService.ipfsPreference.value;
      if (this.isElectron) {
        if(ipfsPreference) {
          this.ipcRenderer.send('api', args)
          this.ipcRenderer.once(callName, (event, arg) => {
            let res = JSON.parse(arg);

            if(res.result == 'error'){
              return resolve({result: 'ok', items: []});
            }
            else{
              console.log('IPFS items inside', res);
              return resolve(res);
            }
          })
        }
        else {
          return resolve({result: 'ok', items: []});
        }
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          return resolve(res);
        })
      }

    });
  }

    viewAllProcessStores(res, observer, loader) {
//      if (loader) this.globalService.(false);
      let items = [];
      let now = Date.now() / 1000;
      if (res['error']) observer.error(res['error']['code']);
      this.publicCategories.forEach(cat => cat.goods = 0)
      res['items'] && res['items'].forEach((item, i) => {
        if (item.timestamp > TIMESTAMP) {
          if (!item.priceEth) item.priceEth = this.globalService.toEth(item.price);
          if (item.pendingCount >= item.availableCount)
            item.pending = true;
          if (item.endTimestamp > now && item.availableCount > 0) {
            let itemCat = item['cat'][0];

            //categories hack from the bulk upload
            if (itemCat == 'TOYS AND HOBBIES') {
              itemCat = 'TOY';
              item['cat'][0] = 'TOY';
            }

            if (itemCat == 'Blockbuster' || itemCat == 'DVDs and Movies') {
              itemCat = 'UNCATEGORISED';
              item['cat'][0] = 'UNCATEGORISED';
            }

            if (CATEGORIES.indexOf(itemCat) == -1) {
              itemCat = 'UNCATEGORISED';
              item['cat'][0] = 'UNCATEGORISED';
            }


            let catFound: boolean = false;
            if (item.status != 2 && item.newStoreName !='') {
              this.publicCategories.forEach(cat => {
                if (cat.code == itemCat) {
                  cat.goods = cat.goods + 1;
                  catFound = true;
                }
              })
              if (!catFound) {
                this.publicCategories.push({
                  code: itemCat,
                  goods: 1
                });
              }
            }

            if (item.status != 2 && item.newStoreName !='') {
              items.push(item);
            }
          }
        }

        if (i == res['items'].length - 1) {
          items = items.sort((a: any, b: any) => {
            return this.globalService.sortBackwards(a, b, 'timestamp');
          });

          res['items'] = items;

          this.publicCategories.sort((a, b) => {
            if (a.goods > b.goods) return -1;
            else if (a.goods < b.goods) return 1;
            else return 0;
          })

          console.log('viewall-Stores result', res);

          observer.next(res);
        }
      })
    }

  singleItem(id) {
//    this.globalService.big(true);
    let callName = 'getItem';
    let args = { "requestType": callName, "address": id };
    return new Observable((observer) => {
      if (this.isElectron) {
        this.ipcRenderer.send('api', args)
        this.ipcRenderer.once(callName, (event, arg) => {
          let res = JSON.parse(arg);
          this.singleItemProcess(res, observer);
          // observer.next(res1);
        })
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          this.singleItemProcess(res, observer);
        })
      }
    });
  }

  singleItemProcess(res, observer) {

    let item = res['item'];
    if (res['result'] == 'ok' && res['item']) {

      let itemCat = item['cat'][0];
      let catFound: boolean = false;
      this.publicCategories.forEach(cat => {
        if (cat.code == itemCat) {
          cat.goods = cat.goods + 1;
          catFound = true;
        }
      })
      if (!catFound) {
        this.publicCategories.push({
          code: itemCat,
          goods: 1
        });
      }
    }
//    this.globalService.big(false);
    observer.next(res);
  }

  buyItem(goods, count, payment, privateMessage, item) {
    let ipfsPreference = this.globalService.ipfsPreference.value;
    let callName = 'buyItem';
    if (ipfsPreference && item.hashIpfs && item.hashIpfs.length) {
      callName = 'ipfsStoreBuy';
      let temp = localStorage.getItem(this.globalService.wallet.address + '_ipfsPurchasesHashes');
      let ipfsPurchases = [];
      try {
        if (temp) ipfsPurchases = JSON.parse(temp);
      } catch (e) {

      }



        let i = ipfsPurchases.findIndex(item => item.hashIpfs == goods.hashIpfs);
      if (i == -1) {
        ipfsPurchases.push(goods.hashIpfs);
        localStorage.setItem(this.globalService.wallet.address + '_ipfsPurchasesHashes', JSON.stringify(ipfsPurchases))
      }



    }
    console.log('going to buy with item: ', goods);
    let args = { "requestType": callName, goods: goods, count: count, payment: payment, privateMessage: privateMessage };

    return new Observable((observer) => {
      let actionId = this.globalService.createAction_({
        text: 'Order placing on ',
        item: item.title,
        status: 'COMMON.RESPONSE_NOT_FOUND',
        code: 'buyitem'
      })
      if (this.actionInProgress) {
        this.globalService.removeAction.emit({
          id: actionId,
          status: 'error',
          code: 'buyitem',
          data: { result: "error", error: "Another action in progress" }
        })
        observer.next({ result: 'error', message: 'Another action is progress.' });
        observer.complete();
        return;
      } else this.actionInProgress = true;
      if (this.isElectron) {
        this.ipcRenderer.send('api', args)
        this.ipcRenderer.once(callName, (event, arg) => {
          this.actionInProgress = false;
          let res = JSON.parse(arg);
          if (res.result == 'ok')
            this.globalService.removeAction.emit({
              id: actionId,
              status: 'processing',
              code: 'buyitem',
              data: res,
              itemObj: item
            })
          else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'buyitem', data: res })

          observer.next(res);

        })
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          this.actionInProgress = false;
          if (res.result == 'ok')
            this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'buyitem', data: res })
          else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'buyitem', data: res })

          observer.next(res);
        })
      }
    });
  }

  cancelItem(address, item: any = false) {

//    this.globalService.big(true);
    let callName = 'cancelItem';

    let actionId = this.globalService.createAction_({
      text: 'Cancelling ',
      item: item.title,
      status: 'COMMON.RESPONSE_NOT_FOUND',
      code: 'cancelitem'
    })

    let args = { "requestType": callName, goods: item };

    return new Observable((observer) => {
      if (this.actionInProgress) {
        this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'cancelitem', data: { result: "error", error: "Another action in progress" } })
        observer.next({ result: 'error', message: 'Another action is progress.' }); observer.complete(); return;
      } else this.actionInProgress = true;
      if (this.isElectron) {
        this.ipcRenderer.send('api', args)
        this.ipcRenderer.once(callName, (event, arg) => {
          this.actionInProgress = false;
          let res = JSON.parse(arg);
          if (res.result == 'ok') {
            this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'cancelitem', data: res })
          }
          else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'cancelitem', data: res })

          observer.next(res);

        })
      } else {
        this.http.post(API, args).map(res => res.json()).subscribe(res => {
          this.actionInProgress = false;
          if (res.result == 'ok')
            this.globalService.removeAction.emit({ id: actionId, status: 'processing', code: 'cancelitem', data: res })
          else this.globalService.removeAction.emit({ id: actionId, status: 'error', code: 'cancelitem', data: res })

          observer.next(res);
        })
      }
    });
  }
}
