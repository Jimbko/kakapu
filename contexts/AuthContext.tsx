import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserAnimeList, SimpleAnime } from '../types';
import { getUserProfile, getUserAnimeLists } from '../services/mockApi';

type ListKey = keyof UserAnimeList;

interface AuthContextType {
  currentUser: UserProfile | null;
  userLists: UserAnimeList | null;
  login: () => Promise<void>;
  logout: () => void;
  isInList: (list: ListKey, animeId: number) => boolean;
  addToList: (list: ListKey, anime: SimpleAnime) => void;
  removeFromList: (list: ListKey, animeId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userLists, setUserLists] = useState<UserAnimeList | null>(null);
  const [loading, setLoading] = useState(true);

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


  const value = { currentUser, userLists, login, logout, isInList, addToList, removeFromList };

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