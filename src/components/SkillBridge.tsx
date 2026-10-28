import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  FolderGit2,
  HelpCircle,
  Award,
  Check,
  Send,
} from 'lucide-react';
import { SkillItem, Opportunity } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { getLocalizedSkill, getLocalizedOpp } from '../utils/localization';

export const SkillBridge: React.FC = () => {
  const {
    skills,
    completeSkillChallenge,
    opportunities,
    profile,
    selectedOpportunityForSkillBridge,
    setSelectedOpportunityForSkillBridge,
    setCurrentView,
    language,
    t,
  } = useApp();

  // Active Target Opportunity for Skill Gap Analysis
  const [targetOppId, setTargetOppId] = useState<string>(
    selectedOpportunityForSkillBridge?.id || opportunities[0]?.id || ''
  );

  // Active Skill selected for deep-dive & practical challenge
  const [activeSkillId, setActiveSkillId] = useState<string>(skills[0]?.id || '');
  const [challengeResponse, setChallengeResponse] = useState('');
  const [autoAddPortfolio, setAutoAddPortfolio] = useState(true);

  const selectedOpp = opportunities.find((o) => o.id === targetOppId) || null;
  const activeSkill = skills.find((s) => s.id === activeSkillId) || skills[0];

  const userSkillNames = profile?.skills || [];
  const requiredSkills = selectedOpp?.skillsRequired || [];
  const matchingSkills = requiredSkills.filter((sk) => userSkillNames.includes(sk));
  const missingSkills = requiredSkills.filter((sk) => !userSkillNames.includes(sk));

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeResponse.trim()) return;

    completeSkillChallenge(activeSkill.id, challengeResponse, autoAddPortfolio);
    setChallengeResponse('');
  };

  const locActiveSkill = getLocalizedSkill(activeSkill, language);
  const locSelectedOpp = selectedOpp ? getLocalizedOpp(selectedOpp, language) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#134E3F] tracking-wide uppercase mb-1">
          <span>{t('skillbridge.kicker')}</span>
          <span aria-hidden="true">·</span>
          <span>{t('skillbridge.tagline')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('skillbridge.title')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
          {t('skillbridge.subtitle')}
        </p>
      </div>

      {/* 1. Skill Gap Analysis Box */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {t('skillbridge.targetOppAnalysis')}
            </span>
            <h3 className="text-base font-bold text-stone-900 mt-0.5">
              {t('skillbridge.checkReadinessFor')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-stone-500 font-medium">{t('skillbridge.selectRoleLabel')}</label>
            <select
              value={targetOppId}
              onChange={(e) => {
                setTargetOppId(e.target.value);
                const opp = opportunities.find((o) => o.id === e.target.value);
                if (opp) setSelectedOpportunityForSkillBridge(opp);
              }}
              className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#134E3F]"
            >
              {opportunities.map((opp) => {
                const loc = getLocalizedOpp(opp, language);
                return (
                  <option key={opp.id} value={opp.id}>
                    {loc.title} ({loc.organization})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {selectedOpp && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User's Verified Skills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">{t('skillbridge.yourCurrentSkills')}</span>
                <span className="text-[11px] text-stone-400">{t('skillbridge.listedCount', { count: userSkillNames.length })}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 rounded-xl border border-stone-100 min-h-[90px]">
                {userSkillNames.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">{t('skillbridge.noSkillsListed')}</p>
                ) : (
                  userSkillNames.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs px-2.5 py-1 bg-white border border-stone-200 text-stone-800 rounded-md shadow-2xs"
                    >
                      {sk}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Matching Strengths */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">
                  {t('skillbridge.matchingStrengths', { count: matchingSkills.length })}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">{t('skillbridge.readyStatus')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 min-h-[90px]">
                {matchingSkills.length === 0 ? (
                  <p className="text-xs text-emerald-700/80 italic">
                    {t('skillbridge.noMatchingSkills')}
                  </p>
                ) : (
                  matchingSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 font-medium rounded-md shadow-2xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>{sk}</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills (Skill Gap to Bridge) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">
                  {t('skillbridge.missingSkillsToBridge', { count: missingSkills.length })}
                </span>
                <span className="text-[11px] text-amber-800 font-medium">{t('skillbridge.actionableStatus')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 min-h-[90px]">
                {missingSkills.length === 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold p-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{t('skillbridge.allSkillsMatched')}</span>
                  </div>
                ) : (
                  missingSkills.map((sk) => {
                    const matchedCatalogItem = skills.find((s) => s.name === sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => {
                          if (matchedCatalogItem) setActiveSkillId(matchedCatalogItem.id);
                        }}
                        className="text-xs px-2.5 py-1 bg-white border border-amber-300 text-amber-900 font-medium rounded-md shadow-2xs hover:bg-amber-100 transition-colors flex items-center gap-1"
                        title={t('skillbridge.clickToViewRoadmap')}
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{sk}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Deep Dive: Selected Skill, Roadmap & Practical Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Skill Selector & Why It Matters */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            {t('skillbridge.availableTracks', { count: skills.length })}
          </h3>
          <div className="space-y-2">
            {skills.map((skill) => {
              const locSk = getLocalizedSkill(skill, language);
              const isSelected = skill.id === activeSkill.id;
              const isCompleted = skill.completed;
              return (
                <button
                  key={skill.id}
                  onClick={() => setActiveSkillId(skill.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-[#134E3F] ring-1 ring-[#134E3F] shadow-xs'
                      : 'bg-white/60 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900">{locSk.name}</p>
                      <span className="text-[10px] text-stone-500 capitalize">· {skill.category}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {locSk.challenge.title}
                    </p>
                  </div>
                  {isCompleted ? (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {t('common.verified')}
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400 shrink-0 capitalize">
                      {skill.level}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* "Why This Skill Matters" Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>{t('skillbridge.whySkillMatters', { skill: locActiveSkill.name })}</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              {locActiveSkill.whyItMattersText}
            </p>
          </div>
        </div>

        {/* Right Column: Roadmap & Interactive Challenge Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. Personalized Learning Roadmap */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#134E3F]" />
                <h3 className="text-sm font-bold text-stone-900">
                  {t('skillbridge.roadmapTitle', { skill: locActiveSkill.name })}
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-medium uppercase">
                {activeSkill.level}
              </span>
            </div>

            <div className="space-y-3">
              {locActiveSkill.learningRoadmap.map((step) => (
                <div
                  key={step.step}
                  className="p-3.5 rounded-xl border border-stone-100 bg-[#FBF9F5] flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-full bg-[#134E3F] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {step.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-stone-900">{step.milestone}</p>
                      <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{step.estHours}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1">
                      <strong className="text-stone-700">{t('skillbridge.practiceTip')}</strong> {step.resourceTip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. Practical Challenge & Evidence Submission */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  {t('skillbridge.handsOnDemonstration')}
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">
                  {locActiveSkill.challenge.title}
                </h3>
              </div>
              {activeSkill.completed && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t('skillbridge.completedOn', { date: activeSkill.completionDate || '2026-10-20' })}</span>
                </div>
              )}
            </div>

            {/* Scenario and Task */}
            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/70">
                <p className="font-semibold text-stone-800 mb-1">{t('skillbridge.practicalScenario')}</p>
                <p className="text-stone-600 leading-relaxed">{locActiveSkill.challenge.scenario}</p>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70">
                <p className="font-semibold text-amber-900 mb-1">{t('skillbridge.specificTask')}</p>
                <p className="text-amber-950 leading-relaxed">{locActiveSkill.challenge.task}</p>
                <p className="text-[11px] text-stone-500 mt-2 italic">
                  {t('skillbridge.starterHint', { hint: locActiveSkill.challenge.starterHint })}
                </p>
              </div>

              {/* Rubric Points */}
              <div>
                <p className="font-semibold text-stone-700 mb-1">{t('skillbridge.rubricTitle')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {locActiveSkill.challenge.rubric.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                      <Check className="w-3 h-3 text-[#134E3F] shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Existing Evidence Display if completed */}
            {activeSkill.completed && activeSkill.evidenceNotes && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-emerald-900">{t('skillbridge.recordedEvidence')}</p>
                <p className="text-emerald-950 leading-relaxed">{activeSkill.evidenceNotes}</p>
              </div>
            )}

            {/* Interactive Submission Form */}
            <form onSubmit={handleChallengeSubmit} className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-800">
                  {activeSkill.completed
                    ? t('skillbridge.updateSubmissionLabel')
                    : t('skillbridge.submissionLabel')}
                </label>
                <VoiceInputButton
                  onTranscript={(text) =>
                    setChallengeResponse((prev) => (prev ? `${prev} ${text}` : text))
                  }
                  className="h-7 w-7 text-stone-500"
                />
              </div>

              <textarea
                rows={4}
                value={challengeResponse}
                onChange={(e) => setChallengeResponse(e.target.value)}
                placeholder={t('skillbridge.solutionPlaceholder')}
                className="w-full px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F]"
                required
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAddPortfolio}
                    onChange={(e) => setAutoAddPortfolio(e.target.checked)}
                    className="rounded text-[#134E3F] focus:ring-[#134E3F] w-4 h-4"
                  />
                  <span>{t('skillbridge.autoAddPortfolio')}</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 self-end sm:self-auto"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>
                    {activeSkill.completed ? t('skillbridge.updateButton') : t('skillbridge.recordButton')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
