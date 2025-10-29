import React, { useState, useEffect } from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Link } = ReactRouterDom;
import { getFriendsList } from '../../services/mockApi';
import { User } from '../../types';

const FriendCard: React.FC<{ user: User }> = ({ user }) => (
  <Link 
    to={`/profile/${user.name}`} 
    className="bg-zinc-800/50 p-4 rounded-lg flex flex-col items-center text-center group hover:bg-zinc-700/60 transition-colors duration-200"
  >
    <img 
      src={user.avatar} 
      alt={user.name} 
      className="w-20 h-20 rounded-full mb-3 border-2 border-transparent group-hover:border-purple-500 transition-colors duration-200" 
    />
    <span className="font-semibold text-sm text-white group-hover:text-purple-400 transition-colors duration-200 truncate w-full">{user.name}</span>
  </Link>
);

const FriendCardSkeleton: React.FC = () => (
    <div className="bg-zinc-800/50 p-4 rounded-lg flex flex-col items-center text-center animate-pulse">
        <div className="w-20 h-20 rounded-full bg-zinc-700 mb-3"></div>
        <div className="h-4 bg-zinc-700 rounded w-24"></div>
    </div>
);

export const FriendsList: React.FC = () => {
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            setLoading(true);
            try {
                // In a real app, you'd pass the current user's ID
                const data = await getFriendsList(); 
                setFriends(data);
            } catch (error) {
                console.error("Failed to fetch friends list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    if (loading) {
        return (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <FriendCardSkeleton key={i} />)}
            </div>
        );
    }
    
    if (friends.length === 0) {
        return <p className="text-zinc-500 text-center py-8">Список друзей пуст.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {friends.map(friend => <FriendCard key={friend.id} user={friend} />)}
        </div>
    );
};