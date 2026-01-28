import { Injectable, signal, effect } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CollectionItem,
  Room,
  UserCollection,
} from '../../shared/models/archive.models';

/**
 * CRITICAL: Replace these placeholders with your actual Supabase credentials.
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

    const [itemsRes, roomsRes, collectionsRes] = await Promise.all([
      itemsReq,
      roomsReq,
      colReq,
    ]);

    if (itemsRes.data) {
      this.collection.set(
        itemsRes.data.map((i) => ({
          ...i,
          image: i.image_url,
          year: i.year,
        })),
      );
    }

    if (roomsRes.data) this.rooms.set(roomsRes.data);

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
   * Registers a new spatial volume into the 'rooms' table in Supabase.
   */
  async addRoom(name: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const currentCount = this.rooms().length;
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        user_id: currentUser.id,
        name: name.toLowerCase(),
        // Simple logic to place rooms in a 2-column grid automatically
        x: currentCount % 2,
        y: Math.floor(currentCount / 2),
      })
      .select()
      .single();

    if (data) {
      this.rooms.update((prev) => [...prev, data]);
    } else if (error) {
      console.error('Error adding room:', error.message);
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

    const { data } = await this.supabase
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
        movement_id: item.movementId,
      })
      .select()
      .single();

    if (data)
      this.collection.update((prev) => [
        { ...data, image: data.image_url },
        ...prev,
      ]);
  }
}
