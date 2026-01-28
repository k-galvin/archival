export interface Movement {
  id: string;
  category: 'decor' | 'music' | 'books' | 'fashion';
  name: string;
  era: string;
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
