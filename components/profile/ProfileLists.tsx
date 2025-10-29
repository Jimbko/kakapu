import React, { useState, useEffect } from 'react';
import { UserAnimeList, ShikimoriAnime } from '../../types';
import { getAnimeByIds } from '../../services/shikimori';
import { AnimeCard } from '../shared/AnimeCard';
import { FriendsList } from '../community/FriendsList';
import { AnimeCardSkeleton } from '../shared/skeletons/AnimeCardSkeleton';

interface ProfileListsProps {
  lists: UserAnimeList;
  isOwnProfile: boolean;
}

type ListKey = keyof UserAnimeList;
type ActiveTab = ListKey | 'friends';

const listTitles: Record<ListKey, string> = {
  watching: 'Смотрю',
  planned: 'Запланировано',
  completed: 'Просмотрено',
  dropped: 'Брошено',
  favorite: 'Любимое',
};

const ListTabContent: React.FC<{ list: { id: number; name: string }[] }> = ({ list }) => {
  const [animeDetails, setAnimeDetails] = useState<ShikimoriAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (list.length === 0) {
        setLoading(false);
        setAnimeDetails([]);
        return;
      }
      setLoading(true);
      const ids = list.map(item => item.id);
      try {
        const data = await getAnimeByIds(ids);
        // Ensure the order is the same as the input list
        const sortedData = ids.map(id => data.find(anime => anime.id === id)).filter(Boolean) as ShikimoriAnime[];
        setAnimeDetails(sortedData);
      } catch (error) {
        console.error("Failed to fetch anime details for list", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [list]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {Array.from({ length: list.length || 6 }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (animeDetails.length === 0) {
      return <div className="p-8 text-center text-zinc-500">Список пуст.</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {animeDetails.map(anime => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
};


export const ProfileLists: React.FC<ProfileListsProps> = ({ lists, isOwnProfile }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('watching');
  const listKeys = Object.keys(lists) as ListKey[];

  return (
    <div className="mt-8 bg-zinc-800/50 rounded-lg">
      <div className="border-b border-zinc-700">
        <nav className="flex space-x-2 p-2 overflow-x-auto custom-scrollbar">
          {listKeys.map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {listTitles[key]} ({lists[key].length})
            </button>
          ))}
          {isOwnProfile && (
            <button
              key="friends"
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'friends'
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Друзья
            </button>
          )}
        </nav>
      </div>
      <div>
        {activeTab === 'friends' ? (
          <div className="p-4">
            <FriendsList />
          </div>
        ) : (
          <ListTabContent list={lists[activeTab]} />
        )}
      </div>
    </div>
  );
};

export default ProfileLists;