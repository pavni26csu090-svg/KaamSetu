import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  Check,
  X,
  Info,
  ShieldAlert,
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Opportunity, OpportunityCategory, OpportunityType, WorkMode } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { getLocalizedOpp } from '../utils/localization';
import {
  OPPORTUNITY_CATEGORIES,
  getCategoryShortLabel,
  calculateOpportunityRelevance,
} from '../utils/opportunityRelevance';

export const OpportunityExplorer: React.FC = () => {
  const {
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    isOpportunitySaved,
    submitApplication,
    applications,
    language,
    t,
    setCurrentView,
    selectedOpportunityForDetail,
    setSelectedOpportunityForDetail,
    selectedOpportunityForSkillBridge,
    setSelectedOpportunityForSkillBridge,
    profile,
    searchQuery,
    setSearchQuery,
    selectedTypeFilter,
    setSelectedTypeFilter,
    preselectedConstraint,
    setPreselectedConstraint,
  } = useApp();

  // Local filter states with context synchronization
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | 'all'>('all');
  const [onlyHighFit, setOnlyHighFit] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [onlyNoDegree, setOnlyNoDegree] = useState<boolean>(Boolean(preselectedConstraint.noDegreeOnly));
  const [onlyFlexible, setOnlyFlexible] = useState<boolean>(Boolean(preselectedConstraint.flexibleOnly));
  const [onlyEquipmentProvided, setOnlyEquipmentProvided] = useState<boolean>(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: opportunities.length };
    for (const opp of opportunities) {
      counts[opp.category] = (counts[opp.category] || 0) + 1;
    }
    return counts;
  }, [opportunities]);

  // Sync when preselectedConstraint changes
  React.useEffect(() => {
    if (preselectedConstraint.noDegreeOnly !== undefined) {
      setOnlyNoDegree(Boolean(preselectedConstraint.noDegreeOnly));
    }
    if (preselectedConstraint.flexibleOnly !== undefined) {
      setOnlyFlexible(Boolean(preselectedConstraint.flexibleOnly));
    }
  }, [preselectedConstraint]);

  // Modal State synced with context
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<Opportunity | null>(selectedOpportunityForDetail);

  React.useEffect(() => {
    if (selectedOpportunityForDetail) {
      setSelectedOppForDetail(selectedOpportunityForDetail);
    }
  }, [selectedOpportunityForDetail]);
  const [oppToApply, setOppToApply] = useState<Opportunity | null>(null);
  const [applyCoverNote, setApplyCoverNote] = useState('');
  const [applyPortfolioUrl, setApplyPortfolioUrl] = useState(profile.portfolioUrl || '');

  const isSimpleMode = Boolean(profile.accessibility?.simplifiedLanguage);

  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Application Confirmation Modal state
  const [submittedAppSummary, setSubmittedAppSummary] = useState<{
    oppTitle: string;
    organization: string;
    resumeName?: string;
    resumeSize?: number;
    portfolioUrl?: string;
    coverNote?: string;
    date: string;
  } | null>(null);

  // Filtered List with safe null checks and relevance calculation
  const filteredOpportunities = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();

    return opportunities
      .map((opp) => ({
        rawOpp: opp,
        relevance: calculateOpportunityRelevance(opp, profile),
      }))
      .filter(({ rawOpp: opp, relevance }) => {
        // Keyword search (title, org, skills, location)
        if (q) {
          const title = opp.title.toLowerCase();
          const titleHi = (opp.titleHi || '').toLowerCase();
          const org = opp.organization.toLowerCase();
          const orgHi = (opp.organizationHi || '').toLowerCase();
          const loc = opp.location.toLowerCase();
          const skills = (opp.skillsRequired || []).map((s) => s.toLowerCase());

          const matchesTitle = title.includes(q) || titleHi.includes(q);
          const matchesOrg = org.includes(q) || orgHi.includes(q);
          const matchesLoc = loc.includes(q);
          const matchesSkill = skills.some((s) => s.includes(q));

          if (!matchesTitle && !matchesOrg && !matchesLoc && !matchesSkill) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && opp.category !== selectedCategory) {
          return false;
        }

        // Recommended / High Fit toggle
        if (onlyHighFit && !relevance.isHighFit) {
          return false;
        }

        // Type filter (supports 'all', exact type, or 'students' which matches internships + entry_level)
        if (selectedTypeFilter !== 'all') {
          if (selectedTypeFilter === 'students') {
            if (opp.type !== 'internship' && opp.type !== 'entry_level') return false;
          } else if (opp.type !== selectedTypeFilter) {
            return false;
          }
        }

        // Mode filter
        if (selectedMode !== 'all' && opp.workMode !== selectedMode) return false;

        // Practical constraints with safe chaining
        if (onlyNoDegree && !opp.practicalConstraints?.noDegreeRequired) return false;
        if (onlyFlexible && !opp.practicalConstraints?.flexibleHours) return false;
        if (onlyEquipmentProvided && !opp.practicalConstraints?.equipmentProvided) return false;

        return true;
      })
      .sort((a, b) => b.relevance.score - a.relevance.score);
  }, [
    opportunities,
    profile,
    searchQuery,
    selectedCategory,
    onlyHighFit,
    selectedTypeFilter,
    selectedMode,
    onlyNoDegree,
    onlyFlexible,
    onlyEquipmentProvided,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeError(null);
    if (!file) return;

    // Validate type: .pdf or .docx
    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx =
      lowerName.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword';

    if (!isPdf && !isDocx) {
      setResumeError(t('applyModal.errorInvalidType'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size: 5 MB limit
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setResumeError(t('applyModal.errorTooLarge'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setResumeFile(file);
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppToApply) return;
    if (resumeError) return;
    const opp = oppToApply;

    const resumePayload = resumeFile
      ? {
          name: resumeFile.name,
          size: resumeFile.size,
          type: resumeFile.type,
        }
      : undefined;

    const success = submitApplication(
      opp.id,
      applyCoverNote,
      applyPortfolioUrl,
      resumePayload
    );

    if (success) {
      setSubmittedAppSummary({
        oppTitle: opp.title,
        organization: opp.organization,
        resumeName: resumeFile?.name,
        resumeSize: resumeFile?.size,
        portfolioUrl: applyPortfolioUrl,
        coverNote: applyCoverNote,
        date: language === 'hi' ? 'अभी-अभी' : 'Just now',
      });
      setOppToApply(null);
      setApplyCoverNote('');
      setResumeFile(null);
      setResumeError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const hasApplied = (oppId: string) => applications.some((a) => a.opportunityId === oppId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Banner */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {t('opportunities.title')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              {t('opportunities.subtitle')}
            </p>
          </div>

          {/* Sample Data Disclaimer Badge */}
          <div className="self-start sm:self-auto px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-[11px] font-medium">{t('common.demoDataBadge')}</span>
          </div>
        </div>
      </div>

      {/* Simple Mode 3-Step Action Guide */}
      {isSimpleMode && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
              {t('common.simpleModeBadge')}
            </span>
            <h3 className="text-sm font-bold text-amber-950">
              {language === 'hi' ? '3-चरणों में अवसर खोजें और आवेदन करें' : '3-Step Easy Guide to Find and Apply'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-950">
            <div className="p-3 bg-white/90 border border-amber-200/60 rounded-xl shadow-2xs">
              <span className="font-bold text-[#134E3F] block mb-1">1.</span>
              <p>{t('opportunities.simpleModeStep1')}</p>
            </div>
            <div className="p-3 bg-white/90 border border-amber-200/60 rounded-xl shadow-2xs">
              <span className="font-bold text-[#134E3F] block mb-1">2.</span>
              <p>{t('opportunities.simpleModeStep2')}</p>
            </div>
            <div className="p-3 bg-white/90 border border-amber-200/60 rounded-xl shadow-2xs">
              <span className="font-bold text-[#134E3F] block mb-1">3.</span>
              <p>{t('opportunities.simpleModeStep3')}</p>
            </div>
          </div>
          <p className="text-[11px] text-amber-900 italic">
            {t('opportunities.simpleModeFilterNote')}
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('opportunities.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F] focus:bg-white transition-colors"
            />
          </div>
          <VoiceInputButton
            onTranscript={(text) => setSearchQuery(text)}
            className="shrink-0 h-10 w-10 border border-stone-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
            >
              {t('common.clear')}
            </button>
          )}
        </div>

        {/* Category Filter Pills Bar */}
        <div className="space-y-1.5 pt-1 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
              {language === 'hi' ? 'करियर श्रेणियां' : 'Career Categories'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyHighFit(!onlyHighFit)}
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                  onlyHighFit
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>{language === 'hi' ? 'केवल उपयुक्त' : 'High Fit Only'}</span>
              </button>
              {(selectedCategory !== 'all' || searchQuery || onlyHighFit) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setOnlyHighFit(false);
                    setSearchQuery('');
                  }}
                  className="text-rose-700 hover:underline text-[11px] font-semibold"
                >
                  {language === 'hi' ? 'रीसेट' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'} ({categoryCounts.all || 0})
            </button>
            {OPPORTUNITY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#134E3F] text-white shadow-2xs font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {language === 'hi' ? cat.shortLabelHi : cat.shortLabelEn} ({categoryCounts[cat.id] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Opportunity Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 text-xs mr-1 hidden sm:inline">{t('opportunities.typeLabel')}</span>
          {[
            { id: 'all', label: t('opportunities.allTypes') },
            { id: 'internship', label: t('opportunities.internships') },
            { id: 'entry_level', label: t('opportunities.entryJobs') },
            { id: 'apprenticeship', label: t('opportunities.apprenticeships') },
            { id: 'freelance', label: t('opportunities.freelance') },
            { id: 'local_work', label: t('opportunities.localGigs') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedTypeFilter === tab.id
                  ? 'bg-[#134E3F] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Second Row: Practical Constraints & Work Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          {/* Work Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">{t('opportunities.workModeLabel')}</span>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:border-[#134E3F]"
            >
              <option value="all">{t('opportunities.allModes')}</option>
              <option value="remote">{t('opportunities.remoteOnly')}</option>
              <option value="on_site">{t('opportunities.onSiteOnly')}</option>
              <option value="hybrid">{t('opportunities.hybridOnly')}</option>
            </select>
          </div>

          {/* Practical Constraints Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 text-stone-700">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900">
              <input
                type="checkbox"
                checked={onlyNoDegree}
                onChange={(e) => setOnlyNoDegree(e.target.checked)}
                className="rounded text-[#134E3F] focus:ring-[#134E3F] w-3.5 h-3.5"
              />
              <span>{t('opportunities.filterNoDegree')}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900">
              <input
                type="checkbox"
                checked={onlyFlexible}
                onChange={(e) => setOnlyFlexible(e.target.checked)}
                className="rounded text-[#134E3F] focus:ring-[#134E3F] w-3.5 h-3.5"
              />
              <span>{t('opportunities.filterFlexible')}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-900">
              <input
                type="checkbox"
                checked={onlyEquipmentProvided}
                onChange={(e) => setOnlyEquipmentProvided(e.target.checked)}
                className="rounded text-[#134E3F] focus:ring-[#134E3F] w-3.5 h-3.5"
              />
              <span>{t('opportunities.filterEquipment')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Count & Match Indicator */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          {t('opportunities.showingCount', { count: filteredOpportunities.length })}
        </span>
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setOnlyHighFit(false);
            setSelectedTypeFilter('all');
            setSelectedMode('all');
            setOnlyNoDegree(false);
            setOnlyFlexible(false);
            setOnlyEquipmentProvided(false);
            setPreselectedConstraint({});
          }}
          className="text-stone-600 hover:text-stone-900 hover:underline"
        >
          {t('common.resetFilters')}
        </button>
      </div>

      {/* Opportunities Card Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-stone-800">{t('opportunities.emptyTitle')}</p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {t('opportunities.emptySubtext')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyHighFit(false);
              setSelectedTypeFilter('all');
              setSelectedMode('all');
              setOnlyNoDegree(false);
              setOnlyFlexible(false);
              setOnlyEquipmentProvided(false);
              setPreselectedConstraint({});
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#134E3F] rounded-lg mt-2 inline-block"
          >
            {t('common.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map(({ rawOpp, relevance }) => {
            const opp = getLocalizedOpp(rawOpp, language);
            const isSaved = isOpportunitySaved(rawOpp.id);
            const applied = hasApplied(rawOpp.id);

            // Compute skill overlap with user profile safely
            const userSkills = profile.skills || [];
            const matchingSkills = relevance.matchingSkills;

            return (
              <div
                key={rawOpp.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 hover:border-stone-400 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Unboxed metadata */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#134E3F] border border-emerald-200">
                        {getCategoryShortLabel(rawOpp.category, language)}
                      </span>
                      <span className="font-medium text-stone-700 capitalize">
                        {opp.type.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{opp.workMode}</span>
                      {relevance.isHighFit && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>{language === 'hi' ? `${relevance.score}% उपयुक्त` : `${relevance.score}% High Fit`}</span>
                        </span>
                      )}
                    </div>

                    {/* Bookmark Save Button */}
                    <button
                      onClick={() => toggleSaveOpportunity(rawOpp.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-[#134E3F] bg-[#134E3F]/10'
                          : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                      }`}
                      title={isSaved ? 'Saved to profile' : 'Save opportunity'}
                      aria-label="Bookmark opportunity"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-[#134E3F]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Organization */}
                  <h3
                    className="text-base font-bold text-stone-900 hover:text-[#134E3F] transition-colors cursor-pointer"
                    onClick={() => setSelectedOppForDetail(rawOpp)}
                  >
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-600 mt-1 mb-3">
                    <span className="flex items-center gap-1 font-medium text-stone-800">
                      <Building2 className="w-3.5 h-3.5 text-stone-400" />
                      {opp.organization}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {opp.location}
                    </span>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                    {opp.description}
                  </p>

                  {/* Compensation & Schedule unboxed line */}
                  <div className="text-xs text-stone-700 bg-[#FBF9F5] p-2.5 rounded-xl border border-stone-100 flex items-center justify-between mb-3">
                    <span className="font-semibold text-stone-900">{opp.stipend}</span>
                    <span className="text-stone-500">{opp.schedule}</span>
                  </div>

                  {/* Skills Required & Profile Fit */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>{t('common.requiredSkills')}</span>
                      {matchingSkills.length > 0 && (
                        <span className="text-emerald-700 font-medium">
                          {t('opportunities.skillsMatchCount', {
                            match: matchingSkills.length,
                            total: rawOpp.skillsRequired.length,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.skillsRequired.map((skill, sIdx) => {
                        const rawSkill = rawOpp.skillsRequired[sIdx] || skill;
                        const hasIt = profile.skills.includes(rawSkill) || profile.skills.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`text-[11px] px-2 py-0.5 rounded-md border ${
                              hasIt
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                                : 'bg-stone-50 text-stone-600 border-stone-200'
                            }`}
                          >
                            {hasIt ? `✓ ${skill}` : skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skill Gap Explanation Banner */}
                  <div className="mb-3">
                    {relevance.missingSkills.length > 0 ? (
                      <p className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-md">
                        {language === 'hi' ? relevance.skillGapSummaryHi : relevance.skillGapSummaryEn}
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-900 bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                        {language === 'hi'
                          ? 'सभी मुख्य आवश्यक कौशल आपकी प्रोफ़ाइल में मौजूद हैं!'
                          : 'All core required skills match your profile!'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOppForDetail(rawOpp)}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      {t('common.viewDetails')}
                    </button>

                    {/* SkillBridge Bridge Trigger */}
                    <button
                      onClick={() => {
                        setSelectedOpportunityForSkillBridge(rawOpp);
                        setCurrentView('skillbridge');
                      }}
                      className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1 hover:underline"
                      title="See missing skills and personalized learning roadmap"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">{t('opportunities.bridgeSkills')}</span>
                    </button>
                  </div>

                  {/* Apply Button */}
                  {applied ? (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('common.applied')}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setOppToApply(rawOpp)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors shadow-2xs"
                    >
                      {t('common.applyNow')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOppForDetail && (() => {
        const locDetail = getLocalizedOpp(selectedOppForDetail, language);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#134E3F] border border-emerald-200">
                      {getCategoryShortLabel(selectedOppForDetail.category, language)}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {language === 'hi' ? 'सैंपल डेमो रिक्ति' : 'Sample Demo Listing'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{locDetail.type.replace('_', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{locDetail.workMode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t('opportunities.vacanciesCount', { count: locDetail.vacancies })}</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">
                    {locDetail.title}
                  </h3>
                  <p className="text-xs font-medium text-stone-700 mt-0.5">
                    {locDetail.organization} · {locDetail.location}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOppForDetail(null);
                    setSelectedOpportunityForDetail(null);
                  }}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Compensation & Schedule */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-stone-200">
                <div>
                  <p className="text-stone-400 text-[11px]">{t('common.compensation')}</p>
                  <p className="font-bold text-stone-900 mt-0.5">{locDetail.stipend}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-[11px]">{t('common.scheduleCommitment')}</p>
                  <p className="font-bold text-stone-900 mt-0.5">{locDetail.schedule}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                  {t('common.roleDescription')}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {locDetail.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  {t('common.requirementsExpectations')}
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {locDetail.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#134E3F] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical Inclusions */}
              <div>
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  {t('common.practicalAmenities')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-700">
                  <p>
                    • {t('common.degreeRequired')}{' '}
                    <strong>{locDetail.practicalConstraints.noDegreeRequired ? t('common.noDegreeNeeded') : t('common.degreeNeeded')}</strong>
                  </p>
                  <p>
                    • {t('common.equipment')}{' '}
                    <strong>{locDetail.practicalConstraints.equipmentProvided ? t('common.equipmentProvidedOrg') : t('common.equipmentOwn')}</strong>
                  </p>
                  <p>
                    • {t('common.flexibleHoursLabel')}{' '}
                    <strong>{locDetail.practicalConstraints.flexibleHours ? t('common.yes') : t('common.no')}</strong>
                  </p>
                  <p>
                    • {t('common.vernacularFriendlyLabel')}{' '}
                    <strong>{locDetail.practicalConstraints.vernacularFriendly ? t('common.vernacularYes') : t('common.englishPrimary')}</strong>
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedOpportunityForSkillBridge(selectedOppForDetail);
                    setSelectedOppForDetail(null);
                    setCurrentView('skillbridge');
                  }}
                  className="text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg hover:bg-amber-100 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('opportunities.checkGapAction')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOppForDetail(null);
                      setSelectedOpportunityForDetail(null);
                    }}
                    className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    {t('common.close')}
                  </button>
                  <button
                    onClick={() => {
                      setOppToApply(selectedOppForDetail);
                      setSelectedOppForDetail(null);
                      setSelectedOpportunityForDetail(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors"
                  >
                    {t('opportunities.proceedToApply')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Apply Modal */}
      {oppToApply && (() => {
        const locApply = getLocalizedOpp(oppToApply, language);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-[#134E3F] uppercase tracking-wider">
                    {t('applyModal.demoFlowBadge')}
                  </span>
                  <h3 className="text-base font-bold text-stone-900">
                    {t('applyModal.title', { title: locApply.title })}
                  </h3>
                  <p className="text-xs text-stone-500">{locApply.organization}</p>
                </div>
                <button
                  onClick={() => setOppToApply(null)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                {/* Profile summary preview */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                  <p className="text-stone-500">{t('applyModal.applicantName')} <strong className="text-stone-900">{profile.name}</strong></p>
                  <p className="text-stone-500">{t('applyModal.location')} <span className="text-stone-800">{profile.location}</span></p>
                  <p className="text-stone-500">{t('applyModal.currentSkills')} <span className="text-stone-800">{profile.skills.slice(0, 3).join(', ')}</span></p>
                </div>

                {/* Cover Note */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">
                      {t('applyModal.coverNoteLabel')}
                    </label>
                    <VoiceInputButton
                      onTranscript={(text) => setApplyCoverNote((prev) => (prev ? `${prev} ${text}` : text))}
                      className="h-7 w-7 text-stone-500"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={applyCoverNote}
                    onChange={(e) => setApplyCoverNote(e.target.value)}
                    placeholder={t('applyModal.coverNotePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
                  />
                  {isSimpleMode && (
                    <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 mt-1">
                      {t('applyModal.simpleCoverNoteHelp')}
                    </p>
                  )}
                </div>

                {/* Resume Upload Field (PDF & DOCX, Max 5MB) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      {t('applyModal.resumeUploadLabel')}
                    </label>
                    <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      {t('applyModal.resumeOptionalBadge')}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!resumeFile ? (
                    <label
                      htmlFor="resume-file-input"
                      className="group cursor-pointer border-2 border-dashed border-stone-300 hover:border-[#134E3F] hover:bg-stone-50/80 rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all"
                    >
                      <UploadCloud className="w-5 h-5 text-stone-400 group-hover:text-[#134E3F] mb-1 transition-colors" />
                      <span className="text-xs font-semibold text-stone-700 group-hover:text-[#134E3F]">
                        {t('applyModal.resumeFileHint')}
                      </span>
                      <span className="text-[11px] text-stone-400 mt-0.5">
                        PDF or DOCX · 5 MB limit
                      </span>
                    </label>
                  ) : (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {resumeFile.name}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB · {resumeFile.name.endsWith('.pdf') ? 'PDF Document' : 'DOCX Document'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label
                          htmlFor="resume-file-input"
                          className="cursor-pointer text-[11px] font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1 bg-white border border-stone-200 rounded-md hover:bg-stone-50 transition-colors"
                        >
                          {t('applyModal.replaceResume')}
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveResume}
                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 px-2 py-1 bg-white border border-rose-200 rounded-md hover:bg-rose-50 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t('applyModal.removeResume')}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {resumeError && (
                    <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{resumeError}</span>
                    </div>
                  )}

                  {isSimpleMode && (
                    <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                      {t('applyModal.simpleResumeHelp')}
                    </p>
                  )}
                </div>

                {/* Portfolio Link (Optional Separate Field) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('applyModal.portfolioLabel')}
                  </label>
                  <input
                    type="text"
                    value={applyPortfolioUrl}
                    onChange={(e) => setApplyPortfolioUrl(e.target.value)}
                    placeholder={t('applyModal.portfolioPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
                  />
                </div>

                {/* Demo Storage Disclaimer Notice */}
                <div className="p-2.5 bg-stone-100 border border-stone-200 rounded-lg text-[11px] text-stone-700 leading-snug flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <p>{t('applyModal.storageDisclaimerNotice')}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOppToApply(null);
                      setResumeFile(null);
                      setResumeError(null);
                    }}
                    className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(resumeError)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                  >
                    {t('applyModal.submitButton')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Application Success Confirmation State Modal */}
      {submittedAppSummary && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-[#134E3F] rounded-full mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {t('applyModal.confirmationTitle')}
              </h3>
              <p className="text-xs text-stone-600">
                {t('applyModal.confirmationSubtitle')}
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-stone-500">{t('applyModal.confirmationOppLabel')}</span>
                <span className="font-bold text-stone-900 text-right">{submittedAppSummary.oppTitle}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-stone-500">{t('applyModal.confirmationOrgLabel')}</span>
                <span className="font-semibold text-stone-800">{submittedAppSummary.organization}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-stone-500">{t('applyModal.confirmationDateLabel')}</span>
                <span className="text-stone-700">{submittedAppSummary.date}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-stone-500">{t('applyModal.confirmationResumeLabel')}</span>
                <span className="font-medium text-emerald-800 text-right truncate max-w-[200px]">
                  {submittedAppSummary.resumeName ? (
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {submittedAppSummary.resumeName}
                    </span>
                  ) : (
                    <span className="text-stone-500">{t('applyModal.confirmationNoResume')}</span>
                  )}
                </span>
              </div>
              {submittedAppSummary.portfolioUrl && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">{t('applyModal.confirmationPortfolioLabel')}</span>
                  <a
                    href={submittedAppSummary.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#134E3F] hover:underline truncate max-w-[200px]"
                  >
                    {submittedAppSummary.portfolioUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 leading-snug">
              <span>{language === 'hi' ? 'सत्र स्थिति:' : 'Session Storage:'}</span>{' '}
              {language === 'hi'
                ? 'यह आवेदन आपके स्थानीय ब्राउज़र डेमो सत्र में सुरक्षित रूप से दर्ज कर दिया गया है। क्लाउड बैकएंड कॉन्फ़िगर नहीं है।'
                : 'Application and attached resume details are securely stored in your local browser demo session. Cloud backend unconfigured.'}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedAppSummary(null);
                  setCurrentView('dashboard');
                }}
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg shadow-sm transition-colors text-center"
              >
                {t('applyModal.confirmationViewDashboard')}
              </button>
              <button
                type="button"
                onClick={() => setSubmittedAppSummary(null)}
                className="w-full sm:w-auto py-2 px-4 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors text-center border border-stone-200"
              >
                {t('applyModal.confirmationClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
