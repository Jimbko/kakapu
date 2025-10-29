import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AnimePage from './pages/AnimePage';
import ProfilePage from './pages/ProfilePage';
import ListPage from './pages/ListPage';
import Top100Page from './pages/Top100Page';
import RandomAnimePage from './pages/RandomAnimePage';
import CommunityPage from './pages/CommunityPage';
import SearchPage from './pages/SearchPage';
import CatalogPage from './pages/CatalogPage';
import { AuthProvider } from './contexts/AuthContext';
import { PosterProvider } from './contexts/PosterContext';
import { cache } from './services/cache';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="anime/:id" element={<AnimePage />} />
        <Route path="profile/:username" element={<ProfilePage />} />
        <Route path="list/:type/:title" element={<ListPage />} />
        <Route path="top100" element={<Top100Page />} />
        <Route path="random" element={<RandomAnimePage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="catalog" element={<CatalogPage />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Clean up expired cache items on application start.
    cache.clearExpired();
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <PosterProvider>
          <AppRoutes />
        </PosterProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
