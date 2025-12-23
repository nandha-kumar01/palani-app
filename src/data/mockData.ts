import { Madangal, Annadhanam, Quote, Temple, TempleEvent, Playlist, Song } from '../types';

export const madangalData: Madangal[] = [
  {
    id: '1',
    name: 'Palani Base Rest Stop',
    address: 'Palani Base, Dindigul District, Tamil Nadu',
    location: { latitude: 10.4505, longitude: 77.5185 },
    facilities: ['Water', 'Restroom', 'First Aid', 'Shelter'],
    timings: '24 hours',
    contact: '+91 4545 242424',
    isActive: true,
  },
  {
    id: '2',
    name: 'Thotti Rest Point',
    address: 'Thotti, Palani Hills, Tamil Nadu',
    location: { latitude: 10.4520, longitude: 77.5200 },
    facilities: ['Water', 'Restroom', 'Medical Aid', 'Food'],
    timings: '5:00 AM - 11:00 PM',
    contact: '+91 4545 242425',
    isActive: true,
  },
  {
    id: '3',
    name: 'Halfway Point Stop',
    address: 'Palani Hills Pathway, Tamil Nadu',
    location: { latitude: 10.4535, longitude: 77.5215 },
    facilities: ['Water', 'Restroom', 'Shelter'],
    timings: '24 hours',
    contact: '+91 4545 242426',
    isActive: true,
  },
];

export const annadhanamData: Annadhanam[] = [
  {
    id: '1',
    name: 'Palani Temple Annadhanam',
    address: 'Arulmigu Dhandayuthapani Swamy Temple, Palani',
    location: { latitude: 10.4507, longitude: 77.5185 },
    timings: '6:00 AM - 10:00 PM',
    contact: '+91 4545 242430',
    menu: ['சாம்பார் சாதம்', 'தயிர் சாதம்', 'பாயசம்', 'வடை'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Devotee Service Center',
    address: 'Palani Base Camp, Tamil Nadu',
    location: { latitude: 10.4500, longitude: 77.5180 },
    timings: '5:00 AM - 9:00 PM',
    contact: '+91 4545 242431',
    menu: ['இட்லி', 'தோசை', 'உப்புமா', 'காபி'],
    isActive: true,
  },
];

export const quotesData: Quote[] = [
  {
    id: '1',
    text: 'வேல் வேல் வேட்கை வேல் வேல் வீர வேல்',
    author: 'திருப்புகழ்',
    language: 'tamil',
    category: 'devotional',
  },
  {
    id: '2',
    text: 'Faith is taking the first step even when you don\'t see the whole staircase.',
    author: 'Martin Luther King Jr.',
    language: 'english',
    category: 'motivational',
  },
  {
    id: '3',
    text: 'சரவணபவ என்று சொன்னால் போதும்',
    author: 'பக்தர் பாடல்',
    language: 'tamil',
    category: 'devotional',
  },
  {
    id: '4',
    text: 'The journey of a thousand miles begins with one step.',
    author: 'Lao Tzu',
    language: 'english',
    category: 'spiritual',
  },
];

export const templeData: Temple = {
  _id: '1',
  id: '1',
  name: 'Arulmigu Dhandayuthapani Swamy Temple',
  description: 'The sacred abode of Lord Murugan at Palani Hills',
  history: 'Palani Temple is one of the six abodes (Arupadaiveedu) of Lord Murugan. The temple is situated on a hill about 150 feet high and is approached by road or by a winch that provides a smooth ride up the steep hill.',
  rituals: [
    'காவடி ஆட்டம்',
    'அபிஷேகம்',
    'அர்ச்சனை',
    'பால் குடம்',
    'தீர்த்தம்'
  ],
  location: { latitude: 10.4507, longitude: 77.5185 },
  visitCount: 0,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  events: [
    {
      id: '1',
      title: 'Thai Pusam Festival',
      description: 'Grand celebration of Lord Murugan',
      date: new Date('2024-01-25'),
      time: '4:00 AM - 10:00 PM',
      isSpecial: true,
    },
    {
      id: '2',
      title: 'Skanda Shasti',
      description: 'Six-day festival celebrating Lord Murugan\'s victory',
      date: new Date('2024-11-15'),
      time: '5:00 AM - 9:00 PM',
      isSpecial: true,
    },
  ],
  images: [],
};

export const playlistsData: Playlist[] = [
  {
    id: '1',
    name: 'Murugan Devotional Songs',
    description: 'Sacred songs for Lord Murugan',
    isAdmin: true,
    createdBy: 'admin',
    songs: [
      {
        id: '1',
        title: 'Vel Vel Vetkai',
        artist: 'Traditional',
        duration: 240,
        uri: 'local://vel_vel_vetkai.mp3',
        isLocal: true,
      },
      {
        id: '2',
        title: 'Saravanabhava',
        artist: 'Devotional',
        duration: 180,
        uri: 'local://saravanabhava.mp3',
        isLocal: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Pathayathirai Motivation',
    description: 'Motivational songs for the journey',
    isAdmin: true,
    createdBy: 'admin',
    songs: [
      {
        id: '3',
        title: 'Kangal Irandal',
        artist: 'Subramania Bharati',
        duration: 300,
        uri: 'local://kangal_irandal.mp3',
        isLocal: true,
      },
    ],
  },
];

export const achievementsData = [
  {
    id: '1',
    title: 'First Step',
    description: 'Complete your first walk',
    icon: '👣',
    condition: 'complete_first_walk',
  },
  {
    id: '2',
    title: '5K Walker',
    description: 'Walk 5 kilometers in one session',
    icon: '🥇',
    condition: 'walk_5km',
  },
  {
    id: '3',
    title: 'Group Leader',
    description: 'Lead a group walk',
    icon: '👑',
    condition: 'lead_group_walk',
  },
  {
    id: '4',
    title: 'Devotee',
    description: 'Listen to 10 devotional songs',
    icon: '🎵',
    condition: 'listen_10_songs',
  },
  {
    id: '5',
    title: 'Photographer',
    description: 'Upload 5 gallery photos',
    icon: '📷',
    condition: 'upload_5_photos',
  },
];

// Tamil translations
export const tamilTranslations = {
  home: 'முகப்பு',
  profile: 'சுயவிவரம்',
  history: 'வரலாறு',
  settings: 'அமைப்புகள்',
  login: 'உள்நுழைவு',
  signup: 'பதிவு செய்யவும்',
  email: 'மின்னஞ்சல்',
  password: 'கடவுச்சொல்',
  name: 'பெயர்',
  phone: 'தொலைபேசி',
  startWalk: 'நடைப்பயணத்தை தொடங்கவும்',
  joinGroup: 'குழுவில் சேரவும்',
  music: 'இசை',
  gallery: 'படங்கள்',
  madangal: 'மடங்கள்',
  annadhanam: 'அன்னதானம்',
  quotes: 'மேற்கோள்கள்',
  temple: 'கோயில்',
  distance: 'தூரம்',
  time: 'நேரம்',
  speed: 'வேகம்',
  pace: 'வேகம்',
};