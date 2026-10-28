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
  const { currentView, profile } = useApp();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        profile.accessibility.highContrast
          ? 'bg-white text-black'
          : 'bg-[#FBF9F5] text-stone-900'
      }`}
    >
      {/* Top Navigation */}
      <Navbar />

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
