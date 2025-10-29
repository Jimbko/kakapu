import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCommunityActivityFeed } from '../../services/mockApi';
import { ActivityItem } from '../../types';
import { ICONS } from '../../constants';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const ActivityCard: React.FC<{ item: ActivityItem }> = ({ item }) => {
    
    const getActionText = () => {
        switch(item.type) {
            case 'comment': return 'прокомментировал(а)';
            case 'status_update': return ''; // The content itself is the action
            case 'review': return 'написал(а) обзор на';
            default: return 'совершил(а) действие с';
        }
    };

    const getIcon = () => {
        switch(item.type) {
            case 'comment': return ICONS.COMMENTS;
            case 'status_update': return ICONS.LIST;
            case 'review': return ICONS.REVIEWS;
            default: return null;
        }
    }

    return (
        <div className="bg-zinc-800/50 p-4 rounded-lg flex space-x-4">
            <Link to={`/profile/${item.user.name}`} className="flex-shrink-0">
                <img src={item.user.avatar} alt={item.user.name} className="w-10 h-10 rounded-full" />
            </Link>
            <div className="flex-grow overflow-hidden">
                <div className="text-sm text-zinc-400 mb-1">
                    <Link to={`/profile/${item.user.name}`} className="font-bold text-purple-400 hover:underline">{item.user.name}</Link>
                    {' '}{getActionText()}{' '}
                    <Link to={`/anime/${item.relatedAnime.id}`} className="font-bold text-white hover:underline">{item.relatedAnime.name}</Link>
                    <span className="text-zinc-500"> · {item.timestamp}</span>
                </div>
                <div className="bg-zinc-700/50 p-3 rounded-md text-zinc-300 text-sm italic">
                    <div className="flex space-x-2">
                        <span className="text-zinc-400 flex-shrink-0">{getIcon()}</span>
                        <p className="line-clamp-3">{item.content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const ActivityFeed: React.FC = () => {
    const [feed, setFeed] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            setLoading(true);
            try {
                const data = await getCommunityActivityFeed();
                setFeed(data);
            } catch (error) {
                console.error("Failed to fetch activity feed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    if (loading) {
        return <LoadingSpinner message="Загрузка активности..." />;
    }

    return (
        <div className="space-y-4">
            {feed.map(item => (
                <ActivityCard key={item.id} item={item} />
            ))}
        </div>
    );
};