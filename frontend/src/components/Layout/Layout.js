import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import UserProfileModal from './UserProfileModal';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function Layout({ children, user, onLogout }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Handle window resize to detect desktop
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch handlers for swipe-to-open
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;

    // Open if swiped right from the left edge (e.g. within 50px of the edge)
    if (isRightSwipe && touchStart < 50 && !isMobileMenuOpen) {
      setIsMobileMenuOpen(true);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('clients'), href: '/clients', icon: UsersIcon },
    { name: t('proposals'), href: '/proposals', icon: DocumentTextIcon },
    { name: t('tasks'), href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: t('time_tracking'), href: '/time', icon: ClockIcon },
    { name: t('integrations'), href: '/integrations', icon: SparklesIcon },
  ];

  const handleLanguageToggle = () => {
    changeLanguage(currentLanguage === 'en' ? 'de' : 'en');
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >

      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
            <SparklesIcon className="h-5 w-5 text-white pr-0.5" />
          </div>
          <h1 className="text-lg font-bold gradient-text group-hover:opacity-80 transition-opacity">AgencySync</h1>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay Background */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          className="fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl lg:shadow-none lg:static lg:flex lg:translate-x-0"
          initial={{ x: isDesktop ? 0 : '-100%' }}
          animate={{ x: isDesktop ? 0 : (isMobileMenuOpen ? 0 : '-100%') }}
          exit={{ x: isDesktop ? 0 : '-100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.x < -100 || velocity.x < -500) {
              setIsMobileMenuOpen(false);
            }
          }}
          // The empty styling allows it to be overridden organically by motion, but we default to flex for desktop
          style={{ display: 'flex' }}
        >
          {/* Logo Area */}
          <div className="flex items-center justify-between h-20 px-8 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <SparklesIcon className="h-6 w-6 text-white pr-0.5" />
              </div>
              <div className="group-hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-bold gradient-text">AgencySync</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">OS</p>
              </div>
            </Link>
            {/* Close button for mobile only */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 -mr-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User & Settings Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4 shrink-0">

            {/* Toggles */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLanguageToggle}
                className="p-2 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Toggle Language"
              >
                <LanguageIcon className="w-5 h-5" />
                {currentLanguage.toUpperCase()}
              </button>
            </div>

            {/* User Card */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full text-left bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.company_name || 'Agency'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full relative pt-16 lg:pt-0">
        <div className="main-content-mesh"></div>
        <div className="relative z-10 w-full h-full overflow-y-auto px-4 py-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* User Profile Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
}

export default Layout;