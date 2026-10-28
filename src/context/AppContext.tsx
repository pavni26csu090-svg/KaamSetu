import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Opportunity,
  Application,
  SkillItem,
  PortfolioProject,
  BusinessProfile,
  BusinessService,
  BusinessListing,
  ToastMessage,
  Language,
} from '../types';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_OPPORTUNITIES,
  INITIAL_SKILLS,
  INITIAL_PORTFOLIO,
  INITIAL_BUSINESS_PROFILE,
  DEMO_PERSONAS,
  UI_TRANSLATIONS,
} from '../data/sampleData';

interface AppContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loadPersona: (personaId: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof UI_TRANSLATIONS['en'];

  currentView: string;
  setCurrentView: (view: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTypeFilter: string;
  setSelectedTypeFilter: (filter: string) => void;
  preselectedConstraint: { noDegreeOnly?: boolean; flexibleOnly?: boolean };
  setPreselectedConstraint: (constraints: { noDegreeOnly?: boolean; flexibleOnly?: boolean }) => void;
  navigateToAudience: (audience: 'students' | 'underserved' | 'career_seekers' | 'business') => void;

  opportunities: Opportunity[];
  savedOpportunityIds: string[];
  toggleSaveOpportunity: (id: string) => void;
  isOpportunitySaved: (id: string) => boolean;

  applications: Application[];
  submitApplication: (opportunityId: string, notes: string, portfolioLink?: string) => boolean;

  skills: SkillItem[];
  completeSkillChallenge: (skillId: string, evidenceNotes: string, addPortfolio?: boolean) => void;

  portfolio: PortfolioProject[];
  addPortfolioProject: (project: Omit<PortfolioProject, 'id'>) => void;

  business: BusinessProfile;
  updateBusiness: (updates: Partial<BusinessProfile>) => void;
  addBusinessService: (service: Omit<BusinessService, 'id'>) => void;
  addBusinessListing: (listing: Omit<BusinessListing, 'id' | 'applicantCount'>) => void;
  replyToEnquiry: (enquiryId: string, replyNote: string) => void;
  generateSimulatedEnquiry: () => void;

  selectedOpportunityForDetail: Opportunity | null;
  setSelectedOpportunityForDetail: (opp: Opportunity | null) => void;
  selectedOpportunityForSkillBridge: Opportunity | null;
  setSelectedOpportunityForSkillBridge: (opp: Opportunity | null) => void;

  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;

  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'kaamsetu_profile_v1',
  SAVED_OPPS: 'kaamsetu_saved_opps_v1',
  APPLICATIONS: 'kaamsetu_applications_v1',
  SKILLS: 'kaamsetu_skills_v1',
  PORTFOLIO: 'kaamsetu_portfolio_v1',
  BUSINESS: 'kaamsetu_business_v1',
  VIEW: 'kaamsetu_view_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Profile State with deep safe fallback
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!saved) return DEFAULT_USER_PROFILE;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        accessibility: {
          ...DEFAULT_USER_PROFILE.accessibility,
          ...(parsed.accessibility || {}),
        },
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : DEFAULT_USER_PROFILE.skills,
        goals: Array.isArray(parsed.goals) && parsed.goals.length > 0 ? parsed.goals : DEFAULT_USER_PROFILE.goals,
      };
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // 2. Navigation View State (default strictly to public landing page)
  const [currentView, setCurrentViewState] = useState<string>('landing');

  // Search & Pre-Filter State shared between Homepage & Explorer
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [preselectedConstraint, setPreselectedConstraint] = useState<{
    noDegreeOnly?: boolean;
    flexibleOnly?: boolean;
  }>({});

  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAudience = (audience: 'students' | 'underserved' | 'career_seekers' | 'business') => {
    if (audience === 'students') {
      setSelectedTypeFilter('internship');
      setSearchQuery('');
      setPreselectedConstraint({});
      setCurrentView('opportunities');
      addToast({
        type: 'info',
        title: 'Student Pathway',
        description: 'Filtered to internships and entry-level positions.',
      });
    } else if (audience === 'underserved') {
      setSelectedTypeFilter('local_work');
      setSearchQuery('');
      setPreselectedConstraint({ noDegreeOnly: true, flexibleOnly: true });
      setCurrentView('opportunities');
      addToast({
        type: 'info',
        title: 'Accessible Local Work',
        description: 'Filtered to dignified local work with no degree requirement.',
      });
    } else if (audience === 'career_seekers') {
      setCurrentView('skillbridge');
      addToast({
        type: 'info',
        title: 'Career Seekers Hub',
        description: 'Explore missing skills and start a practical SkillBridge challenge.',
      });
    } else if (audience === 'business') {
      setCurrentView('business_hub');
      addToast({
        type: 'info',
        title: 'Small Business Hub',
        description: 'Showcase your local services and post short-term work gigs.',
      });
    }
  };

  // 3. Opportunities State
  const [opportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_OPPS);
      return saved ? JSON.parse(saved) : ['opp-1'];
    } catch {
      return ['opp-1'];
    }
  });

  // 4. Applications State
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'app-sample-1',
              opportunityId: 'opp-1',
              opportunityTitle: 'Junior Web Developer Intern',
              organization: 'UrbanCraft Labs',
              appliedAt: '2 days ago',
              status: 'under_review',
              notes: 'Demonstrated HTML/CSS SkillBridge challenge project on mobile layouts.',
              portfolioLink: 'https://github.com/example/pooja-demos',
            },
          ];
    } catch {
      return [];
    }
  });

  // 5. Skills State
  const [skills, setSkills] = useState<SkillItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKILLS);
      return saved ? JSON.parse(saved) : INITIAL_SKILLS;
    } catch {
      return INITIAL_SKILLS;
    }
  });

  // 6. Portfolio State
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
    } catch {
      return INITIAL_PORTFOLIO;
    }
  });

  // 7. Business State
  const [business, setBusiness] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUSINESS);
      return saved ? JSON.parse(saved) : INITIAL_BUSINESS_PROFILE;
    } catch {
      return INITIAL_BUSINESS_PROFILE;
    }
  });

  // 8. Modals & Detail Selection State
  const [selectedOpportunityForDetail, setSelectedOpportunityForDetail] = useState<Opportunity | null>(null);
  const [selectedOpportunityForSkillBridge, setSelectedOpportunityForSkillBridge] = useState<Opportunity | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  // 9. Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_OPPS, JSON.stringify(savedOpportunityIds));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [savedOpportunityIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [skills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [portfolio]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(business));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [business]);

  // Helpers
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
      accessibility: {
        ...prev.accessibility,
        ...(updates.accessibility || {}),
      },
    }));
    addToast({
      type: 'success',
      title: 'Profile Updated',
      description: 'Your preferences and pathway settings are saved.',
    });
  };

  const setLanguage = (lang: Language) => {
    updateProfile({ language: lang });
  };

  const language = profile.language || 'en';
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const loadPersona = (personaId: string) => {
    const found = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (!found) return;

    setProfile((prev) => ({
      ...prev,
      name: found.name,
      goals: found.goals,
      skills: found.skills,
      interests: found.interests,
      location: found.location,
      availability: found.availability,
      educationLevel: found.educationLevel,
      bio: found.bio,
    }));

    addToast({
      type: 'info',
      title: `Loaded Demo Profile: ${found.name}`,
      description: `Persona preset applied for ${found.roleTag}.`,
    });
  };

  const toggleSaveOpportunity = (id: string) => {
    setSavedOpportunityIds((prev) => {
      const exists = prev.includes(id);
      const opp = opportunities.find((o) => o.id === id);
      if (exists) {
        addToast({
          type: 'info',
          title: 'Removed from Saved',
          description: opp ? opp.title : undefined,
        });
        return prev.filter((item) => item !== id);
      } else {
        addToast({
          type: 'success',
          title: 'Opportunity Saved',
          description: opp ? `Saved "${opp.title}" to your dashboard.` : undefined,
        });
        return [...prev, id];
      }
    });
  };

  const isOpportunitySaved = (id: string) => savedOpportunityIds.includes(id);

  const submitApplication = (opportunityId: string, notes: string, portfolioLink?: string) => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp) return false;

    const alreadyApplied = applications.some((a) => a.opportunityId === opportunityId);
    if (alreadyApplied) {
      addToast({
        type: 'warning',
        title: 'Already Applied',
        description: 'You have already submitted a demo application for this role.',
      });
      return false;
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      opportunityId,
      opportunityTitle: opp.title,
      organization: opp.organization,
      appliedAt: 'Just now',
      status: 'submitted',
      notes: notes || 'Applied via KaamSetu verified pathway.',
      portfolioLink: portfolioLink || profile.portfolioUrl,
    };

    setApplications((prev) => [newApp, ...prev]);
    addToast({
      type: 'success',
      title: 'Demo Application Submitted!',
      description: `Application for "${opp.title}" is now recorded in your Dashboard.`,
    });
    return true;
  };

  const completeSkillChallenge = (skillId: string, evidenceNotes: string, addPortfolio = true) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === skillId) {
          return {
            ...s,
            completed: true,
            completionDate: new Date().toISOString().split('T')[0],
            evidenceNotes,
          };
        }
        return s;
      })
    );

    const targetSkill = skills.find((s) => s.id === skillId);
    if (targetSkill && addPortfolio) {
      const newProject: PortfolioProject = {
        id: `proj-${Date.now()}`,
        title: `${targetSkill.name}: ${targetSkill.challenge.title}`,
        category: targetSkill.category,
        date: 'Today',
        description: evidenceNotes || `Completed practical SkillBridge challenge for ${targetSkill.name}.`,
        skillsUsed: [targetSkill.name],
        proofUrlOrText: 'Verified via KaamSetu practical challenge rubric submission.',
      };
      setPortfolio((prev) => [newProject, ...prev]);
    }

    // Also auto-add this skill to user's profile if not present
    if (targetSkill && !profile.skills.includes(targetSkill.name)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, targetSkill.name],
      }));
    }

    addToast({
      type: 'success',
      title: 'Skill Challenge Verified!',
      description: `Congratulations! "${targetSkill?.name}" added to your completed competencies & portfolio.`,
    });
  };

  const addPortfolioProject = (project: Omit<PortfolioProject, 'id'>) => {
    const newProj: PortfolioProject = {
      ...project,
      id: `proj-${Date.now()}`,
    };
    setPortfolio((prev) => [newProj, ...prev]);
    addToast({
      type: 'success',
      title: 'Portfolio Project Added',
      description: `"${newProj.title}" is now showcased in your portfolio.`,
    });
  };

  const updateBusiness = (updates: Partial<BusinessProfile>) => {
    setBusiness((prev) => ({ ...prev, ...updates }));
    addToast({
      type: 'success',
      title: 'Business Profile Updated',
      description: 'Your local storefront changes are saved.',
    });
  };

  const addBusinessService = (service: Omit<BusinessService, 'id'>) => {
    const newSrv: BusinessService = {
      ...service,
      id: `srv-${Date.now()}`,
    };
    setBusiness((prev) => ({
      ...prev,
      services: [...prev.services, newSrv],
    }));
    addToast({
      type: 'success',
      title: 'Service Added',
      description: `"${newSrv.name}" is now listed on your storefront.`,
    });
  };

  const addBusinessListing = (listing: Omit<BusinessListing, 'id' | 'applicantCount'>) => {
    const newListing: BusinessListing = {
      ...listing,
      id: `lst-${Date.now()}`,
      applicantCount: 0,
    };
    setBusiness((prev) => ({
      ...prev,
      listings: [newListing, ...prev.listings],
    }));
    addToast({
      type: 'success',
      title: 'Work Opportunity Posted',
      description: `"${newListing.title}" is now visible to local job seekers.`,
    });
  };

  const replyToEnquiry = (enquiryId: string, replyNote: string) => {
    setBusiness((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => {
        if (e.id === enquiryId) {
          return {
            ...e,
            status: 'replied',
            replyNote,
          };
        }
        return e;
      }),
    }));
    addToast({
      type: 'success',
      title: 'Reply Sent to Customer',
      description: 'Enquiry updated and marked as replied.',
    });
  };

  const generateSimulatedEnquiry = () => {
    const sampleNames = ['Kavita Rao', 'Arun Singhania', 'Siddharth Nair', 'Priyanka Sen', 'Aditya Joshi'];
    const sampleQueries = [
      'Hi! Do you offer customization for wedding return gifts? We need around 30 pieces delivered next month.',
      'Hello, I saw your workshop listing. Can you share if beginners can attend this weekend?',
      'Do you have wholesale rates for orders above ₹10,000 for retail boutiques?',
      'Could you share delivery timeline and UPI payment QR code for the table runner?',
    ];

    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    const targetService = business.services[0]?.name || 'Custom Artisan Order';

    const newEnq = {
      id: `enq-${Date.now()}`,
      customerName: randomName,
      customerContact: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      serviceInterested: targetService,
      message: randomQuery,
      receivedAt: 'Just now',
      status: 'unread' as const,
    };

    setBusiness((prev) => ({
      ...prev,
      enquiries: [newEnq, ...prev.enquiries],
    }));

    addToast({
      type: 'info',
      title: 'New Simulated Customer Enquiry!',
      description: `Message from ${randomName} regarding "${targetService}".`,
    });
  };

  const resetAllDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.SAVED_OPPS);
      localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
      localStorage.removeItem(STORAGE_KEYS.SKILLS);
      localStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
      localStorage.removeItem(STORAGE_KEYS.BUSINESS);
      localStorage.removeItem(STORAGE_KEYS.VIEW);
    } catch (e) {
      console.warn('Storage clear error', e);
    }

    setProfile(DEFAULT_USER_PROFILE);
    setSavedOpportunityIds(['opp-1']);
    setApplications([
      {
        id: 'app-sample-1',
        opportunityId: 'opp-1',
        opportunityTitle: 'Junior Web Developer Intern',
        organization: 'UrbanCraft Labs',
        appliedAt: '2 days ago',
        status: 'under_review',
        notes: 'Demonstrated HTML/CSS SkillBridge challenge project on mobile layouts.',
        portfolioLink: 'https://github.com/example/pooja-demos',
      },
    ]);
    setSkills(INITIAL_SKILLS);
    setPortfolio(INITIAL_PORTFOLIO);
    setBusiness(INITIAL_BUSINESS_PROFILE);
    setCurrentViewState('landing');

    addToast({
      type: 'success',
      title: 'Demo Data Reset',
      description: 'All sample data has been restored to default demo state.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        loadPersona,
        language,
        setLanguage,
        t,

        currentView,
        setCurrentView,

        searchQuery,
        setSearchQuery,
        selectedTypeFilter,
        setSelectedTypeFilter,
        preselectedConstraint,
        setPreselectedConstraint,
        navigateToAudience,

        opportunities,
        savedOpportunityIds,
        toggleSaveOpportunity,
        isOpportunitySaved,

        applications,
        submitApplication,

        skills,
        completeSkillChallenge,

        portfolio,
        addPortfolioProject,

        business,
        updateBusiness,
        addBusinessService,
        addBusinessListing,
        replyToEnquiry,
        generateSimulatedEnquiry,

        selectedOpportunityForDetail,
        setSelectedOpportunityForDetail,
        selectedOpportunityForSkillBridge,
        setSelectedOpportunityForSkillBridge,

        toasts,
        addToast,
        removeToast,

        showOnboardingModal,
        setShowOnboardingModal,

        resetAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
