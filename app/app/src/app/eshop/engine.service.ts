// e-shop engine service
import { GlobalService } from './../utils/global.service';
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

interface Viewed {
  address: string,
  img: string,
  title: [string],
  price: string
}

@Injectable()
export class EshopEngine {
  constructor(
      private db: DatabaseService,
      private gs: GlobalService
  ) {
      this.db.init();
  }

  public viewed(item: Object): void {
      let toSet: Viewed = {
          address: item['address'],
          title: item['title'],
          img: item['img'],
          price: item['priceEth']
      }
      let toRemove = [];
      let viewed = this.getViewed();
      if(viewed) {
        viewed.forEach((viewedItem, index) => {
          if (viewedItem['address'] == toSet.address) {
            toRemove.push(index);
          }
        });
        toRemove.reverse();
        toRemove.forEach(remove => {
          viewed.splice(remove, 1);
        });
        viewed.push(toSet);
        this.db.setSingleValue('viewed', JSON.stringify(viewed));
      }
  }

  public getViewed(): Array<Object> {
      let result = this.db.readList('viewed');
      if(result)
      return result.slice(0, 4);
  }

  public smartSort(amount: number, address: string, tags: Array<string> = [], category: string = '', includeViewed: boolean = true): Array<Viewed> {
      let result: Array<Viewed> = [];
      let viewedMapping: Array<string> = [];
      let _viewed = this.getViewed();
      let walletaddress = JSON.parse(localStorage.getItem('auth'))['address'];

      if (includeViewed && _viewed) {
          _viewed.forEach(viewed => {
              viewedMapping.push(viewed['address'])
          })
      }
      this.gs.cached.viewAll.forEach(item => {
        if ((item.address != address) && (item.sender != walletaddress)) {
              item['priority'] = 0;
              if(tags)
                  tags.forEach((tag: string) => {
                      if(item.tags)
                          item.tags.forEach((_tag: string) => {
                              if (tag.toLowerCase() == _tag.toLowerCase()) item['priority'] += 1;
                          })
                  })
              if (item.cat[0] == category) item['priority'] += 1;
              if (includeViewed) if (viewedMapping.indexOf(item['address']) != -1) item['priority'] += 1;
              if (item.img && item.img.length) item['priority'] += 2;
              result.push(item);
          }
      })
      result = result.sort((a, b) => this.gs.sortBackwards(a, b, 'priority'));

      return result.slice(0, amount);
  }
}
