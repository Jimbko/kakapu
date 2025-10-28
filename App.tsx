import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

// Этот новый компонент создан для того, чтобы можно было использовать хуки роутера, такие как useNavigate
const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Этот эффект обрабатывает специальный запрос пользователя:
    // при обновлении страницы всегда переходить на главную.
    const navigationEntries = performance.getEntriesByType("navigation");
    // FIX: Cast PerformanceEntry to PerformanceNavigationTiming to access the 'type' property.
    if (navigationEntries.length > 0 && (navigationEntries[0] as PerformanceNavigationTiming).type === 'reload') {
      if (location.pathname !== '/') {
        console.log(`Страница перезагружена по адресу ${location.pathname}. Перенаправление на главную согласно запросу.`);
        // Использование replace: true, чтобы не добавлять главную страницу в историю навигации при этом редиректе
        navigate('/', { replace: true });
      }
    }
    // Пустой массив зависимостей гарантирует, что это выполнится только один раз при первоначальной загрузке/обновлении.
  }, []);

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
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;