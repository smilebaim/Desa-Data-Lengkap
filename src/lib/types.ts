export type Role = 'superadmin' | 'admin' | 'operator' | 'village_staff';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  avatarUrl: string;
}

export interface Village {
  id: string;
  name: string;
  province: string;
  population: number;
  area: number; // in square kilometers
  lat: number;
  lng: number;
}

export interface Report {
  id: string;
  title: string;
  villageId: string;
  authorId: string;
  date: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
}
