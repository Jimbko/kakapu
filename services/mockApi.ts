import { Comment } from '../types';

const commentsData: { [episodeId: string]: Comment[] } = {
  '1': [
    {
      id: 'c1',
      user: { name: 'AnimeFan123', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704d' },
      timestamp: '2 часа назад',
      content: 'Отличный эпизод! Очень понравилась анимация боя.',
      score: 15,
      replies: [
        {
          id: 'c1-1',
          user: { name: 'SakuraChan', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704e' },
          timestamp: '1 час назад',
          content: 'Согласна! Особенно момент с использованием новой техники.',
          score: 8,
        },
        {
          id: 'c1-2',
          user: { name: 'OtakuMaster', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704f' },
          timestamp: '30 минут назад',
          content: 'А мне показалось, что темп немного просел в середине.',
          score: -2,
        },
      ],
    },
    {
      id: 'c2',
      user: { name: 'Guest_777', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704g' },
      timestamp: '5 часов назад',
      content: 'Кто-нибудь знает, что за трек играл на 12:35?',
      score: 5,
    },
    {
        id: 'c3',
        user: { name: 'MangaReader', avatar: 'https://i.pravatar.cc/40?u=a042581f4e29026704h' },
        timestamp: '8 часов назад',
        content: 'В манге этот момент был показан гораздо лучше. Разочарован :(',
        score: -8,
    }
  ],
  '2': [],
  '3': [],
  '4': [],
  '5': [],
  '6': [],
  '7': [],
  '8': [],
  '9': [],
  '10': [],
  '11': [],
  '12': [],
};

export const getCommentsByEpisodeId = (episodeId: string): Promise<Comment[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(commentsData[episodeId] || []);
    }, 500);
  });
};
