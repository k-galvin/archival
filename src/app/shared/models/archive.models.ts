/**
 * Represents the category of an archival item.
 */
export type CategoryType = 'decor' | 'music' | 'books' | 'fashion';

/**
 * Represents a historical or artistic movement.
 */
export interface Movement {
  /** Unique identifier for the movement. */
  id: string;
  /** The primary category associated with this movement. */
  category: CategoryType;
  /** Display name of the movement. */
  name: string;
  /** The historical era or time period (e.g., '1920s', 'Mid-Century'). */
  era: string;
  /** A brief description of the movement's characteristics. */
  description: string;
}

/**
 * Represents a geographic city for mapping or origin tracking.
 */
export interface City {
  /** Unique identifier for the city. */
  id: number;
  /** Display name of the city. */
  name: string;
  /** Country where the city is located. */
  country: string;
  /** Latitude coordinate. */
  lat: number;
  /** Longitude coordinate. */
  lng: number;
}

/**
 * Represents an individual item within the archive.
 */
export interface CollectionItem {
  /** Unique identifier for the item. */
  id: string;
  /** The category this item belongs to. */
  category: CategoryType;
  /** The name or title of the item. */
  name: string;
  /** The designer, author, or creator of the item. */
  designer: string;
  /** The year the item was produced or published. */
  year: number;
  /** The geographic or cultural origin of the item. */
  origin: string;
  /** The human-readable name of the room where the item is located. */
  room: string;
  /** Optional unique identifier for the room. */
  roomId?: string;
  /** The URL or path to the item's primary image. */
  image: string;
  /** Personal notes or archival details about the item. */
  note: string;
  /** The unique identifier of the associated movement. */
  movementId: string;
  /** The display name of the associated movement. */
  movementName: string;
  /** Internal field for Supabase image URL. */
  image_url?: string;
  /** Internal field for Supabase room ID. */
  room_id?: string;
  /** Internal field for Supabase movement ID. */
  movement_id?: string;
  /** The timestamp of the last update. */
  updated_at?: string;
}

/**
 * Represents a curated collection of archival items.
 */
export interface UserCollection {
  /** Unique identifier for the collection. */
  id: string;
  /** The title of the collection. */
  title: string;
  /** Array of item IDs belonging to this collection. */
  itemIds: string[];
  /** Internal field for Supabase junction table records. */
  collection_items?: { item_id: string }[];
}

/**
 * Represents a physical or conceptual room in the archival space.
 */
export interface Room {
  /** Unique identifier for the room. */
  id: string | number;
  /** Display name of the room. */
  name: string;
  /** X-coordinate for 2D layout/blueprint visualization. */
  x: number;
  /** Y-coordinate for 2D layout/blueprint visualization. */
  y: number;
}

/**
 * Response structure from the Google Books API.
 */
export interface GoogleBooksResponse {
  /** Array of book volumes found. */
  items: Volume[];
  /** Type of resource. */
  kind: string;
  /** Total number of items matching the query. */
  totalItems: number;
}

/**
 * Represents a single book volume from Google Books.
 */
export interface Volume {
  /** Unique identifier for the volume. */
  id: string;
  /** Detailed information about the book. */
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate: string;
    description: string;
    imageLinks?: {
      thumbnail: string;
      smallThumbnail: string;
    };
  };
}

/**
 * Response structure from the Discogs API search.
 */
export interface DiscogsResponse {
  /** Array of release records found. */
  results: DiscogsRelease[];
}

/**
 * Represents a single music release from Discogs.
 */
export interface DiscogsRelease {
  /** Unique identifier for the release. */
  id: number;
  /** URL to the cover image. */
  cover_image: string;
  /** Title of the release (often 'Artist - Title'). */
  title: string;
  /** Year of release. */
  year?: string;
  /** Format of the release (e.g., 'Vinyl', 'CD'). */
  format?: string[];
  /** Record labels associated with the release. */
  label?: string[];
}

/**
 * Generic response wrapper for Supabase Edge Functions.
 */
export interface FunctionsResponse<T> {
  /** The successful response data. */
  data: T | null;
  /** Error object if the request failed. */
  error: unknown | null;
}
