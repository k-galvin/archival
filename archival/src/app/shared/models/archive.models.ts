export type CategoryType = 'decor' | 'music' | 'books' | 'fashion';

export interface Movement {
  id: string;
  category: CategoryType;
  name: string;
  era: string;
}

export interface City {
  id: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface CollectionItem {
  id: string;
  category: CategoryType;
  name: string;
  designer: string;
  year: number;
  origin: string;
  room: string;
  image: string;
  note: string;
  movementId: string;
  movementName: string;
  image_url?: string;
  room_id?: string;
  movement_id?: string;
}

export interface UserCollection {
  id: string;
  title: string;
  itemIds: string[];
  collection_items?: { item_id: string }[];
}

export interface Room {
  id: string | number;
  name: string;
  x: number;
  y: number;
}

export interface GoogleBooksResponse {
  items: Volume[];
  kind: string;
  totalItems: number;
}

export interface Volume {
  id: string;
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

export interface DiscogsResponse {
  results: DiscogsRelease[];
}

export interface DiscogsRelease {
  id: number;
  cover_image: string;
  title: string;
  year?: string;
  format?: string[];
  label?: string[];
}

export interface FunctionsResponse<T> {
  data: T | null;
  error: any | null;
}