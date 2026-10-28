import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingHero } from './components/LandingHero';
import { OpportunityExplorer } from './components/OpportunityExplorer';
import { SkillBridge } from './components/SkillBridge';
import { AICareerCompanion } from './components/AICareerCompanion';
import { LocalBusinessHub } from './components/LocalBusinessHub';
import { Dashboard } from './components/Dashboard';
import { OnboardingModal } from './components/OnboardingModal';
import { ToastContainer } from './components/Toast';

const AppContent: React.FC = () => {
  const { currentView, profile, updateProfile, t, language } = useApp();
  const isSimpleMode = Boolean(profile.accessibility?.simplifiedLanguage);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        profile.accessibility?.highContrast
          ? 'bg-white text-black'
          : 'bg-[#FBF9F5] text-stone-900'
      } ${isSimpleMode ? 'simple-mode text-base' : ''}`}
    >
      {/* Top Navigation */}
      <Navbar />

      {/* Simple Mode Active Accessibility Banner */}
      {isSimpleMode && (
        <aside
          role="region"
          aria-label={t('common.simpleModeBannerTitle')}
          className="bg-amber-50 border-b border-amber-200/90 text-amber-950 px-4 py-2.5 transition-all shadow-xs"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                {t('common.simpleModeBadge')}
              </span>
              <p className="font-medium text-amber-900">
                {t('common.simpleModeBannerDesc')}
              </p>
            </div>
            <button
              onClick={() =>
                updateProfile({
                  accessibility: {
                    ...profile.accessibility,
                    simplifiedLanguage: false,
                  },
                })
              }
              className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-md border border-amber-300 shadow-2xs transition-colors"
            >
              ✕ {t('common.turnOffSimpleMode')}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && <LandingHero />}
        {currentView === 'opportunities' && <OpportunityExplorer />}
        {currentView === 'skillbridge' && <SkillBridge />}
        {currentView === 'ai_companion' && <AICareerCompanion />}
        {currentView === 'business_hub' && <LocalBusinessHub />}
        {currentView === 'dashboard' && <Dashboard />}
      </main>

      {/* Global Modals & Notifications */}
      <OnboardingModal />
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
