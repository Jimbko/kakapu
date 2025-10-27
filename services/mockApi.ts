// Fix: Added full content for services/mockApi.ts to provide mock data for comments.
import { Comment, UserProfile, UserAnimeList } from '../types';

const mockUsers = {
  user1: { id: 'u1', name: 'AnimeFan123', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  user2: { id: 'u2', name: 'ShounenEnjoyer', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  user3: { id: 'u3', name: 'IsekaiWaifu', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  user4: { id: 'u4', name: 'Troll-kun', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
};

const mockComments: Comment[] = [
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
    avatar: 'https://i.imgur.com/tLp2d62.jpeg',
    coverPhoto: 'https://i.imgur.com/eB4s94k.jpeg',
    registrationDate: '31.05.2024',
    birthday: '11.09.2001',
    gender: 'Мужской',
    daysInARow: 0,
    bio: 'Всем новичкам которые посмотрели 5, 12 серий и пишут своё никому не нужное мнение прошу не беспокоить',
    viewingTime: { tv: 288, ova: 5, ona: 27, movies: 1, specials: 1, total: 324 },
};

const mockUserAnimeLists: UserAnimeList = {
    watching: [],
    planned: [{id: 136, name: 'hunter-x-hunter-2011'}, {id: 21, name: 'one-piece'}],
    completed: [{id: 9253, name: 'steins-gate'}, {id: 5114, name: 'fullmetal-alchemist-brotherhood'}],
    dropped: [{id: 30276, name: 'one-punch-man'}],
    favorite: [{id: 41467, name: 'Bleach'}]
};

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
