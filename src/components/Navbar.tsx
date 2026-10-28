import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X, Globe, User, BookOpen, Compass, Sparkles, Store, LayoutDashboard, Mic } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    language,
    setLanguage,
    t,
    setShowOnboardingModal,
    openVoiceModal,
    profile,
    updateProfile,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const navItems = [
    { id: 'landing', label: t('navbar.home'), icon: Compass },
    { id: 'opportunities', label: t('navbar.opportunities'), icon: Compass },
    { id: 'skillbridge', label: t('navbar.skillbridge'), icon: BookOpen },
    { id: 'ai_companion', label: t('navbar.aiCompanion'), icon: Sparkles },
    { id: 'business_hub', label: t('navbar.businessHub'), icon: Store },
    { id: 'dashboard', label: t('navbar.demoDashboard'), icon: LayoutDashboard },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
            aria-label="KaamSetu Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#134E3F] text-amber-200 flex items-center justify-center font-bold text-base shadow-sm">
              क
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-[#134E3F] transition-colors whitespace-nowrap">
                KaamSetu
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (4-5 items, clean typography) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
            {navItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-[13.5px] ${
                    active
                      ? 'border-[#134E3F] text-[#134E3F] font-semibold'
                      : 'border-transparent hover:text-stone-900 hover:border-stone-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions - Language toggle & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title="Switch language between English and Hindi"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Voice Command & Search Quick Button */}
            <button
              onClick={() => openVoiceModal('', true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-[#134E3F] hover:text-amber-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs"
              title={language === 'hi' ? 'बोलकर खोजें' : 'Voice Search & Commands'}
              aria-label="Voice Search"
            >
              <Mic className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">{language === 'hi' ? 'बोलें' : 'Voice'}</span>
            </button>

            {/* Accessibility Quick Toggle for Simplified Language */}
            <button
              onClick={() =>
                updateProfile({
                  accessibility: {
                    ...(profile.accessibility || {
                      simplifiedLanguage: false,
                      lowBandwidth: false,
                      highContrast: false,
                      voiceFriendly: true,
                    }),
                    simplifiedLanguage: !profile.accessibility?.simplifiedLanguage,
                  },
                })
              }
              className={`hidden sm:inline-flex px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                profile.accessibility?.simplifiedLanguage
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              title={t('navbar.simpleTextMode')}
            >
              {profile.accessibility?.simplifiedLanguage ? t('common.simplifiedActive') : t('common.simpleMode')}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>{profile.name ? profile.name.split(' ')[0] : t('navbar.findPathway')}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FBF9F5] px-4 py-3 space-y-1 animate-in fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-left transition-colors ${
                  active
                    ? 'bg-[#134E3F] text-white font-medium'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              openVoiceModal('', true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-left bg-stone-100 hover:bg-[#134E3F] hover:text-white transition-colors text-stone-800 font-semibold"
          >
            <Mic className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{language === 'hi' ? 'वॉइस सर्च (बोलकर खोजें)' : 'Voice Command & Search'}</span>
          </button>
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={() =>
                updateProfile({
                  accessibility: {
                    ...profile.accessibility,
                    simplifiedLanguage: !profile.accessibility?.simplifiedLanguage,
                  },
                })
              }
              className={`text-xs font-semibold py-1.5 px-3 rounded-md border transition-colors flex items-center gap-1.5 ${
                profile.accessibility?.simplifiedLanguage
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'text-stone-700 bg-stone-100 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <span>{t('common.simpleMode')}:</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${profile.accessibility?.simplifiedLanguage ? 'bg-amber-200 text-amber-950' : 'bg-stone-200 text-stone-600'}`}>
                {profile.accessibility?.simplifiedLanguage ? t('common.active') : t('common.no')}
              </span>
            </button>
            <button
              onClick={() => {
                setShowOnboardingModal(true);
                setMobileMenuOpen(false);
              }}
              className="text-xs text-[#134E3F] font-semibold py-1.5 px-2 hover:bg-stone-100 rounded"
            >
              {t('navbar.editProfile')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
