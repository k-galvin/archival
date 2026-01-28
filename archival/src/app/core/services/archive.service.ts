import { Injectable, signal, effect } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CollectionItem,
  Room,
  UserCollection,
  Movement, // Import Movement interface
} from '../../shared/models/archive.models';

/**
 * Supabase Project Credentials
 */
const SUPABASE_URL = 'https://oaqzbymmhusbhvscfcrp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y8hY9if-e5PdwcmCKALzsQ_bzUpYVHp';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Global Signals for Application State
  collection = signal<CollectionItem[]>([]);
  rooms = signal<Room[]>([]);
  userCollections = signal<UserCollection[]>([]);
  movements = signal<Movement[]>([]);

  // Auth state signals
  user = signal<any>(null);
  loading = signal(true);
  authError = signal<string | null>(null);

  constructor() {
    this.initAuth();

    // Reactive synchronization: Fetch user data automatically when a session is active
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.fetchUserData(currentUser.id);
      } else {
        this.clearState();
      }
    });
  }

  /**
   * Initializes the session listener.
   */
  private async initAuth() {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      this.user.set(session?.user ?? null);
    } catch (e) {
      console.error('Auth initialization failed', e);
    } finally {
      this.loading.set(false);
    }

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
      if (!session) this.clearState();
    });
  }

  // --- Authentication Flow ---

  async signUp(email: string, password: string, name: string) {
    this.authError.set(null);
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      this.authError.set(error.message);
      throw error;
    }
    return data;
  }

  async signIn(email: string, password: string) {
    this.authError.set(null);
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      this.authError.set(error.message);
      throw error;
    }
    return data;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.user.set(null);
  }

  // --- Data Fetching ---

  private async fetchUserData(userId: string) {
    this.loading.set(true);

    const itemsReq = this.supabase
      .from('items')
      .select('*')
      .eq('user_id', userId);
    const roomsReq = this.supabase
      .from('rooms')
      .select('*')
      .eq('user_id', userId);
    const colReq = this.supabase
      .from('collections')
      .select('*, collection_items(item_id)')
      .eq('user_id', userId);

    const movementsReq = this.supabase.from('movements').select('*');

    const [itemsRes, roomsRes, collectionsRes, movementsRes] = await Promise.all([
      itemsReq,
      roomsReq,
      colReq,
      movementsReq,
    ]);

    // Populate rooms and movements first, so they are available for item processing
    if (roomsRes.data) this.rooms.set(roomsRes.data);
    if (movementsRes.data) this.movements.set(movementsRes.data);

    if (itemsRes.data) {
      const roomMap = new Map<string, string>();
      this.rooms().forEach(room => {
        roomMap.set(room.id as string, room.name);
      });

      const movementMap = new Map<string, string>();
      this.movements().forEach(movement => {
        movementMap.set(movement.id, movement.name);
      });

      this.collection.set(
        itemsRes.data.map((i) => ({
          ...i,
          image: i.image_url,
          year: i.year,
          room: i.room_id ? roomMap.get(i.room_id) || '' : '',
          movementName: i.movement_id ? movementMap.get(i.movement_id) || '' : '',
        })),
      );
    }

    if (collectionsRes.data) {
      this.userCollections.set(
        collectionsRes.data.map((c) => ({
          id: c.id,
          title: c.title,
          itemIds: c.collection_items.map((ci: any) => ci.item_id),
        })),
      );
    }

    this.loading.set(false);
  }

  private clearState() {
    this.collection.set([]);
    this.rooms.set([]);
    this.userCollections.set([]);
  }

  // --- Write Operations ---

  /**
   * Uploads an archival photograph to Supabase Storage.
   * Assumes a bucket named 'item-photos' exists with public read access.
   */
  async uploadImage(file: File): Promise<string | null> {
    const currentUser = this.user();
    if (!currentUser) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${currentUser.id}/acquisitions/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('item-photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Archive Storage Error:', uploadError.message);
      return null;
    }

    const { data } = this.supabase.storage
      .from('item-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Registers a new spatial volume into the 'rooms' table in Supabase.
   */
  async deleteItem(id: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const { error } = await this.supabase
      .from('items')
      .delete()
      .eq('id', id); // Delete the item where id matches

    if (error) {
      console.error('Error deleting item:', error.message);
    } else {
      // Optimistically update the local signal if delete was successful
      this.collection.update((prev) => prev.filter((item) => item.id !== id));
    }
  }

  async addRoom(name: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const currentCount = this.rooms().length;
    // Calculate dynamic grid size for the next room to be added
    const gridSize = Math.max(2, Math.ceil(Math.sqrt(currentCount + 1)));
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        user_id: currentUser.id,
        name: name.toLowerCase(),
        // Dynamic logic to place rooms in an expanding grid
        x: currentCount % gridSize, // Use the calculated gridSize
        y: Math.floor(currentCount / gridSize), // Use the calculated gridSize
      })
      .select()
      .single();

    if (data) {
      this.rooms.update((prev) => [...prev, data]);
    } else if (error) {
      console.error('Error adding room:', error.message);
    }
  }

  async deleteRoom(id: string | number) {
    const currentUser = this.user();
    if (!currentUser) return;

    const { error } = await this.supabase
      .from('rooms')
      .delete()
      .eq('id', id); // Delete the room where id matches

    if (error) {
      console.error('Error deleting room:', error.message);
    } else {
      // Optimistically update the local signal if delete was successful
      this.rooms.update((prev) => prev.filter((r) => r.id !== id));
    }
  }

  /**
   * Creates a junction record in 'collection_items' to link an item to a curation.
   */
  async addToUserCollection(colId: string, itemId: string) {
    const { error } = await this.supabase
      .from('collection_items')
      .insert({ collection_id: colId, item_id: itemId });

    if (!error) {
      // Optimistically update the local signal state
      this.userCollections.update((cols) =>
        cols.map((c) =>
          c.id === colId && !c.itemIds.includes(itemId)
            ? { ...c, itemIds: [...c.itemIds, itemId] }
            : c,
        ),
      );
    } else {
      console.error('Failed to route record to collection:', error.message);
    }
  }

  async addItem(item: CollectionItem) {
    const currentUser = this.user();
    if (!currentUser) return;

    const { data, error } = await this.supabase
      .from('items')
      .insert({
        user_id: currentUser.id,
        name: item.name,
        designer: item.designer,
        year: item.year,
        origin: item.origin,
        category: item.category,
        image_url: item.image,
        note: item.note,
        movement_id: item.movementId === '' ? null : item.movementId,
        room_id: item.room === '' ? null : item.room, // Handle empty string for room_id // Corrected column name
      })
      .select()
      .single();

    if (data) {
      // Find the room name from the rooms signal using data.room_id
      const roomName = data.room_id ? this.rooms().find(r => r.id === data.room_id)?.name || '' : '';
      // Find the movement name from the movements signal using data.movement_id
      const movementName = data.movement_id ? this.movements().find(m => m.id === data.movement_id)?.name || '' : '';

      this.collection.update((prev) => [
        { ...data, image: data.image_url, room: roomName, movementName: movementName }, // Add room and movement name
        ...prev,
      ]);
      return { ...data, room: roomName, movementName: movementName }; // Also return the data with room and movement name
    } else if (error) {
      console.error('Record Registration Error:', error.message);
      return null; // Return null on error
    }
    return null; // Should not be reached, but good for type safety
  }
}
