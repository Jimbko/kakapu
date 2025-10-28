import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserAnimeList, ShikimoriAnime } from '../../types';
import { getAnimeByIds } from '../../services/shikimori';

interface ProfileListsProps {
  lists: UserAnimeList;
}

type ListKey = keyof UserAnimeList;

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
        return;
      }
      setLoading(true);
      const ids = list.map(item => item.id);
      try {
        const data = await getAnimeByIds(ids);
        setAnimeDetails(data);
      } catch (error) {
        console.error("Failed to fetch anime details for list", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [list]);

  if (loading) {
    return <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4">
        {Array.from({ length: list.length }).map((_, i) => (
             <div key={i} className="aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse"></div>
        ))}
    </div>;
  }
  
  if (animeDetails.length === 0) {
      return <div className="p-8 text-center text-zinc-500">Список пуст.</div>
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4">
      {animeDetails.map(anime => (
        <Link to={`/anime/${anime.id}`} key={anime.id} className="group">
          <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden">
            <img 
              src={anime.image.preview} 
              alt={anime.russian}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>
      ))}
    </div>
  );
};


export const ProfileLists: React.FC<ProfileListsProps> = ({ lists }) => {
  const [activeTab, setActiveTab] = useState<ListKey>('watching');
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
        </nav>
      </div>
      <div>
        <ListTabContent list={lists[activeTab]} />
      </div>
    </div>
  );
};

export default ProfileLists;