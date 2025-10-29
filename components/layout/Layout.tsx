import React from 'react';
// FIX: Resolve react-router-dom import issue by using a namespace import.
import * as ReactRouterDom from 'react-router-dom';
const { Outlet } = ReactRouterDom;
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from '../common/LoginModal';
import { ToastContainer } from '../common/ToastContainer';

const Layout: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, toasts } = useAuth();
  
  return (
    <div className="bg-zinc-900 text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default Layout;