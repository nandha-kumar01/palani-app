export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  emergencyContact?: string;
  createdAt: Date;
}

export interface Walk {
  id: string;
  userId: string;
  groupId?: string;
  startTime: Date;
  endTime?: Date;
  distance: number;
  duration: number;
  pace: number;
  route: Location[];
  isActive: boolean;
  isGroupWalk: boolean;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  adminId: string;
  createdAt: Date;
  isActive: boolean;
  currentWalk?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface Madangal {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  facilities: string[];
  timings: string;
  contact: string;
  isActive: boolean;
}

export interface Annadhanam {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timings: string;
  contact: string;
  menu: string[];
  isActive: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  isAdmin: boolean;
  createdBy: string;
  coverImage?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  isLocal: boolean;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  language: 'tamil' | 'english';
  category: 'devotional' | 'motivational' | 'spiritual';
}

export interface Temple {
  _id: string;
  name: string;
  description?: string;
  photo?: string;
  gallery?: string[];
  location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    long?: number;
  } | string;
  timings?: {
    opening?: string;
    closing?: string;
    morning?: string;
    evening?: string;
  } | string;
  contact?: {
    phone?: string;
    email?: string;
  };
  facilities?: string[];
  visitCount: number;
  isActive: boolean;
  rating?: number;
  deity?: string;
  specialFeatures?: string[];
  festivals?: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
  
  // Legacy support
  id?: string;
  history?: string;
  rituals?: string[];
  events?: TempleEvent[];
  images?: string[];
}

export interface TempleEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  isSpecial: boolean;
}

export interface GalleryImage {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  uploadedBy: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: Date;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentWalk: Walk | null;
  language: 'tamil' | 'english';
  theme: 'light' | 'dark';
}