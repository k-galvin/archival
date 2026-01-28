import { Injectable, signal, computed } from '@angular/core';
import {
  CollectionItem,
  Movement,
  Room,
  UserCollection,
} from '../../shared/models/archive.models';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  // Initial Data
  private initialItems: CollectionItem[] = [
    {
      id: '01',
      category: 'decor',
      name: 'wassily b3 chair',
      designer: 'marcel breuer',
      year: '1925',
      origin: 'germany',
      room: 'the studio',
      image:
        'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800',
      note: 'chrome reflects the sun.',
      movementId: 'm1',
    },
    {
      id: '02',
      category: 'decor',
      name: 'akari 1a lamp',
      designer: 'isamu noguchi',
      year: '1951',
      origin: 'japan',
      room: 'bedroom',
      image:
        'https://images.unsplash.com/photo-1616627561950-9f746e330171?auto=format&fit=crop&q=80&w=800',
      note: 'a small cloud.',
      movementId: 'm2',
    },
  ];

  private initialRooms: Room[] = [
    { id: 'r1', name: 'living room', x: 0, y: 0 },
    { id: 'r2', name: 'bedroom', x: 1, y: 0 },
  ];

  // Global Signals
  collection = signal<CollectionItem[]>(this.initialItems);
  rooms = signal<Room[]>(this.initialRooms);
  userCollections = signal<UserCollection[]>([
    { id: 'c1', title: 'essentials', itemIds: ['01'] },
  ]);
  user = signal<{ name: string } | null>(null);

  // Actions
  addItem(item: CollectionItem) {
    this.collection.update((prev) => [item, ...prev]);
  }

  addRoom(name: string) {
    const current = this.rooms();
    this.rooms.update((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        x: current.length % 2,
        y: Math.floor(current.length / 2),
      },
    ]);
  }

  addToUserCollection(colId: string, itemId: string) {
    this.userCollections.update((cols) =>
      cols.map((c) =>
        c.id === colId && !c.itemIds.includes(itemId)
          ? { ...c, itemIds: [...c.itemIds, itemId] }
          : c,
      ),
    );
  }
}
