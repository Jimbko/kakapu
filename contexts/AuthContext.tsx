import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserAnimeList, SimpleAnime } from '../types';
import { getUserProfile, getUserAnimeLists } from '../services/mockApi';

type ListKey = keyof UserAnimeList;
export type StatusListKey = 'watching' | 'planned' | 'completed' | 'dropped';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AuthContextType {
  currentUser: UserProfile | null;
  userLists: UserAnimeList | null;
  login: () => Promise<void>;
  logout: () => void;
  isInList: (list: ListKey, animeId: number) => boolean;
  addToList: (list: ListKey, anime: SimpleAnime) => void;
  removeFromList: (list: ListKey, animeId: number) => void;
  getAnimeStatus: (animeId: number) => StatusListKey | null;
  setAnimeStatus: (anime: SimpleAnime, status: StatusListKey | null) => void;
  // Modal State
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  // Toast State
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userLists, setUserLists] = useState<UserAnimeList | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('currentUser');
        const storedLists = localStorage.getItem('userLists');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        if (storedLists) {
          setUserLists(JSON.parse(storedLists));
        }
    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        localStorage.clear();
    }
    setLoading(false);
  }, []);

  const login = async () => {
    const user = await getUserProfile('dragger1337');
    const lists = await getUserAnimeLists('dragger1337');
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userLists', JSON.stringify(lists));
    setCurrentUser(user);
    setUserLists(lists);
    closeLoginModal();
    addToast('Вы успешно вошли в аккаунт!', 'success');
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLists');
    setCurrentUser(null);
    setUserLists(null);
  };

  const updateLocalStorageLists = (updatedLists: UserAnimeList) => {
    localStorage.setItem('userLists', JSON.stringify(updatedLists));
  };

  const addToList = (list: ListKey, anime: SimpleAnime) => {
    if (!userLists) return;
    const updatedLists = { ...userLists };
    if (!updatedLists[list].some(item => item.id === anime.id)) {
        updatedLists[list] = [...updatedLists[list], anime];
        setUserLists(updatedLists);
        updateLocalStorageLists(updatedLists);
    }
  };

  const removeFromList = (list: ListKey, animeId: number) => {
    if (!userLists) return;
    const updatedLists = { ...userLists };
    updatedLists[list] = updatedLists[list].filter(item => item.id !== animeId);
    setUserLists(updatedLists);
    updateLocalStorageLists(updatedLists);
  };
  
  const isInList = (list: ListKey, animeId: number): boolean => {
      return userLists?.[list]?.some(item => item.id === animeId) ?? false;
  };
  
  const statusLists: StatusListKey[] = ['watching', 'planned', 'completed', 'dropped'];

  const getAnimeStatus = (animeId: number): StatusListKey | null => {
      if (!userLists) return null;
      for (const list of statusLists) {
          if (userLists[list].some(item => item.id === animeId)) {
              return list;
          }
      }
      return null;
  };

  const setAnimeStatus = (anime: SimpleAnime, status: StatusListKey | null) => {
      if (!userLists) return;
      let updatedLists = { ...userLists };

      // First, remove from all possible status lists
      for (const list of statusLists) {
          updatedLists[list] = updatedLists[list].filter(item => item.id !== anime.id);
      }
      
      // Then, add to the new list if a status is provided
      if (status) {
          updatedLists[status] = [...updatedLists[status], anime];
      }

      setUserLists(updatedLists);
      updateLocalStorageLists(updatedLists);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        removeToast(id);
    }, 3000);
  };

  const removeToast = (id: number) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
  };


  const value = { 
    currentUser, 
    userLists, 
    login, 
    logout, 
    isInList, 
    addToList, 
    removeFromList,
    getAnimeStatus,
    setAnimeStatus,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    toasts,
    addToast
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};