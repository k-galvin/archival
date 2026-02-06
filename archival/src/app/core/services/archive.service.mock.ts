import { signal } from '@angular/core';
import { of } from 'rxjs';

export class MockArchiveService {
  collection = signal([]);
  rooms = signal([]);
  userCollections = signal([]);
  movements = signal([]);
  cities = signal([]);
  user = signal(null);
  loading = signal(false);
  authError = signal(null);

  signUp() {
    return Promise.resolve({} as object);
  }

  signIn() {
    return Promise.resolve({} as object);
  }

  signOut() {
    return Promise.resolve();
  }

  searchBooks() {
    return of({} as object);
  }

  searchDiscogs() {
    return of({} as object);
  }

  uploadImage() {
    return Promise.resolve(null);
  }

  deleteItem() {
    return Promise.resolve();
  }

  addRoom() {
    return Promise.resolve();
  }

  deleteRoom() {
    return Promise.resolve();
  }

  addCollection() {
    return Promise.resolve();
  }

  deleteCollection() {
    return Promise.resolve();
  }

  removeFromCollection() {
    return Promise.resolve();
  }

  addToUserCollection() {
    return Promise.resolve();
  }

  addItem() {
    return Promise.resolve(null);
  }
}
