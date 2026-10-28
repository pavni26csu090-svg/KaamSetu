import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  X,
  Check,
  ChevronDown,
  Sparkles,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  Filter,
  ShieldAlert,
} from 'lucide-react';
import { Opportunity, OpportunityCategory } from '../types';
import { getLocalizedOpp } from '../utils/localization';
import {
  OPPORTUNITY_CATEGORIES,
  getCategoryShortLabel,
  calculateOpportunityRelevance,
  OpportunityRelevance,
} from '../utils/opportunityRelevance';
import { VoiceInputButton } from './VoiceInputButton';

interface OpportunitySelectorProps {
  selectedId: string;
  onSelect: (opportunity: Opportunity) => void;
  label?: string;
  className?: string;
  showDetailsSummary?: boolean;
}

export const OpportunitySelector: React.FC<OpportunitySelectorProps> = ({
  selectedId,
  onSelect,
  label,
  className = '',
  showDetailsSummary = true,
}) => {
  const { opportunities, profile, language, t } = useApp();
  const isHi = language === 'hi';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | 'all'>('all');
  const [onlyRecommended, setOnlyRecommended] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Identify current selected opportunity
  const selectedOpp = useMemo(() => {
    return (
      opportunities.find((o) => o.id === selectedId) ||
      opportunities[0] ||
      null
    );
  }, [opportunities, selectedId]);

  const selectedOppRelevance = useMemo(() => {
    if (!selectedOpp) return null;
    return calculateOpportunityRelevance(selectedOpp, profile);
  }, [selectedOpp, profile]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Calculate relevance for all opportunities and filter
  const processedOpportunities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return opportunities
      .map((opp) => {
        const relevance = calculateOpportunityRelevance(opp, profile);
        return { opp, relevance };
      })
      .filter(({ opp, relevance }) => {
        // Category filter
        if (selectedCategory !== 'all' && opp.category !== selectedCategory) {
          return false;
        }

        // Recommended only filter
        if (onlyRecommended && !relevance.isHighFit) {
          return false;
        }

        // Search query filter
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

        return true;
      })
      .sort((a, b) => {
        // High fit and relevant roles first
        return b.relevance.score - a.relevance.score;
      });
  }, [opportunities, profile, selectedCategory, onlyRecommended, searchQuery]);

  // Count per category for badge counters
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: opportunities.length };
    for (const opp of opportunities) {
      counts[opp.category] = (counts[opp.category] || 0) + 1;
    }
    return counts;
  }, [opportunities]);

  const handleSelect = (opp: Opportunity) => {
    onSelect(opp);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyRecommended(false);
  };

  const locSelectedOpp = selectedOpp ? getLocalizedOpp(selectedOpp, language) : null;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
          {label}
        </label>
      )}

      {/* Trigger Card: Displays current selection with role title first and easy click-to-change */}
      {locSelectedOpp && (
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          className="group relative p-4 bg-white border border-stone-200/90 hover:border-[#134E3F] rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#134E3F] border border-emerald-200">
                  {getCategoryShortLabel(selectedOpp.category, language)}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {isHi ? 'सैंपल डेमो' : 'Sample Demo'}
                </span>
                {selectedOppRelevance?.isHighFit && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>{isHi ? `${selectedOppRelevance.score}% उपयुक्त` : `${selectedOppRelevance.score}% High Fit`}</span>
                  </span>
                )}
              </div>

              {/* Prominent Role Title First */}
              <h4 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#134E3F] transition-colors leading-snug">
                {locSelectedOpp.title}
              </h4>

              {/* Secondary Employer and Location metadata */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {locSelectedOpp.organization}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {locSelectedOpp.workMode} · {locSelectedOpp.location}
                </span>
                <span>·</span>
                <span className="font-medium text-emerald-800">
                  {locSelectedOpp.stipend}
                </span>
              </div>
            </div>

            {/* Change Opportunity Action Button */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <span className="px-3 py-1.5 text-xs font-semibold text-[#134E3F] bg-emerald-50/80 group-hover:bg-[#134E3F] group-hover:text-white rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>{isHi ? 'अवसर बदलें' : 'Change Role'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </span>
            </div>
          </div>

          {/* Skill Match & Gap Analysis Footer */}
          {showDetailsSummary && selectedOppRelevance && (
            <div className="mt-3 pt-3 border-t border-stone-100 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-stone-600">
                <strong className="text-stone-800 mr-1.5">
                  {isHi ? 'कौशल मिलान:' : 'Skill Alignment:'}
                </strong>
                {selectedOppRelevance.matchingSkills.length > 0 ? (
                  <span className="text-emerald-700 font-medium">
                    {selectedOppRelevance.matchingSkills.join(', ')}
                  </span>
                ) : (
                  <span className="text-stone-500 italic">
                    {isHi ? 'कोई सीधा कौशल मेल नहीं' : 'No direct reported skill match'}
                  </span>
                )}
                {selectedOppRelevance.missingSkills.length > 0 && (
                  <span className="text-stone-500 ml-2">
                    ({selectedOppRelevance.missingSkills.length} {isHi ? 'सीखने योग्य' : 'to bridge'})
                  </span>
                )}
              </div>

              <div className="text-[11px] text-stone-500">
                {isHi ? selectedOppRelevance.whyMatchedHi : selectedOppRelevance.whyMatchedEn}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal / Popover Selector */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="opp-selector-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-stone-200 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between gap-4 bg-stone-50/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 id="opp-selector-title" className="text-base sm:text-lg font-bold text-stone-900">
                    {isHi ? 'लक्षित अवसर व करियर भूमिका चुनें' : 'Select Career Opportunity & Role'}
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {opportunities.length} {isHi ? 'डेमो सूचियां' : 'Demo Listings'}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {isHi
                    ? '8 मुख्य श्रेणियों में से अपनी पसंदीदा भूमिका चुनें या अपनी प्रोफ़ाइल के अनुसार रैंक किए गए अवसर देखें।'
                    : 'Search across 8 distinct career categories or filter to opportunities prioritized for your profile.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={isHi ? 'बंद करें' : 'Close'}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar: Search + Recommended Toggle */}
            <div className="p-4 sm:px-6 sm:py-4 border-b border-stone-100 space-y-3 bg-white">
              {/* Search Row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isHi
                        ? 'पद का नाम, कौशल (जैसे React, Python, Solar) या शहर खोजें...'
                        : 'Search by role title (e.g. Web Developer, Python), skill, or city...'
                    }
                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F] focus:bg-white transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <VoiceInputButton
                  onTranscript={(text) => setSearchQuery(text)}
                  className="h-10 w-10 border border-stone-200 shrink-0"
                />
              </div>

              {/* Relevance Toggle & Category Filter Chips */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setOnlyRecommended(false)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        !onlyRecommended
                          ? 'bg-[#134E3F] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {isHi ? 'सभी अवसर' : 'All Opportunities'} ({opportunities.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlyRecommended(true)}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                        onlyRecommended
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isHi ? 'आपकी प्रोफ़ाइल के लिए अनुशंसित' : 'Recommended For You'}</span>
                    </button>
                  </div>

                  {(searchQuery || selectedCategory !== 'all' || onlyRecommended) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-rose-700 hover:underline shrink-0"
                    >
                      {isHi ? 'फ़िल्टर हटाएं' : 'Clear Filters'}
                    </button>
                  )}
                </div>

                {/* Categories Horizontal Pills Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {isHi ? 'सभी श्रेणियां' : 'All Categories'} ({categoryCounts.all || 0})
                  </button>

                  {OPPORTUNITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-[#134E3F] text-white shadow-2xs font-semibold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {isHi ? cat.shortLabelHi : cat.shortLabelEn} ({categoryCounts[cat.id] || 0})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunities List Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-stone-50/40">
              {processedOpportunities.length === 0 ? (
                /* Empty state with clear recovery */
                <div className="p-10 text-center space-y-3 bg-white border border-dashed border-stone-300 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-stone-900">
                    {isHi ? 'कोई अवसर नहीं मिला' : 'No matching opportunities found'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    {searchQuery
                      ? isHi
                        ? `"${searchQuery}" के लिए कोई परिणाम नहीं मिला। वर्तनी की जाँच करें या अन्य श्रेणी चुनें।`
                        : `No roles matched "${searchQuery}". Try searching for 'web', 'python', 'solar', or clear the active filter.`
                      : isHi
                      ? 'चुने गए फ़िल्टर के तहत कोई अवसर उपलब्ध नहीं है।'
                      : 'No opportunities currently meet these filter criteria.'}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 text-xs font-semibold text-[#134E3F] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors"
                  >
                    {isHi ? 'फ़िल्टर रीसेट करें और सभी 40 अवसर देखें' : 'Reset Filters & Show All 40 Roles'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {processedOpportunities.map(({ opp, relevance }) => {
                    const loc = getLocalizedOpp(opp, language);
                    const isSelected = opp.id === selectedId;

                    return (
                      <div
                        key={opp.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelect(opp)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelect(opp);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                          isSelected
                            ? 'bg-emerald-50/60 border-[#134E3F] ring-2 ring-[#134E3F]/20 shadow-sm'
                            : 'bg-white border-stone-200/90 hover:border-[#134E3F] hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Badges line: Category, Type, High Fit */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                              {getCategoryShortLabel(opp.category, language)}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-600 capitalize">
                              {opp.type.replace('_', ' ')}
                            </span>
                            {relevance.isHighFit && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-700" />
                                <span>{isHi ? `${relevance.score}% मैच` : `${relevance.score}% Fit`}</span>
                              </span>
                            )}
                          </div>

                          {/* Primary Role Title */}
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#134E3F]">
                              {loc.title}
                            </h4>
                            {isSelected && (
                              <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                <Check className="w-3.5 h-3.5" />
                                {isHi ? 'वर्तमान चयन' : 'Active'}
                              </span>
                            )}
                          </div>

                          {/* Secondary: Organization & Location */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                            <span className="font-semibold text-stone-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-stone-400" />
                              {loc.organization}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              {loc.workMode} · {loc.location}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-emerald-800">
                              {loc.stipend}
                            </span>
                          </div>

                          {/* Skills pill list with match indicator */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-stone-500 font-medium mr-1">
                              {isHi ? 'आवश्यक कौशल:' : 'Skills:'}
                            </span>
                            {(opp.skillsRequired || []).map((sk) => {
                              const isMatched = relevance.matchingSkills.includes(sk);
                              return (
                                <span
                                  key={sk}
                                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                                    isMatched
                                      ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-semibold'
                                      : 'bg-stone-100 text-stone-700 border border-stone-200'
                                  }`}
                                >
                                  {isMatched && '✓ '}
                                  {sk}
                                </span>
                              );
                            })}
                          </div>

                          {/* Skill gap explanation */}
                          <p className="text-[11px] text-stone-500 pt-0.5">
                            {isHi ? relevance.skillGapSummaryHi : relevance.skillGapSummaryEn}
                          </p>
                        </div>

                        {/* Right select button */}
                        <div className="shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(opp);
                            }}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${
                              isSelected
                                ? 'bg-[#134E3F] text-white shadow-xs'
                                : 'bg-stone-100 hover:bg-[#134E3F] hover:text-white text-stone-800'
                            }`}
                          >
                            {isSelected
                              ? isHi
                                ? 'चयनित'
                                : 'Selected'
                              : isHi
                              ? 'यह अवसर चुनें'
                              : 'Select Role'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer: Clear Demo Disclaimer */}
            <div className="p-3 sm:px-6 sm:py-3 border-t border-stone-100 bg-stone-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  {isHi
                    ? 'सभी 40 अवसर यथार्थवादी सैंपल डेमो डेटा हैं (शिक्षा व कौशल मूल्यांकन हेतु)। कोई वास्तविक रिक्ति नहीं है।'
                    : 'All 40 listings are realistic sample demo records for education and skill evaluation testing.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 self-end sm:self-auto"
              >
                {isHi ? 'बंद करें' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
