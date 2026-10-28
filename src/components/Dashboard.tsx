import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  BookOpen,
  Award,
  Bookmark,
  Briefcase,
  Store,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  X,
} from 'lucide-react';
import { Opportunity } from '../types';

export const Dashboard: React.FC = () => {
  const {
    profile,
    opportunities,
    savedOpportunityIds,
    applications,
    skills,
    portfolio,
    business,
    setCurrentView,
    setSelectedOpportunityForDetail,
    setSelectedOpportunityForSkillBridge,
    addPortfolioProject,
    language,
    setShowOnboardingModal,
  } = useApp();

  // Add Project Modal State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Web / Digital');
  const [projDesc, setProjDesc] = useState('');
  const [projSkills, setProjSkills] = useState('');
  const [projLink, setProjLink] = useState('');

  // 1. Recommended Next Action Engine
  const completedSkillsCount = skills.filter((s) => s.completed).length;
  const activeApplicationsCount = applications.length;
  const savedCount = savedOpportunityIds.length;

  let recommendedAction = {
    title: 'Complete your first SkillBridge Challenge',
    desc: 'Demonstrate a practical skill to earn verifiable portfolio evidence that employers trust.',
    ctaText: 'Start Practical Challenge',
    actionView: 'skillbridge',
  };

  if (completedSkillsCount >= 1 && activeApplicationsCount === 0) {
    recommendedAction = {
      title: 'Apply to a matching entry role or internship',
      desc: 'You have verified skill competencies. Review top matching opportunities and submit a demo application.',
      ctaText: 'Explore Matched Roles',
      actionView: 'opportunities',
    };
  } else if (activeApplicationsCount > 0 && !profile.bio) {
    recommendedAction = {
      title: 'Generate an honest Résumé Summary with AI',
      desc: 'Create a crisp 3-sentence summary highlighting your practical skills without fabricated credentials.',
      ctaText: 'Draft Summary',
      actionView: 'ai_companion',
    };
  } else if ((profile?.goals || []).includes('grow_business')) {
    recommendedAction = {
      title: 'Add your services and products to Local Business Hub',
      desc: 'List your items with clear indicative prices and receive simulated client enquiries.',
      ctaText: 'Manage Storefront',
      actionView: 'business_hub',
    };
  }

  // 2. Matched Opportunities (matched with user skills)
  const userSkills = profile?.skills || [];
  const matchedOpportunities = opportunities
    .map((opp) => {
      const matchCount = (opp.skillsRequired || []).filter((sk) =>
        userSkills.includes(sk)
      ).length;
      return { opp, matchCount };
    })
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3)
    .map((item) => item.opp);

  // 3. Saved Opportunities list
  const savedOpportunities = opportunities.filter((o) =>
    savedOpportunityIds.includes(o.id)
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    addPortfolioProject({
      title: projTitle,
      category: projCategory,
      date: 'Recent',
      description: projDesc,
      skillsUsed: projSkills.split(',').map((s) => s.trim()).filter(Boolean),
      proofUrlOrText: projLink || 'Self-verified project submission',
    });

    setProjTitle('');
    setProjDesc('');
    setProjSkills('');
    setProjLink('');
    setShowAddProjectModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Profile Header & Summary */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#134E3F] tracking-wide uppercase">
            <span>Personal Pathway Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>{profile.location}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Welcome back, {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
            {profile.bio ||
              'Building practical competencies and discovering verified employment pathways across India.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowOnboardingModal(true)}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Edit Profile &amp; Goals
          </button>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="bg-[#134E3F] text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended Next Action</span>
          </div>
          <h3 className="text-lg font-bold text-white">{recommendedAction.title}</h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {recommendedAction.desc}
          </p>
        </div>

        <button
          onClick={() => setCurrentView(recommendedAction.actionView)}
          className="px-5 py-2.5 text-xs font-bold text-[#134E3F] bg-white hover:bg-amber-100 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto shrink-0 shadow-sm"
        >
          {recommendedAction.ctaText} →
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Verified Skills
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {completedSkillsCount}
            </span>
            <span className="text-xs text-stone-400">/ {skills.length} available</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Demo Applications
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {applications.length}
            </span>
            <span className="text-xs text-stone-400">active</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Saved Listings
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {savedOpportunityIds.length}
            </span>
            <span className="text-xs text-stone-400">shortlisted</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Storefront Enquiries
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {business.enquiries.length}
            </span>
            <span className="text-xs text-stone-400">messages</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Applications & Matched Opportunities */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Applications Tracker */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#134E3F]" />
                <h3 className="text-base font-bold text-stone-900">
                  Demo Applications &amp; Status Tracker ({applications.length})
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('opportunities')}
                className="text-xs text-[#134E3F] hover:underline font-semibold"
              >
                Apply to more roles
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                You haven't submitted any demo applications yet. Browse the opportunity board to apply!
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-stone-900">
                          {app.opportunityTitle}
                        </h4>
                        <span className="text-[11px] text-stone-500">· {app.organization}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-1">
                        Applied: {app.appliedAt} · Note: {app.notes}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md capitalize">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Opportunities for You */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#134E3F]" />
                <h3 className="text-base font-bold text-stone-900">
                  Top Recommended Opportunities
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('opportunities')}
                className="text-xs text-[#134E3F] hover:underline font-semibold"
              >
                View all ({opportunities.length})
              </button>
            </div>

            <div className="space-y-3">
              {matchedOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-400 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-stone-700">{opp.organization}</span>
                      <span aria-hidden="true">·</span>
                      <span>{opp.location}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{opp.workMode}</span>
                    </div>
                    <h4
                      onClick={() => {
                        setSelectedOpportunityForDetail(opp);
                        setCurrentView('opportunities');
                      }}
                      className="text-sm font-bold text-stone-900 hover:text-[#134E3F] transition-colors cursor-pointer"
                    >
                      {opp.title}
                    </h4>
                    <p className="text-xs font-medium text-[#134E3F]">{opp.stipend}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedOpportunityForSkillBridge(opp);
                        setCurrentView('skillbridge');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      Check Gap
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOpportunityForDetail(opp);
                        setCurrentView('opportunities');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors"
                    >
                      View Role
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Showcase */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#134E3F]" />
                <h3 className="text-base font-bold text-stone-900">
                  Portfolio &amp; Demonstrable Proof ({portfolio.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#134E3F] rounded-lg hover:bg-[#0E3B30] flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                      {proj.category} · {proj.date}
                    </span>
                    <h5 className="text-xs font-bold text-stone-900">{proj.title}</h5>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {proj.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{proj.skillsUsed.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Saved Opportunities & Skill Milestones */}
        <div className="lg:col-span-4 space-y-8">
          {/* Saved Opportunities Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#134E3F]" />
                <h3 className="text-sm font-bold text-stone-900">
                  Saved Opportunities ({savedOpportunities.length})
                </h3>
              </div>
            </div>

            {savedOpportunities.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">
                No saved roles. Click the bookmark icon on any opportunity to save it here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {savedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => {
                      setSelectedOpportunityForDetail(opp);
                      setCurrentView('opportunities');
                    }}
                    className="p-3 bg-[#FBF9F5] border border-stone-200 rounded-xl hover:border-stone-400 transition-colors cursor-pointer space-y-1"
                  >
                    <p className="text-xs font-bold text-stone-900 line-clamp-1">{opp.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>{opp.organization}</span>
                      <span className="font-semibold text-[#134E3F]">{opp.stipend}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Progress & Milestones */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#134E3F]" />
                <h3 className="text-sm font-bold text-stone-900">
                  Skill Milestones
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('skillbridge')}
                className="text-xs text-[#134E3F] hover:underline font-semibold"
              >
                Go to Hub
              </button>
            </div>

            <div className="space-y-2.5">
              {skills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-stone-900">{sk.name}</p>
                    <span className="text-[11px] text-stone-500 capitalize">{sk.category}</span>
                  </div>
                  {sk.completed ? (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Verified ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOpportunityForSkillBridge(opportunities[0]);
                        setCurrentView('skillbridge');
                      }}
                      className="text-[11px] text-amber-800 hover:underline font-medium"
                    >
                      Practice →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Local Business Snapshot */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Store className="w-4 h-4 text-amber-700" />
              <span>Local Business Snapshot</span>
            </div>
            <p className="text-xs text-amber-950 font-semibold">{business.businessName}</p>
            <p className="text-xs text-amber-900/80 line-clamp-2">{business.tagline}</p>
            <div className="pt-2 border-t border-amber-200 text-xs text-amber-950 flex items-center justify-between">
              <span>{business.services.length} services listed</span>
              <button
                onClick={() => setCurrentView('business_hub')}
                className="font-bold underline hover:text-amber-800"
              >
                Open Hub →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h4 className="text-sm font-bold text-stone-900">Add Portfolio Project</h4>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Project Title</label>
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Solar Installation Quotation Calculator"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category</label>
                <input
                  type="text"
                  value={projCategory}
                  onChange={(e) => setProjCategory(e.target.value)}
                  placeholder="e.g. Clean Energy, Web Design, Operations"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Skills Used (comma-separated)</label>
                <input
                  type="text"
                  value={projSkills}
                  onChange={(e) => setProjSkills(e.target.value)}
                  placeholder="e.g. Solar Wiring, Google Sheets, Customer Comm"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Project Description</label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="What problem did you solve? How did you build or execute it?"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Live Proof / Link (Optional)</label>
                <input
                  type="text"
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[#134E3F] rounded-lg"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
