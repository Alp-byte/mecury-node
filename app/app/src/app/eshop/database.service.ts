// front-end localStorage db wrapper
import { Injectable } from '@angular/core';

interface Collection {
    name: string,
    limit?: number
}

const COLLECTION_INDEX: Array<Collection> = [
    {
        name: 'viewed',
        limit: 4
    },
    {
        name: 'bookmarks'
    }
]

@Injectable()
export class DatabaseService {
    constructor() {

    }

    init() {
        COLLECTION_INDEX.forEach(collection => {
            if (!localStorage.getItem(collection.name)) localStorage.setItem(collection.name, JSON.stringify([]))
        })
    }

    public setSingleValue(key, value): void {
        localStorage.setItem(key, value)
    }

    public readSingleValue(key): Object {
        return localStorage.getItem(key);
    }

    public createInList(collection, value) {
        let json = JSON.parse(localStorage.getItem(collection));
        json.push(value);
        localStorage.setItem(collection, JSON.stringify(json));
        this.setCollectionToLimit(collection);
    }

    public readList(collection: string, filter: { key: string, value?: string } = { key: '' }): Array<Object> {
        if (!filter.key.length) return JSON.parse(localStorage.getItem(collection));
        let result = [];
        let json = JSON.parse(localStorage.getItem(collection));
        json.forEach(_value => {
            if (_value[filter.key] = filter.value) result.push(_value);
        })
        return result;
    }

    public updateOne(collection: string, filter: { key: string, value: string }, value: Object): boolean {
        let result = {};
        let json = JSON.parse(localStorage.getItem(collection))
        json.forEach((_value, index) => {
            if (_value[filter.key] == filter.value) {
                json[index] = value;
                localStorage.setItem(collection, JSON.stringify(json))
                return true;
            }
        })
        return false;
    }

    public delete(collection, filter): void {
        let toDelete = [];
        let json = JSON.parse(localStorage.getItem(collection));
        json.forEach((_value, index) => {
            if (_value[filter.key] = filter.value) toDelete.push(index);
        })
        toDelete.forEach(index => {
            json.splice(index, 1);
        })
        localStorage.setItem(collection, JSON.stringify(json));
    }

    public drop(): void {
        localStorage.clear();
    }

    public readOne(collection: string, filter: { key: string, value: string }): Object {
        let result = {};
        let json = JSON.parse(localStorage.getItem(collection))
        json.forEach(_value => {
            if (_value[filter.key] == filter.value) {
                return _value;
            }
        })
        return false;
    }

    private getCollectionLimit(name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            COLLECTION_INDEX.forEach((collection, index) => {
                if (collection.name == name) {
                    resolve(collection.limit);
                } else if (index == COLLECTION_INDEX.length - 1) reject();
            })
        })

    }

    private setCollectionToLimit(name) {
        this.getCollectionLimit(name).then(limit => {
            let json = JSON.parse(localStorage.getItem(name));
            if (json.length > limit) {
                json.splice(0, json.length - limit);
                localStorage.setItem(name, JSON.stringify(json));
            }
        }).catch(() => {
            throw new Error(`Collection ${name} does not exist!`);
        })
    }
}