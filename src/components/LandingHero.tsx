import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  Search,
  MapPin,
  GraduationCap,
  Users,
  Compass,
  Store,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Clock,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import { Opportunity } from '../types';
import { getLocalizedOpp } from '../utils/localization';

import heroImage from '../assets/images/hero_kaamsetu_pathway_1793163269221.jpg';
import skillsLabImage from '../assets/images/community_skills_lab_1793163269258.jpg';
import businessImage from '../assets/images/local_entrepreneur_hub_1793163269453.jpg';

export const LandingHero: React.FC = () => {
  const {
    setCurrentView,
    opportunities,
    setSearchQuery,
    setSelectedOpportunityForDetail,
    navigateToAudience,
    profile,
    language,
    t,
  } = useApp();

  const [roleQuery, setRoleQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combined = [roleQuery.trim(), locationQuery.trim()].filter(Boolean).join(' ');
    setSearchQuery(combined);
    setCurrentView('opportunities');
  };

  const handleTagClick = (tag: string) => {
    setRoleQuery(tag);
    setSearchQuery(tag);
    setCurrentView('opportunities');
  };

  const handleViewDetails = (opp: Opportunity) => {
    setSelectedOpportunityForDetail(opp);
    setCurrentView('opportunities');
  };

  // Top 3 Featured Opportunities
  const featuredOpportunities = opportunities.slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Strong Hero Section */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Supporting Text, Search & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              {/* Quiet Domain Kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-[#134E3F] tracking-wide uppercase">
                <span>{t('hero.kicker')}</span>
                <span aria-hidden="true">·</span>
                <span className="text-stone-500 font-normal">{t('hero.subkicker')}</span>
              </div>

              {/* Exact Required Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.15] text-balance">
                {t('hero.headline')}
              </h1>

              {/* Exact Required Supporting Text */}
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
                {t('hero.subtext')}
              </p>

              {/* Prominent Search Bar with Role & Location fields */}
              <div className="bg-white border border-stone-200/90 rounded-2xl p-2.5 sm:p-3.5 shadow-md space-y-2.5">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Job/Skill Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={roleQuery}
                      onChange={(e) => setRoleQuery(e.target.value)}
                      placeholder={t('common.searchPlaceholder')}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Location Field */}
                  <div className="relative sm:w-52">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder={t('common.locationPlaceholder')}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Speech to text & Search Submit Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <VoiceInputButton
                      onTranscript={(text) => {
                        setRoleQuery(text);
                        setSearchQuery(text);
                        setCurrentView('opportunities');
                      }}
                      className="shrink-0 h-10 w-10 border border-stone-200"
                    />

                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-xl transition-colors whitespace-nowrap shadow-sm"
                    >
                      {t('common.search')}
                    </button>
                  </div>
                </form>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
                  <span className="font-medium text-stone-600">{t('common.popular')}</span>
                  {(language === 'hi'
                    ? ['वेब डेवलपर इंटर्न', 'सोलर इंस्टालेशन', 'मातृभाषा सामग्री', 'इन्वेंटरी', 'रिमोट']
                    : ['Web Developer Intern', 'Solar Installation', 'Vernacular Content', 'Local Inventory', 'Remote']
                  ).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Working Primary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setCurrentView('opportunities')}
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{t('hero.exploreCTA')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentView('skillbridge')}
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
                >
                  {t('hero.buildSkillsCTA')}
                </button>

                {/* Direct Demo Dashboard Link */}
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-3 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  title="View the active demo applicant dashboard for Pooja Sharma"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('hero.demoDashboardCTA')}</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-2 border-t border-stone-200/70 flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#134E3F]" />
                  <span>{t('hero.trustVerified')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#134E3F]" />
                  <span>{t('hero.trustBilingual')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#134E3F]" />
                  <span>{t('hero.trustZeroBarrier')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Anchor Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-xl bg-stone-100 aspect-4/3 group">
                <img
                  src={heroImage}
                  alt="KaamSetu hub in India with young professionals, tech students, and local artisans"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                  <p className="font-semibold text-white">{t('hero.visualCaptionTitle')}</p>
                  <p className="text-white/80 text-[11px] mt-0.5">
                    {t('hero.visualCaptionSub')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four Existing Audience Cards (Directly below hero, entire card clickable) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-semibold text-[#134E3F] uppercase tracking-wider mb-1">
            {t('audience.sectionKicker')}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {t('audience.sectionTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {t('audience.sectionSubtext')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Students */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToAudience('students')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateToAudience('students'); }}
            className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#134E3F] hover:shadow-md transition-all cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-[#134E3F]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1 group-hover:text-[#134E3F] transition-colors">
                {t('audience.studentsTitle')}
              </h3>
              <p className="text-xs font-medium text-blue-900 mb-2">
                {t('audience.studentsTag')}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('audience.studentsDesc')}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#134E3F] group-hover:text-[#0E3B30]">
              <span>{t('audience.studentsCTA')}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Underserved communities */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToAudience('underserved')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateToAudience('underserved'); }}
            className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#134E3F] hover:shadow-md transition-all cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-[#134E3F]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#134E3F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1 group-hover:text-[#134E3F] transition-colors">
                {t('audience.underservedTitle')}
              </h3>
              <p className="text-xs font-medium text-emerald-900 mb-2">
                {t('audience.underservedTag')}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('audience.underservedDesc')}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#134E3F] group-hover:text-[#0E3B30]">
              <span>{t('audience.underservedCTA')}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Career seekers */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToAudience('career_seekers')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateToAudience('career_seekers'); }}
            className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#134E3F] hover:shadow-md transition-all cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-[#134E3F]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1 group-hover:text-[#134E3F] transition-colors">
                {t('audience.careerSeekersTitle')}
              </h3>
              <p className="text-xs font-medium text-amber-900 mb-2">
                {t('audience.careerSeekersTag')}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('audience.careerSeekersDesc')}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-800 group-hover:text-amber-900">
              <span>{t('audience.careerSeekersCTA')}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Small businesses */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigateToAudience('business')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateToAudience('business'); }}
            className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#134E3F] hover:shadow-md transition-all cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-[#134E3F]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1 group-hover:text-[#134E3F] transition-colors">
                {t('audience.businessTitle')}
              </h3>
              <p className="text-xs font-medium text-teal-900 mb-2">
                {t('audience.businessTag')}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('audience.businessDesc')}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-teal-800 group-hover:text-teal-900">
              <span>{t('audience.businessCTA')}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Compact Featured Opportunities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {t('featured.sectionTitle')}
              </h2>
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px] font-semibold">
                {t('featured.badge')}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              {t('featured.subtext')}
            </p>
          </div>

          <button
            onClick={() => setCurrentView('opportunities')}
            className="text-xs font-semibold text-[#134E3F] hover:text-[#0E3B30] flex items-center gap-1 self-start sm:self-auto hover:underline"
          >
            <span>{t('featured.viewAll')} ({opportunities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Compact Listing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredOpportunities.map((rawOpp) => {
            const opp = getLocalizedOpp(rawOpp, language);
            return (
              <div
                key={opp.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Unboxed Metadata Header */}
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-stone-700 capitalize">
                      {opp.type.replace('_', ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{opp.workMode}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {t('common.demoDataShort')}
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h3
                      onClick={() => handleViewDetails(rawOpp)}
                      className="text-sm sm:text-base font-bold text-stone-900 hover:text-[#134E3F] transition-colors cursor-pointer"
                    >
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
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
                  </div>

                  {/* Compensation */}
                  <div className="p-2.5 bg-stone-50 rounded-xl text-xs flex items-center justify-between border border-stone-100">
                    <span className="font-bold text-stone-900">{opp.stipend}</span>
                    <span className="text-stone-500 text-[11px]">{opp.schedule}</span>
                  </div>

                  {/* Required Skills */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-stone-500">{t('common.requiredSkills')}</span>
                    <div className="flex flex-wrap gap-1">
                      {opp.skillsRequired.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 bg-[#FBF9F5] border border-stone-200 text-stone-700 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Details Action Button */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    {opp.practicalConstraints?.noDegreeRequired ? t('common.noDegreeNeeded') : t('common.trainingProvided')}
                  </span>

                  <button
                    onClick={() => handleViewDetails(rawOpp)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#134E3F] hover:bg-[#134E3F]/10 border border-[#134E3F]/30 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('common.viewDetails')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Demo Candidate Dashboard Banner (Pooja Sharma Experience) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F5F2EB] border border-stone-300/80 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-xs">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#134E3F]">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('demoBanner.kicker')}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {t('demoBanner.title')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t('demoBanner.desc')}
            </p>
          </div>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-xl transition-colors shadow-sm flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('demoBanner.buttonText')}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
