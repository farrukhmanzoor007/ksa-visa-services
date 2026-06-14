import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { safeLocalStorage } from './utils/storage';

// Pages
import Home from './pages/Home';
import SaudiEvisa from './pages/SaudiEvisa';
import VisaRequirements from './pages/VisaRequirements';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import VisaDetail from './pages/VisaDetail';
import ApplicationForm from './pages/ApplicationForm';
import Payment from './pages/Payment';
import Status from './pages/Status';
import Admin from './pages/Admin';
import { VisaCategory } from './types';

export default function App() {
  // Sync router with location pathname together with queries
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Sync back-forward click events
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    
    // Check persistent administrative session
    const isSaved = safeLocalStorage.getItem('ksa_admin_logged');
    if (isSaved === 'true') {
      setIsAdminLoggedIn(true);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0 });
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    safeLocalStorage.setItem('ksa_admin_logged', 'true');
    setAdminModalOpen(false);
    navigate('/admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    safeLocalStorage.setItem('ksa_admin_logged', 'false');
    navigate('/');
  };

  // Helper to extract query parameters
  const getQueryParams = () => {
    const search = currentPath.split('?')[1] || '';
    const params = new URLSearchParams(search);
    return {
      mode: params.get('mode') || '',
      appId: params.get('appId') || '',
      visa: params.get('visa') as VisaCategory || undefined
    };
  };

  const { mode, appId, visa } = getQueryParams();
  const cleanPath = currentPath.split('?')[0];

  // Router matching
  const renderActivePage = () => {
    // 1. Details Page Matching e.g. /visa/tourist
    if (cleanPath.startsWith('/visa/')) {
      const matchVisaId = cleanPath.split('/visa/')[1];
      return <VisaDetail visaId={matchVisaId} navigate={navigate} />;
    }

    // 2. Main Switch
    switch (cleanPath) {
      case '/':
        return <Home navigate={navigate} />;
      
      case '/saudi-evisa':
        return <SaudiEvisa navigate={navigate} />;

      case '/visa-requirements':
        return <VisaRequirements navigate={navigate} />;

      case '/faq':
        return <FAQ navigate={navigate} />;

      case '/blog':
        return <Blog navigate={navigate} />;

      case '/apply':
        if (mode === 'status') {
          return <Status initialAppId={appId} navigate={navigate} />;
        }
        return <ApplicationForm initialVisaType={visa} navigate={navigate} />;

      case '/payment':
        return <Payment applicationId={appId} navigate={navigate} />;

      case '/admin':
        return (
          <Admin
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginSuccess={handleAdminLoginSuccess}
            navigate={navigate}
          />
        );

      default:
        // 404 fallback to Home
        return <Home navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative selection:bg-emerald-500 selection:text-white" id="main_app_wrapper">
      {/* Dynamic Navigation */}
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
        onOpenAdminLogin={() => {
          if (isAdminLoggedIn) {
            navigate('/admin');
          } else {
            setAdminModalOpen(true);
          }
        }}
      />

      {/* Main Container Viewport with transition */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={cleanPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            id="page_transition_envelope"
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating global footer */}
      <Footer navigate={navigate} />

      {/* QUICK FLOATING ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {adminModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setAdminModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
              
              <Admin
                isAdminLoggedIn={isAdminLoggedIn}
                onLoginSuccess={handleAdminLoginSuccess}
                navigate={navigate}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
