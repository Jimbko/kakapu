import React, { useState } from 'react';
import { ActivityFeed } from '../components/community/ActivityFeed';
import { PlaceholderContent } from '../components/community/PlaceholderContent';
import { ICONS } from '../constants';

type CommunityTab = 'activity' | 'reviews';

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('activity');

  const renderContent = () => {
    switch (activeTab) {
      case 'activity':
        return <ActivityFeed />;
      case 'reviews':
        return <PlaceholderContent title="Обзоры в разработке" message="Здесь скоро появятся подробные обзоры и рецензии от пользователей." icon={ICONS.REVIEWS} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tab: CommunityTab, label: string}> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === tab 
          ? 'bg-purple-600 text-white' 
          : 'text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Сообщество</h1>
      
      <div className="mb-6 border-b border-zinc-800">
        <nav className="flex space-x-2">
          <TabButton tab="activity" label="Активность" />
          <TabButton tab="reviews" label="Обзоры" />
        </nav>
      </div>

      <div className="fade-in">
        {renderContent()}
      </div>
    </div>
  );
};

export default CommunityPage;