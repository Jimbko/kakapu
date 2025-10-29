import { Comment, UserProfile, UserAnimeList, ShikimoriAnime } from '../types';

// --- MOCK DATA ---

const mockUsers = {
  user1: { id: 'u1', name: 'AnimeFan123', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  user2: { id: 'u2', name: 'ShounenEnjoyer', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  user3: { id: 'u3', name: 'IsekaiWaifu', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  user4: { id: 'u4', name: 'Troll-kun', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
  user5: { id: 'u5', name: 'SliceOfLifeLover', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
};

const mockComments: Comment[] = [
  // ... existing mockComments
  {
    id: 'c1',
    user: mockUsers.user1,
    timestamp: '2 часа назад',
    content: 'Отличная серия! Анимация на высшем уровне, как всегда. Не могу дождаться следующей.',
    score: 15,
    replies: [
      {
        id: 'c1-r1',
        user: mockUsers.user2,
        timestamp: '1 час назад',
        content: 'Полностью согласен! Боевая сцена в конце была просто 🔥🔥🔥',
        score: 7,
      },
    ],
  },
  {
    id: 'c2',
    user: mockUsers.user3,
    timestamp: '5 часов назад',
    content: 'Немного разочарован. Ожидал большего от этой арки, пока что все слишком затянуто.',
    score: 2,
  },
  {
    id: 'c3',
    user: mockUsers.user4,
    timestamp: '30 минут назад',
    content: 'Все кто хвалит этот тайтл - просто не смотрели настоящие шедевры. Манга была лучше в 100 раз.',
    score: -8,
  },
];

const mockUserProfile: UserProfile = {
    id: 'dragger1337',
    nickname: 'dragger1337',
    avatar: 'https://i.pravatar.cc/150?u=dragger1337',
    coverPhoto: 'https://images.alphacoders.com/131/1317676.jpeg',
    registrationDate: '31.05.2024',
    birthday: '11.09.2001',
    gender: 'Мужской',
    daysInARow: 0,
    bio: 'Всем новичкам которые посмотрели 5, 12 серий и пишут своё никому не нужное мнение прошу не беспокоить',
    viewingTime: { tv: 288, ova: 5, ona: 27, movies: 1, specials: 1, total: 324 },
};

const mockUserAnimeLists: UserAnimeList = {
    watching: [{id: 52991, name: 'sousou-no-frieren'}],
    planned: [{id: 136, name: 'hunter-x-hunter-2011'}, {id: 21, name: 'one-piece'}],
    completed: [{id: 9253, name: 'steins-gate'}, {id: 5114, name: 'fullmetal-alchemist-brotherhood'}],
    dropped: [{id: 30276, name: 'one-punch-man'}],
    favorite: [{id: 41467, name: 'Bleach'}]
};

// NEW MOCK DATA
export interface ActivityItem {
  id: string;
  type: 'comment' | 'status_update' | 'review';
  user: { id: string; name: string; avatar: string };
  timestamp: string;
  content: string;
  relatedAnime: { id: number; name: string };
}

const mockActivityFeed: ActivityItem[] = [
  {
    id: 'act1',
    type: 'comment',
    user: mockUsers.user1,
    timestamp: '15 минут назад',
    content: 'Эта серия была просто невероятной! Особенно концовка, сижу в мурашках.',
    relatedAnime: { id: 52991, name: 'Провожающая в последний путь Фрирен' }
  },
  {
    id: 'act2',
    type: 'status_update',
    user: mockUsers.user3,
    timestamp: '1 час назад',
    content: 'добавил(а) в "Запланировано"',
    relatedAnime: { id: 21, name: 'Ван-Пис' }
  },
  {
    id: 'act3',
    type: 'status_update',
    user: mockUsers.user2,
    timestamp: '3 часа назад',
    content: 'просмотрел(а)',
    relatedAnime: { id: 9253, name: 'Врата Штейна' }
  },
   {
    id: 'act4',
    type: 'comment',
    user: mockUsers.user5,
    timestamp: '5 часов назад',
    content: 'Пересматриваю в третий раз. Все еще гениально. Лучшее аниме всех времен.',
    relatedAnime: { id: 5114, name: 'Стальной алхимик: Братство' }
  },
];

const mockFriends = [
  mockUsers.user1, mockUsers.user2, mockUsers.user3, mockUsers.user4, mockUsers.user5
];


// --- API FUNCTIONS ---

const simulateDelay = <T>(data: T, delay: number): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), delay));

export const getCommentsByEpisodeId = (episodeId: string): Promise<Comment[]> => {
  console.log(`Fetching comments for episode ${episodeId}`);
  return simulateDelay(mockComments, 500);
};

export const getUserProfile = (username: string): Promise<UserProfile> => {
    console.log(`Fetching profile for ${username}`);
    return simulateDelay(mockUserProfile, 300);
};

export const getUserAnimeLists = (username: string): Promise<UserAnimeList> => {
    console.log(`Fetching anime lists for ${username}`);
    return simulateDelay(mockUserAnimeLists, 400);
};

// NEW API FUNCTIONS
export const getCommunityActivityFeed = (): Promise<ActivityItem[]> => {
  console.log('Fetching community activity feed');
  return simulateDelay(mockActivityFeed, 600);
}

export const getFriendsList = (): Promise<{ id: string; name: string; avatar: string; }[]> => {
  console.log('Fetching friends list');
  return simulateDelay(mockFriends, 400);
}