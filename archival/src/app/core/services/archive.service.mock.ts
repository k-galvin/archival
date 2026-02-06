import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CollectionItem, Room, UserCollection, Movement, City, GoogleBooksResponse, DiscogsResponse } from '../../shared/models/archive.models';
import { User, Session } from '@supabase/supabase-js';

export class MockArchiveService {
  collection = signal<CollectionItem[]>([]);
  rooms = signal<Room[]>([]);
  userCollections = signal<UserCollection[]>([]);
  movements = signal<Movement[]>([]);
  cities = signal<City[]>([]);
  user = signal(null);
  loading = signal(false);
  authError = signal(null);

  signUp(email: string, password: string, name: string) {
    return Promise.resolve({ user: {} as User, session: {} as Session });
  }

  signIn(email: string, password: string) {
    return Promise.resolve({ user: {} as User, session: {} as Session });
  }

  signOut() {
    return Promise.resolve();
  }

  searchBooks(query: string): Observable<GoogleBooksResponse> {
    return of({} as GoogleBooksResponse);
  }

  searchDiscogs(query: string): Observable<DiscogsResponse> {
    return of({} as DiscogsResponse);
  }

  uploadImage(file: File): Promise<string | null> {
    return Promise.resolve(null);
  }

  deleteItem(id: string) {
    return Promise.resolve();
  }

  addRoom(name: string) {
    return Promise.resolve();
  }

  deleteRoom(id: string | number) {
    return Promise.resolve();
  }

  addCollection(title: string) {
    return Promise.resolve();
  }

  deleteCollection(id: string) {
    return Promise.resolve();
  }

  removeFromCollection(colId: string, itemId: string) {
    return Promise.resolve();
  }

  addToUserCollection(colId: string, itemId: string) {
    return Promise.resolve();
  }

  addItem(item: CollectionItem): Promise<CollectionItem | null> {
    return Promise.resolve(null);
  }
}
