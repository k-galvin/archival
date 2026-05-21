import { Injectable, signal, effect, inject } from '@angular/core';
import {
  User,
  AuthChangeEvent,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import {
  CollectionItem,
  Room,
  UserCollection,
  Movement,
  City,
  GoogleBooksResponse,
} from '../../shared/models/archive.models';
import { environment } from '../../../environments/environment';
import { SUPABASE_CLIENT } from './supabase-client.token';

/**
 * The central service for managing archival data, authentication, and external API integrations.
 * Provides signals for real-time state management of collections, rooms, and user status.
 */
@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  /** The Supabase client instance. */
  supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private http = inject(HttpClient);
  private router = inject(Router);

  // --- Data Signals ---
  /** Signal containing the full collection of archival items. */
  collection = signal<CollectionItem[]>([]);
  /** Signal containing the list of defined archival rooms. */
  rooms = signal<Room[]>([]);
  /** Signal containing the user's custom curated collections. */
  userCollections = signal<UserCollection[]>([]);
  /** Signal containing the master list of historical movements. */
  movements = signal<Movement[]>([]);
  /** Signal containing geographic city data. */
  cities = signal<City[]>([]);

  // --- Auth & UI State Signals ---
  /** Signal containing the currently authenticated Supabase user. */
  user = signal<User | null>(null);
  /** Signal indicating if global data loading is in progress. */
  loading = signal(true);
  /** Signal containing the latest authentication error message, if any. */
  authError = signal<string | null>(null);
  /** Signal indicating if a logout operation is in progress. */
  isLoggingOut = signal(false);
  /** Signal indicating if a login operation is in progress. */
  isLoggingIn = signal(false);
  /** Signal tracking the browser's online/offline status. */
  isOnline = signal(navigator.onLine);

  constructor() {
    this.initAuth();
    this.initOnlineStatus();

    // Automatically fetch user data when the user signal changes.
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
   * Listens for browser online/offline events to update the isOnline signal.
   */
  private initOnlineStatus() {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  /**
   * Initializes the Supabase session and sets up an auth state change listener.
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

    this.supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        this.user.set(session?.user ?? null);
        if (!session) this.clearState();
      },
    );
  }

  // --- Authentication Flow ---

  /**
   * Registers a new user with Supabase.
   * @param email The user's email address.
   * @param password The user's chosen password.
   * @param name The user's display name (stored in user metadata).
   * @returns A promise that resolves to the Supabase AuthResponse data.
   */
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

  /**
   * Authenticates a user with email and password.
   * Navigates to the gallery on success.
   * @param email The user's email address.
   * @param password The user's password.
   * @returns A promise that resolves to the Supabase AuthResponse data.
   */
  async signIn(email: string, password: string) {
    this.isLoggingIn.set(true);
    this.authError.set(null);
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        this.authError.set(error.message);
        throw error;
      }
      if (data.user) {
        await this.router.navigate(['/gallery']);
      }
      return data;
    } catch (error) {
      console.error('Error during signIn:', error);
      throw error;
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  /**
   * Signs out the current user and clears local state.
   * Navigates back to the landing page.
   */
  async signOut() {
    this.isLoggingOut.set(true);
    try {
      await this.supabase.auth.signOut();
      this.user.set(null);
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during signOut:', error);
    } finally {
      this.isLoggingOut.set(false);
    }
  }

  // --- Data Fetching ---

  /**
   * Fetches all archival data for a specific user from Supabase.
   * Includes items, rooms, collections, movements, and cities.
   * @param userId The unique ID of the user whose data is being fetched.
   */
  private async fetchUserData(userId: string) {
    if (!this.isOnline()) {
      this.loading.set(false);
      console.warn('System is offline. Displaying cached session data.');
      return;
    }

    this.loading.set(true);

    try {
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
      const citiesReq = this.supabase.from('cities').select('*');

      const [itemsRes, roomsRes, collectionsRes, movementsRes, citiesRes] =
        await Promise.all([itemsReq, roomsReq, colReq, movementsReq, citiesReq]);

      if (roomsRes.data) this.rooms.set(roomsRes.data);
      if (movementsRes.data) this.movements.set(movementsRes.data);
      if (citiesRes.data) this.cities.set(citiesRes.data);

      if (itemsRes.data) {
        const roomMap = new Map<string, string>();
        this.rooms().forEach((room) => {
          roomMap.set(room.id as string, room.name);
        });

        const movementMap = new Map<string, string>();
        this.movements().forEach((movement) => {
          movementMap.set(movement.id, movement.name);
        });

        this.collection.set(
          (itemsRes.data as CollectionItem[]).map((i) => ({
            ...i,
            image: i.image_url || '',
            year: i.year,
            room: i.room_id ? roomMap.get(i.room_id) || '' : '',
            roomId: i.room_id || '',
            movementName: i.movement_id
              ? movementMap.get(i.movement_id) || ''
              : '',
            movementId: i.movement_id || '',
            updated_at: i.updated_at,
          })),
        );
      }

      if (collectionsRes.data) {
        this.userCollections.set(
          collectionsRes.data.map((c: UserCollection) => ({
            id: c.id,
            title: c.title,
            itemIds: (c.collection_items || []).map(
              (ci: { item_id: string }) => ci.item_id,
            ),
          })),
        );
      }
    } catch (error) {
      console.error('Failed to fetch user data while online:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Clears all archival data from signals. Used on logout.
   */
  private clearState() {
    this.collection.set([]);
    this.rooms.set([]);
    this.userCollections.set([]);
    this.cities.set([]);
  }

  // --- Write Operations ---

  /**
   * Searches the Google Books API for a given query.
   * @param query The search term, e.g., a book title.
   * @returns An Observable of the API response.
   */
  searchBooks(query: string): Observable<GoogleBooksResponse> {
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query,
    )}&maxResults=5`;
    if (environment.googleBooksApiKey) {
      url += `&key=${environment.googleBooksApiKey}`;
    }
    return this.http.get<GoogleBooksResponse>(url);
  }

  /**
   * Searches the Discogs API via a Supabase Edge Function.
   * @param query The search term, e.g., an album title.
   * @returns A promise that resolves to the function's response.
   */
  searchDiscogs(query: string) {
    return from(
      this.supabase.functions.invoke('discogs-search', {
        body: { title: query },
      }),
    );
  }

  /**
   * Uploads an archival photograph to Supabase Storage.
   * Organizes files by user ID and acquisition date.
   * @param file The image file to upload.
   * @returns A promise resolving to the public URL of the uploaded image, or null if failed.
   */
  async uploadImage(file: File): Promise<string | null> {
    const currentUser = this.user();
    if (!currentUser) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}/${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
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
   * Deletes a specific item from the archive.
   * @param id The unique ID of the item to delete.
   */
  async deleteItem(id: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const { error } = await this.supabase.from('items').delete().eq('id', id);

    if (error) {
      console.error('Error deleting item:', error.message);
    } else {
      this.collection.update((prev) => prev.filter((item) => item.id !== id));
    }
  }

  /**
   * Creates a new archival room with an automatic grid-based position.
   * @param name The display name of the room.
   */
  async addRoom(name: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const currentCount = this.rooms().length;
    const gridSize = Math.max(2, Math.ceil(Math.sqrt(currentCount + 1)));
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        user_id: currentUser.id,
        name: name.toLowerCase(),
        x: currentCount % gridSize,
        y: Math.floor(currentCount / gridSize),
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
   * Deletes a room from the archive.
   * @param id The unique identifier of the room to delete.
   */
  async deleteRoom(id: string | number) {
    const currentUser = this.user();
    if (!currentUser) return;

    const { error } = await this.supabase.from('rooms').delete().eq('id', id);

    if (error) {
      console.error('Error deleting room:', error.message);
    } else {
      this.rooms.update((prev) => prev.filter((r) => r.id !== id));
    }
  }

  /**
   * Creates a new custom collection.
   * @param title The title of the new collection.
   */
  async addCollection(title: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const { data, error } = await this.supabase
      .from('collections')
      .insert({
        user_id: currentUser.id,
        title: title,
      })
      .select()
      .single();

    if (data) {
      this.userCollections.update((cols) => [
        ...cols,
        { id: data.id, title: data.title, itemIds: [] },
      ]);
    } else if (error) {
      console.error('Error adding collection:', error.message);
    }
  }

  /**
   * Deletes a collection and all its associated item mappings (junction records).
   * @param id The unique ID of the collection to delete.
   */
  async deleteCollection(id: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const { error: junctionError } = await this.supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', id);

    if (junctionError) {
      console.error('Error deleting collection items:', junctionError.message);
      return;
    }

    const { error: collectionError } = await this.supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (collectionError) {
      console.error('Error deleting collection:', collectionError.message);
    } else {
      this.userCollections.update((cols) => cols.filter((c) => c.id !== id));
    }
  }

  /**
   * Removes a specific item from a curated collection.
   * @param colId The ID of the collection.
   * @param itemId The ID of the item to remove.
   */
  async removeFromCollection(colId: string, itemId: string) {
    const { error } = await this.supabase
      .from('collection_items')
      .delete()
      .match({ collection_id: colId, item_id: itemId });

    if (error) {
      console.error('Error removing item from collection:', error.message);
    } else {
      this.userCollections.update((cols) =>
        cols.map((c) => {
          if (c.id === colId) {
            return { ...c, itemIds: c.itemIds.filter((id) => id !== itemId) };
          }
          return c;
        }),
      );
    }
  }

  /**
   * Adds an archival item to a specific curated collection.
   * @param colId The ID of the destination collection.
   * @param itemId The ID of the item to add.
   */
  async addToUserCollection(colId: string, itemId: string) {
    const collection = this.userCollections().find((c) => c.id === colId);
    if (collection?.itemIds.includes(itemId)) {
      console.log('Item already in collection.');
      return;
    }

    const { error } = await this.supabase
      .from('collection_items')
      .insert({ collection_id: colId, item_id: itemId });

    if (error === null) {
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

  /**
   * Registers a new item in the archive.
   * Maps local signal-friendly field names to database-friendly column names.
   * @param item The item data to persist.
   * @returns A promise resolving to the newly created item with all IDs and timestamps.
   */
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
        room_id: item.room === '' ? null : item.room,
      })
      .select()
      .single();

    if (data) {
      const roomName = data.room_id
        ? this.rooms().find((r) => r.id === data.room_id)?.name || ''
        : '';
      const movementName = data.movement_id
        ? this.movements().find((m) => m.id === data.movement_id)?.name || ''
        : '';

      this.collection.update((prev) => [
        {
          ...data,
          image: data.image_url,
          room: roomName,
          movementName: movementName,
          updated_at: data.updated_at,
        },
        ...prev,
      ]);
      return {
        ...data,
        image: data.image_url,
        room: roomName,
        movementName: movementName,
        updated_at: data.updated_at,
      };
    } else if (error) {
      console.error('Record Registration Error:', error.message);
      return null;
    }
    return null;
  }

  /**
   * Updates an existing archival item.
   * Only provides changed fields to the database.
   * @param id The unique ID of the item to update.
   * @param updates Partial item data containing changed fields.
   * @returns A promise resolving to the fully updated item record.
   */
  async updateItem(id: string, updates: Partial<CollectionItem>) {
    const dbUpdates: Record<string, unknown> = { ...updates };

    if (updates.image !== undefined) {
      dbUpdates['image_url'] = updates.image;
      delete dbUpdates['image'];
    }
    if (updates.movementId !== undefined) {
      dbUpdates['movement_id'] =
        updates.movementId === '' ? null : updates.movementId;
      delete dbUpdates['movementId'];
    }
    if (updates.room !== undefined) {
      dbUpdates['room_id'] = updates.room === '' ? null : updates.room;
      delete dbUpdates['room'];
    }

    delete dbUpdates['movementName'];
    delete dbUpdates['id'];

    const { data, error } = await this.supabase
      .from('items')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error.message);
      return null;
    }

    if (data) {
      const roomName = data.room_id
        ? this.rooms().find((r: Room) => r.id === data.room_id)?.name || ''
        : '';
      const movementName = data.movement_id
        ? this.movements().find((m: Movement) => m.id === data.movement_id)
            ?.name || ''
        : '';

      const updatedFullItem = {
        ...data,
        image: data.image_url,
        room: roomName,
        movementName: movementName,
        updated_at: data.updated_at,
      };

      this.collection.update((prev) => {
        const index = prev.findIndex((i) => i.id === id);
        if (index > -1) {
          const newCollection = [...prev];
          newCollection[index] = updatedFullItem;
          return newCollection;
        }
        return prev;
      });
      return updatedFullItem;
    }
    return null;
  }
}
