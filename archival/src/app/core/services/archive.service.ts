import { Injectable, signal, effect, inject } from '@angular/core';
import {
  createClient,
  User,
  AuthChangeEvent,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import {
  CollectionItem,
  Room,
  UserCollection,
  Movement,
  City,
  GoogleBooksResponse,
} from '../../shared/models/archive.models';
import { environment } from '../../../environments/environment';

/**
 * Supabase Project Credentials
 */
const SUPABASE_URL = 'https://oaqzbymmhusbhvscfcrp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y8hY9if-e5PdwcmCKALzsQ_bzUpYVHp';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  private http = inject(HttpClient);

  // Global Signals for Application State
  collection = signal<CollectionItem[]>([]);
  rooms = signal<Room[]>([]);
  userCollections = signal<UserCollection[]>([]);
  movements = signal<Movement[]>([]);
  cities = signal<City[]>([]); // New signal for cities

  // Auth state signals
  user = signal<User | null>(null);
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

    this.supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        this.user.set(session?.user ?? null);
        if (!session) this.clearState();
      },
    );
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
    const citiesReq = this.supabase.from('cities').select('*'); // New cities request

    const [itemsRes, roomsRes, collectionsRes, movementsRes, citiesRes] =
      await Promise.all([
        itemsReq,
        roomsReq,
        colReq,
        movementsReq,
        citiesReq, // Add citiesReq to Promise.all
      ]);

    if (roomsRes.data) this.rooms.set(roomsRes.data);
    if (movementsRes.data) this.movements.set(movementsRes.data);
    if (citiesRes.data) this.cities.set(citiesRes.data); // Populate cities signal

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
        itemsRes.data.map((i: CollectionItem) => ({
          ...i,
          image: i.image_url || '',
          year: i.year,
          room: i.room_id ? roomMap.get(i.room_id) || '' : '',
          movementName: i.movement_id
            ? movementMap.get(i.movement_id) || ''
            : '',
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

    this.loading.set(false);
  }

  private clearState() {
    this.collection.set([]);
    this.rooms.set([]);
    this.userCollections.set([]);
    this.cities.set([]); // Clear cities signal
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
   * Searches the Discogs API for a given release (album) query.
   * @param query The search term, e.g., an album title.
   * @returns An Observable of the API response.
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
      // Optimistically update the local signal state
      this.userCollections.update((cols) => [
        ...cols,
        { id: data.id, title: data.title, itemIds: [] },
      ]);
    } else if (error) {
      console.error('Error adding collection:', error.message);
    }
  }

  async deleteCollection(id: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    // First, delete all items in the junction table associated with this collection
    const { error: junctionError } = await this.supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', id);

    if (junctionError) {
      console.error('Error deleting collection items:', junctionError.message);
      return; // Stop if we can't delete the children
    }

    // Then, delete the collection itself
    const { error: collectionError } = await this.supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (collectionError) {
      console.error('Error deleting collection:', collectionError.message);
    } else {
      // Optimistically update the local signal
      this.userCollections.update((cols) => cols.filter((c) => c.id !== id));
    }
  }

  async removeFromCollection(colId: string, itemId: string) {
    const { error } = await this.supabase
      .from('collection_items')
      .delete()
      .match({ collection_id: colId, item_id: itemId });

    if (error) {
      console.error('Error removing item from collection:', error.message);
    } else {
      // Optimistically update local state
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

  async addToUserCollection(colId: string, itemId: string) {
    // Prevent adding duplicates
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
        },
        ...prev,
      ]);
      return { ...data, room: roomName, movementName: movementName };
    } else if (error) {
      console.error('Record Registration Error:', error.message);
      return null;
    }
    return null;
  }
}
