// types.ts
export interface User {
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

export interface ShikimoriImage {
    original: string;
    preview: string;
    x96: string;
    x48: string;
}

export interface ShikimoriGenre {
    id: number;
    name: string;
    russian: string;
    kind: string;
}

export interface ShikimoriAnime {
    id: number;
    name: string;
    russian: string;
    image: ShikimoriImage;
    url: string;
    kind: string;
    score: string;
    status: string;
    episodes: number;
    episodes_aired: number;
    aired_on: string;
    released_on: string | null;
    description_html: string;
    genres: ShikimoriGenre[];
}
