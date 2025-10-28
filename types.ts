import { ProcessedImage } from "./services/imageProcessor";

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  user: User;
  timestamp: string;
  content: string;
  score: number;
  replies?: Comment[];
}

export interface Genre {
    id: number;
    name: string;
    russian: string;
    kind: string;
}

export interface ShikimoriAnime {
    id: number;
    name: string;
    russian: string;
    image: ProcessedImage | null;
    url: string;
    kind: 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'music' | null;
    score: string;
    status: 'anons' | 'ongoing' | 'released';
    episodes: number;
    episodes_aired: number;
    aired_on: string;
    released_on: string | null;
    rating: string;
    english: (string | null)[];
    japanese: string[];
    synonyms: string[];
    license_name_ru: string | null;
    duration: number;
    description: string | null;
    description_html: string | null;
    description_source: string | null;
    franchise: string | null;
    favoured: boolean;
    anons: boolean;
    ongoing: boolean;
    thread_id: number;
    topic_id: number;
    myanimelist_id: number;
    rates_scores_stats: { name: string; value: number }[];
    rates_statuses_stats: { name: string; value: number }[];
    updated_at: string;
    next_episode_at: string | null;
    genres: Genre[];
    studios: { id: number; name: string; filtered_name: string; real: boolean; image: string }[];
    videos: any[];
    screenshots: { original: string; preview: string }[];
    user_rate: any;
}

export interface KodikTranslation {
  id: number;
  title: string;
  type: string;
  episodes_count: number;
}

export interface KodikSearchResult {
  shikimori_id: string;
  title: string;
  link: string;
  screenshots: string[];
  translations: KodikTranslation[];
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  coverPhoto: string;
  registrationDate: string;
  birthday: string;
  gender: string;
  daysInARow: number;
  bio: string;
  viewingTime: {
    tv: number;
    ova: number;
    ona: number;
    movies: number;
    specials: number;
    total: number;
  };
}

export interface SimpleAnime {
  id: number;
  name: string;
}

export interface UserAnimeList {
  watching: SimpleAnime[];
  planned: SimpleAnime[];
  completed: SimpleAnime[];
  dropped: SimpleAnime[];
  favorite: SimpleAnime[];
}

export interface FranchiseNode {
  id: number;
  date: number;
  name: string;
  image_url: string;
  url: string;
  kind: string;
  year: number | null;
  weight: number;
}

export interface FranchiseData {
  links: any[];
  nodes: FranchiseNode[];
  current_id: number;
}