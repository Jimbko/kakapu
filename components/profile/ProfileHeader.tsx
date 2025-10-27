import React from 'react';
import { UserProfile } from '../../types';

interface ProfileHeaderProps {
  user: UserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="relative">
      <div className="h-48 md:h-64 bg-zinc-800 rounded-t-lg overflow-hidden">
        <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-32 md:top-40 left-6 md:left-10 flex items-end space-x-4">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-zinc-900 bg-zinc-800 overflow-hidden">
          <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{user.nickname}</h1>
          <p className="text-sm text-zinc-400">Зарегистрирован {user.registrationDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
