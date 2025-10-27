import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserProfile, UserAnimeList } from '../types';
import { getUserProfile, getUserAnimeLists } from '../services/mockApi';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileLists from '../components/profile/ProfileLists';

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [lists, setLists] = useState<UserAnimeList | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [profileData, listsData] = await Promise.all([
                    getUserProfile(username),
                    getUserAnimeLists(username),
                ]);
                setUser(profileData);
                setLists(listsData);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username]);

    if (loading) {
        return <div className="text-center p-8">Загрузка профиля...</div>;
    }

    if (!user || !lists) {
        return <div className="text-center p-8">Не удалось загрузить профиль.</div>;
    }

    return (
        <div>
            <ProfileHeader user={user} />
            <ProfileStats user={user} />
            <ProfileLists lists={lists} />
        </div>
    );
};

export default ProfilePage;
