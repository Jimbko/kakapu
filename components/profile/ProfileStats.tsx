import React from 'react';
import { UserProfile } from '../../types';
import { ICONS } from '../../constants';

interface ProfileStatsProps {
  user: UserProfile;
}

const StatItem: React.FC<{ label: string; value: string | number, icon: React.ReactElement }> = ({ label, value, icon }) => (
  <div className="flex items-center space-x-4 p-2">
    <div className="text-3xl text-purple-400">
        {icon}
    </div>
    <div className="text-left">
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-400 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  return (
    <div className="bg-zinc-800/50 p-4 rounded-b-lg">
      <div className="mt-20 md:mt-16 flex flex-wrap justify-around items-center">
        <StatItem label="Всего часов" value={Math.round(user.viewingTime.total / 60)} icon={ICONS.CLOCK} />
        <StatItem label="Дней подряд" value={user.daysInARow} icon={ICONS.FIRE} />
        <StatItem label="Пол" value={user.gender} icon={ICONS.USER}/>
        <StatItem label="День рождения" value={user.birthday} icon={ICONS.CAKE} />
      </div>
      <div className="mt-6 border-t border-zinc-700 pt-4">
        <h3 className="font-semibold text-white mb-2">О себе</h3>
        <p className="text-sm text-zinc-300 italic">{user.bio}</p>
      </div>
    </div>
  );
};

export default ProfileStats;