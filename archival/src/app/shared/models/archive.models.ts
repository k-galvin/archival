export interface Movement {
  id: string;
  category: 'decor' | 'music' | 'books' | 'fashion';
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
  category: 'decor' | 'music' | 'books' | 'fashion';
  name: string;
  designer: string;
  year: number; // Root Fix: Aligned with Supabase 'integer' type
  origin: string;
  room: string;
  image: string;
  note: string;
  movementId: string;
  movementName: string; // New property to store the movement name
}

export interface UserCollection {
  id: string;
  title: string;
  itemIds: string[];
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
    authors: string[];
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
