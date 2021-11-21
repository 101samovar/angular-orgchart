import { Injectable } from '@angular/core';
import { OrgItem } from './_models/OrgItem';

@Injectable({
  providedIn: 'root'
})
export class RepoService {
  DB: Promise<IDBDatabase>;
  DB_NAME = 'org-data';
  DB_VERSION = 2;
  STORAGE_NAME = 'data';

  constructor() {
    this.DB = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore(this.STORAGE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('root', 'root', {unique: false});
      };
    });
   }

  getItem(id: number): Promise<OrgItem> {
    const result: Promise<OrgItem> = new Promise((resolve, reject) => {
      this.DB.then(db => {
        const transaction = db.transaction(this.STORAGE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORAGE_NAME);
        const request = store.get(id);
        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    });
    return result;
  }

  getList(root: number): Promise<OrgItem[]> {
    const result: Promise<OrgItem[]> = new Promise((resolve, reject) => {
      this.DB.then(db => {
        const transaction = db.transaction(this.STORAGE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORAGE_NAME);
        const range = IDBKeyRange.only(root);
        const index = store.index('root');
        const request = index.getAll(range);
        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    });
    return result;
  }

  add(item: OrgItem): Promise<number> {
    const result: Promise<number> = new Promise((resolve, reject) => {
      this.DB.then(db => {
        const transaction = db.transaction(this.STORAGE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORAGE_NAME);
        const request = store.add(item);
        request.onsuccess = () => {
          resolve(Number(request.result));
        }
      });
    });
    return result;
  }

  update(item: OrgItem) {
    const result = new Promise((resolve, reject) => {
      this.DB.then(db => {
        const transaction = db.transaction(this.STORAGE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORAGE_NAME);
        const request = store.put(item);
        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    });
    return result;
  }

  delete(id: number) {
    const result = new Promise((resolve, reject) => {
      this.DB.then(db => {
        const transaction = db.transaction(this.STORAGE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORAGE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => {
          resolve(request.result);
        }
      });
    });
    return result;
  }
}
