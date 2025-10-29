import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { getUserProfile } from '../services/mockApi';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileLists from '../components/profile/ProfileLists';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { currentUser, userLists, logout } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // We only need to fetch the profile, lists come from context
                const profileData = await getUserProfile(username);
                setUser(profileData);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return <div className="text-center p-8">Загрузка профиля...</div>;
    }

    if (!user || !userLists) {
        return <div className="text-center p-8">Не удалось загрузить профиль.</div>;
    }
    
    const isOwnProfile = currentUser?.nickname === username;

    return (
        <div>
            <ProfileHeader user={user} />
            <ProfileStats user={user} />
            {isOwnProfile && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleLogout}
                        className="bg-zinc-700 hover:bg-zinc-600 text-sm font-semibold px-4 py-2 rounded-md transition-colors"
                    >
                        Выйти из аккаунта
                    </button>
                </div>
            )}
            <ProfileLists lists={userLists} isOwnProfile={isOwnProfile} />
        </div>
    );
};

export default ProfilePage;