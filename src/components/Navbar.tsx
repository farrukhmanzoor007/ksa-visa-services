import React, { useState } from 'react';
import { Menu, X, Landmark, Compass, HelpCircle, FileText, CheckCircle, ShieldAlert, Laptop, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VISA_TYPES } from '../utils/visaData';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  onOpenAdminLogin: () => void;
}

export default function Navbar({ currentPath, navigate, isAdminLoggedIn, onLogoutAdmin, onOpenAdminLogin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visaDropdownOpen, setVisaDropdownOpen] = useState(false);

  const navItems = [
    { title: 'Saudi eVisa Guide', path: '/saudi-evisa', icon: Compass },
    { title: 'Requirements', path: '/visa-requirements', icon: FileText },
    { title: 'FAQs', path: '/faq', icon: HelpCircle },
    { title: 'Blog', path: '/blog', icon: Laptop },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setVisaDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs backdrop-blur-md bg-white/95" id="header_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('/')} 
              className="flex items-center space-x-2.5 cursor-pointer text-left"
              id="logo-button"
            >
              <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/10">
                <Landmark size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="block font-display text-xl font-bold tracking-tight text-slate-900 leading-none">KSA VISA</span>
                <span className="block font-sans text-xs font-semibold text-emerald-600 tracking-wider uppercase mt-1">Services</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1.5 lg:space-x-4">
            {/* Visa Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setVisaDropdownOpen(true)}
              onMouseLeave={() => setVisaDropdownOpen(false)}
            >
              <button 
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPath.startsWith('/visa/') ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                <span>Visa Types</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${visaDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {visaDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-0 w-64 rounded-xl bg-white shadow-xl border border-slate-100 py-2.5"
                  >
                    {VISA_TYPES.map((visa) => (
                      <button
                        key={visa.id}
                        onClick={() => handleNavClick(`/visa/${visa.id}`)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors flex flex-col cursor-pointer"
                      >
                        <span className="font-semibold">{visa.name}</span>
                        <span className="text-slate-400 text-xs truncate">{visa.validity}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* General Pages */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={15} className="opacity-70" />
                  <span>{item.title}</span>
                </button>
              );
            })}

            {/* Tracker status */}
            <button
              onClick={() => handleNavClick('/apply?mode=status')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPath.includes('mode=status') ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle size={15} className="text-emerald-600" />
              <span>Track Status</span>
            </button>
          </div>

          {/* Action Call / Admin CTA Panel */}
          <div className="hidden md:flex items-center space-x-3">
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleNavClick('/admin')}
                  className="px-4 py-2 border border-emerald-600/20 text-emerald-800 bg-emerald-50 rounded-lg text-xs font-semibold hover:bg-emerald-100/50 transition-colors cursor-pointer"
                >
                  Admin Panel
                </button>
                <button 
                  onClick={onLogoutAdmin}
                  className="px-3.5 py-2 text-slate-500 hover:text-red-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAdminLogin}
                className="text-slate-500 hover:text-emerald-600 text-xs font-medium px-2 py-1 transition-colors cursor-pointer"
              >
                Admin Portal
              </button>
            )}

            <button
              onClick={() => handleNavClick('/apply')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all tracking-tight cursor-pointer"
            >
              Apply Online
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-emerald-600 p-2 rounded-lg hover:bg-slate-50 focus:outline-hidden"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-100 bg-white"
          >
            <div className="px-4 pt-3 pb-6 space-y-1.5 shadow-inner">
              <span className="block px-3 py-1 text-slate-400 text-xs font-bold uppercase tracking-wider">Visa Categories</span>
              {VISA_TYPES.map((visa) => (
                <button
                  key={visa.id}
                  onClick={() => handleNavClick(`/visa/${visa.id}`)}
                  className="w-full text-left pl-6 pr-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer block"
                >
                  {visa.name}
                </button>
              ))}

              <div className="my-3 border-t border-slate-100 pt-3"></div>
              <span className="block px-3 py-1 text-slate-400 text-xs font-bold uppercase tracking-wider">Information</span>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                  >
                    <Icon size={16} className="text-slate-400" />
                    <span>{item.title}</span>
                  </button>
                );
              })}

              <button
                onClick={() => handleNavClick('/apply?mode=status')}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
              >
                <CheckCircle size={16} className="text-emerald-600" />
                <span>Track Application Status</span>
              </button>

              <div className="my-3 border-t border-slate-100 pt-3"></div>

              {isAdminLoggedIn ? (
                <div className="flex flex-col space-y-2 px-3 pt-2">
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className="w-full py-2.5 text-center text-sm font-bold border border-emerald-600/30 text-emerald-800 bg-emerald-50 rounded-xl"
                  >
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onLogoutAdmin();
                      setIsOpen(false);
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-red-500 hover:underline"
                  >
                    Log Out of Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAdminLogin();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-emerald-600"
                >
                  Admin Portal Login
                </button>
              )}

              <button
                onClick={() => handleNavClick('/apply')}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-center text-white text-sm font-bold py-3 px-4 rounded-xl shadow-xs"
              >
                Apply Online Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
