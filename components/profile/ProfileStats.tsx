import React from 'react';
import { UserProfile } from '../../types';

interface ProfileStatsProps {
  user: UserProfile;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-purple-400">{value}</p>
    <p className="text-xs text-zinc-400 uppercase tracking-wider">{label}</p>
  </div>
);

const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  return (
    <div className="bg-zinc-800/50 p-4 rounded-b-lg">
      <div className="mt-20 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Всего часов" value={Math.round(user.viewingTime.total / 60)} />
        <StatItem label="Дней подряд" value={user.daysInARow} />
        <StatItem label="Пол" value={user.gender} />
        <StatItem label="День рождения" value={user.birthday} />
      </div>
      <div className="mt-6 border-t border-zinc-700 pt-4">
        <h3 className="font-semibold text-white mb-2">О себе</h3>
        <p className="text-sm text-zinc-300 italic">{user.bio}</p>
      </div>
    </div>
  );
};

export default ProfileStats;
