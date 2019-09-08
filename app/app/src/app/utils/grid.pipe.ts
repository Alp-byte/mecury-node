import {Pipe} from "@angular/core";
import * as _ from 'underscore';
import * as objectPath from 'object-path';
export interface OrderGrid {
    name: string;
    desc?: boolean;
}



@Pipe({
    name: 'gridPipe'
})
export class GridPipe{
    constructor(
    ){}
    private currentSort = 'created';
    transform(value, [filter = {}, order = <OrderGrid>{}, changeState = true, currentLength = 0]) {
        let $this = this;
        if(value)
        {   
            value.sort((a: any,b: any)=>{
                if (order.desc = true)
                    return $this.sortBackwards(a,b,order.name);
                else
                    return $this.sort(a,b,order.name);
            });
            let modified = [];
            if (value.filter) { 
                modified = value.filter(val => {
                    return $this.filter(val, filter);
                })
            } else {
                modified = value;
            }
            currentLength = modified.length;
            return modified; 
        }
        else {
            return value;
        }
    }

    sort(a,b,compareField){        
        if (objectPath.get(a,compareField) < objectPath.get(b,compareField))
            return -1;
        if (objectPath.get(a,compareField) > objectPath.get(b,compareField))
            return 1;
        return 0;
    }
    sortBackwards(a,b,compareField){        
        if (objectPath.get(a,compareField) < objectPath.get(b,compareField))
            return 1;
        if (objectPath.get(a,compareField) > objectPath.get(b,compareField))
            return -1;
        return 0;
    }
    filter(val: any, filter: any){
        if (filter.search) {
            let search = filter.search;
        }
        let letHimIn = true;
        _.each(filter, (filter, index) => {
            _.each(filter, (filterValue, type) => {
                if(objectPath.get(val, index)!=type) {
                    letHimIn = false;
                }
            })
        })
        return letHimIn;
    }

}