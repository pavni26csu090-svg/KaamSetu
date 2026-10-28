import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  FileText,
  Calendar,
  Copy,
  Check,
  RotateCw,
  MessageSquare,
  Bot,
  ShieldAlert,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import { OpportunitySelector } from './OpportunitySelector';
import { getLocalizedOpp } from '../utils/localization';

type GuidanceMode =
  | 'simplify_job'
  | 'skill_gap'
  | 'resume_summary'
  | 'career_plan'
  | 'mentor_chat';

export const AICareerCompanion: React.FC = () => {
  const {
    opportunities,
    profile,
    updateProfile,
    language,
    t,
    addToast,
    selectedOpportunityForSkillBridge,
  } = useApp();

  const [activeMode, setActiveMode] = useState<GuidanceMode>('simplify_job');
  const [selectedOppId, setSelectedOppId] = useState<string>(
    selectedOpportunityForSkillBridge?.id || opportunities[0]?.id || ''
  );
  const [mentorQuestion, setMentorQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultContent, setResultContent] = useState<string | null>(null);
  const [resultSource, setResultSource] = useState<'gemini' | 'deterministic_fallback' | null>(null);
  const [copied, setCopied] = useState(false);

  const rawSelectedOpp = opportunities.find((o) => o.id === selectedOppId) || opportunities[0];
  const selectedOpp = rawSelectedOpp ? getLocalizedOpp(rawSelectedOpp, language) : null;

  const handleGenerate = async (mode: GuidanceMode = activeMode, customQ?: string) => {
    setIsLoading(true);
    setResultContent(null);
    setResultSource(null);

    let payload: any = {};
    if (mode === 'simplify_job') {
      payload = {
        title: selectedOpp?.title,
        organization: selectedOpp?.organization,
        workMode: selectedOpp?.workMode,
        location: selectedOpp?.location,
        stipend: selectedOpp?.stipend,
        requirements: selectedOpp?.requirements,
        description: selectedOpp?.description,
      };
    } else if (mode === 'skill_gap') {
      payload = {
        title: selectedOpp?.title,
        userSkills: profile.skills,
        requiredSkills: selectedOpp?.skillsRequired,
      };
    } else if (mode === 'resume_summary') {
      payload = {
        name: profile.name,
        goal: profile.goals.join(', '),
        skills: profile.skills,
        interests: profile.interests.join(', '),
        location: profile.location,
      };
    } else if (mode === 'career_plan') {
      payload = {
        goal: profile.goals.join(', '),
        skills: profile.skills,
        availability: profile.availability,
        location: profile.location,
      };
    } else if (mode === 'mentor_chat') {
      payload = {
        question: customQ || mentorQuestion || (language === 'hi' ? 'शुरुआती नौकरी के लिए आत्मविश्वास से आवेदन कैसे करूं?' : 'How do I start applying for entry jobs with confidence?'),
        goal: profile.goals.join(', '),
        skills: profile.skills,
      };
    }

    try {
      const res = await fetch('/api/ai/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          payload,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setResultContent(data.content);
      setResultSource(data.source);
    } catch (err) {
      console.warn('API error, falling back locally:', err);
      // Client-side instant deterministic fallback
      const fallbackText = getClientFallback(mode, payload, language);
      setResultContent(fallbackText);
      setResultSource('deterministic_fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const getClientFallback = (mode: GuidanceMode, payload: any, lang: string) => {
    const isHi = lang === 'hi';
    if (mode === 'simplify_job') {
      const title = payload?.title || (isHi ? 'यह पद' : 'This role');
      const org = payload?.organization || (isHi ? 'साझेदार संगठन' : 'Partner Organisation');
      if (isHi) {
        return `### 📌 काम का सरल विवरण: ${title} (${org})\n\n**1. रोज़ाना आपको क्या करना होगा:**\n• टीम के साथ मिलकर दैनिक कार्यों की योजना बनाना और काम पूरा करना।\n• ग्राहक या सहकर्मियों के सवालों का समय पर और स्पष्ट उत्तर देना।\n• काम की प्रगति को डिजिटल शीट या ऐप में सुरक्षित दर्ज करना।\n\n**2. आवश्यक मूलभूत समझ:**\n• काम सीखने की तत्परता और समय की पाबंदी।\n• बातचीत में स्पष्टता और बुनियादी डिजिटल समझ।\n\n**3. आवेदन से पहले तैयारी:**\n• अपने पिछले अनुभवों या प्रोजेक्ट का 1 संक्षिप्त विवरण तैयार करें।`;
      }
      return `### 📌 Plain-Language Breakdown: ${title} at ${org}\n\n**1. What you will actually do day-to-day:**\n• Coordinate with leads to complete allocated daily tasks on schedule.\n• Communicate clearly with customers, team members, or field partners.\n• Maintain organized notes, basic digital records, or spreadsheets.\n\n**2. Core skills you really need:**\n• Dependability, clear communication, and willingness to learn on the job.\n• Basic familiarity with tools and working mode (${payload?.workMode || 'flexible'}).\n\n**3. How to prepare before applying:**\n• Review 1-2 examples from your studies, freelance tasks, or community work.`;
    }

    if (mode === 'resume_summary') {
      const skills = payload?.skills?.length ? payload.skills.slice(0, 3).join(', ') : (isHi ? 'डिजिटल संचार और कार्य समन्वय' : 'digital communication and task coordination');
      if (isHi) {
        return `सक्रिय और लक्ष्य-उन्मुख उम्मीदवार, जो ${skills} में व्यावहारिक समझ रखते हैं। टीम में वास्तविक योगदान देने और निरंतर नए कौशल सीखने के लिए समर्पित।`;
      }
      return `Driven candidate with demonstrable competence in ${skills}. Dedicated to learning quickly on the job, adapting to modern workflows, and delivering reliable team results without unnecessary complexity.`;
    }

    if (mode === 'career_plan') {
      if (isHi) {
        return `### 📅 30-दिवसीय व्यावहारिक करियर रोडमैप\n\n**सप्ताह 1: मूलभूत तैयारी**\n• KaamSetu पर 1 स्किलब्रिज चैलेंज पूरा करें और अपना रिज्यूमे सारांश अपडेट करें।\n\n**सप्ताह 2: पोर्टफोलियो निर्माण**\n• अपने क्षेत्र में 1 छोटा मिनी-प्रोजेक्ट बनाएं और पोर्टफोलियो में जोड़ें।\n\n**सप्ताह 3: लक्षित आवेदन**\n• 3 उपयुक्त अवसरों (इंटर्नशिप या लोकल काम) में आवेदन भेजें।\n\n**सप्ताह 4: निरंतर प्रगति**\n• स्थिति ट्रैक करें और 30 मिनट दैनिक नए कौशल का अभ्यास करें।`;
      }
      return `### 📅 Realistic 30-Day Action Roadmap\n\n**Week 1: Foundations & Readiness**\n• Complete 1 SkillBridge challenge and refine your summary bio.\n\n**Week 2: Tangible Proof**\n• Build 1 sample deliverable and attach evidence to your portfolio.\n\n**Week 3: Targeted Outreach**\n• Apply to 3 high-fit opportunities with customized problem-solving notes.\n\n**Week 4: Follow-Through**\n• Review responses and dedicate 45 minutes daily to your next competency milestone.`;
    }

    if (mode === 'skill_gap') {
      if (isHi) {
        return `### 🎯 कौशल विश्लेषण\n• आपके पास पहले से मजबूत आधार है।\n• आगामी 14 दिनों में लक्षित टूल्स के 1-2 हैंड्स-ऑन ट्यूटोरियल देखें और KaamSetu में प्रोजेक्ट सबमिट करें।`;
      }
      return `### 🎯 Skill Gap Guidance\n• You possess foundational competencies.\n• Over the next 14 days, focus on hands-on practice for missing requirements and record proof in your portfolio.`;
    }

    // Mentor chat
    if (isHi) {
      return `नमस्ते! आपके प्रश्न के संदर्भ में: छोटे और सुसंगत कदम उठाना सबसे अधिक प्रभावी है। सबसे पहले 1-2 मजबूत कौशलों पर ध्यान दें, एक छोटा प्रोजेक्ट बनाएं, और फिर आवेदन करें।`;
    }
    return `Great question! The most sustainable career path begins with focusing on 1-2 demonstrable skills where you can show practical output. Feel free to ask more specific questions about interviews, daily work, or local business outreach.`;
  };

  const handleCopy = () => {
    if (!resultContent) return;
    navigator.clipboard.writeText(resultContent);
    setCopied(true);
    addToast({
      type: 'success',
      title: language === 'hi' ? 'क्लिपबोर्ड पर कॉपी किया गया' : 'Copied to Clipboard',
      description: language === 'hi' ? 'आप इसे अपने नोट्स या रिज्यूमे में पेस्ट कर सकते हैं।' : 'You can paste this guidance into notes or your resume.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToProfileBio = () => {
    if (!resultContent) return;
    updateProfile({ bio: resultContent });
    addToast({
      type: 'success',
      title: language === 'hi' ? 'प्रोफ़ाइल बायो में सहेजा गया' : 'Saved to Profile Bio',
      description: language === 'hi' ? 'आपका व्यक्तिगत सारांश अपडेट कर दिया गया है।' : 'Your personal summary has been updated.',
    });
  };

  const modeTabs = [
    { id: 'simplify_job' as GuidanceMode, label: t('aiCompanion.modeExplainJob'), icon: BookOpen },
    { id: 'skill_gap' as GuidanceMode, label: t('aiCompanion.modeSkillGap'), icon: Sparkles },
    { id: 'resume_summary' as GuidanceMode, label: t('aiCompanion.modeResumeSummary'), icon: FileText },
    { id: 'career_plan' as GuidanceMode, label: t('aiCompanion.modeCareerPlan'), icon: Calendar },
    { id: 'mentor_chat' as GuidanceMode, label: t('aiCompanion.modeMentorChat'), icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#134E3F] tracking-wide uppercase mb-1">
          <span>{t('aiCompanion.kicker')}</span>
          <span aria-hidden="true">·</span>
          <span>{t('aiCompanion.tagline')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('aiCompanion.title')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
          {t('aiCompanion.subtitle')}
        </p>
      </div>

      {/* Simple Mode Active Guide */}
      {Boolean(profile.accessibility?.simplifiedLanguage) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-amber-950">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
            {t('common.simpleModeBadge')}
          </span>
          <p>
            {language === 'hi'
              ? 'सरल भाषा मोड: कोई भी पद चुनें और "नौकरी का सरल विवरण" पर क्लिक करके आसान भाषा में समझें।'
              : 'Simple Mode: Select any role and click "Explain in Plain Terms" to get clear, jargon-free explanations.'}
          </p>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {modeTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMode(tab.id);
                setResultContent(null);
              }}
              className={`px-3.5 py-2 rounded-xl font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#134E3F] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Guidance Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Context Input & Trigger */}
        <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          {/* Mode 1 & 2: Searchable Categorized Opportunity Selector */}
          {(activeMode === 'simplify_job' || activeMode === 'skill_gap') && (
            <OpportunitySelector
              label={t('aiCompanion.selectOppToAnalyze')}
              selectedId={selectedOppId}
              onSelect={(opp) => setSelectedOppId(opp.id)}
              showDetailsSummary={true}
            />
          )}

          {/* Mode 3: Résumé Context */}
          {activeMode === 'resume_summary' && (
            <div className="space-y-3 text-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                {t('aiCompanion.userProfileDataNoFabrications')}
              </label>
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-100 text-stone-600">
                <p><strong className="text-stone-800">{t('common.name')}:</strong> {profile.name}</p>
                <p><strong className="text-stone-800">{t('aiCompanion.targetGoalsLabel')}</strong> {profile.goals.join(', ')}</p>
                <p><strong className="text-stone-800">{t('common.skills')}:</strong> {profile.skills.join(', ')}</p>
                <p><strong className="text-stone-800">{t('common.location')}:</strong> {profile.location}</p>
              </div>
              <p className="text-[11px] text-stone-500">
                {t('aiCompanion.resumeDisclaimer')}
              </p>
            </div>
          )}

          {/* Mode 4: Career Plan Context */}
          {activeMode === 'career_plan' && (
            <div className="space-y-3 text-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                {t('aiCompanion.planConstraints')}
              </label>
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-100 text-stone-600">
                <p><strong className="text-stone-800">{t('aiCompanion.availabilityLabel')}</strong> {profile.availability.replace('_', ' ')}</p>
                <p><strong className="text-stone-800">{t('aiCompanion.competenciesLabel')}</strong> {profile.skills.length}</p>
                <p><strong className="text-stone-800">{t('aiCompanion.preferredLangLabel')}</strong> {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}</p>
              </div>
              <p className="text-[11px] text-stone-500">
                {t('aiCompanion.planDisclaimer')}
              </p>
            </div>
          )}

          {/* Mode 5: Career Mentor Chat */}
          {activeMode === 'mentor_chat' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  {t('aiCompanion.askQuestionLabel')}
                </label>
                <VoiceInputButton
                  onTranscript={(text) => setMentorQuestion(text)}
                  className="h-7 w-7 text-stone-500"
                />
              </div>
              <textarea
                rows={4}
                value={mentorQuestion}
                onChange={(e) => setMentorQuestion(e.target.value)}
                placeholder={t('aiCompanion.questionPlaceholder')}
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F]"
              />
              <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                <span>{t('aiCompanion.quickPrompts')}</span>
                <button
                  type="button"
                  onClick={() => setMentorQuestion(language === 'hi' ? 'इंटरव्यू में अपने द्वारा सीखे गए डिजिटल हुनर को कैसे समझाएं?' : 'How do I explain self-taught web skills in an interview?')}
                  className="underline hover:text-stone-900"
                >
                  {t('aiCompanion.promptSelfTaught')}
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setMentorQuestion(language === 'hi' ? 'सोलर इंस्टॉलेशन शिक्षुता शुरू करने से पहले क्या पूछना चाहिए?' : 'What questions should I ask before starting a solar installation apprenticeship?')}
                  className="underline hover:text-stone-900"
                >
                  {t('aiCompanion.promptSolarTips')}
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={() => handleGenerate(activeMode)}
            disabled={isLoading}
            className="w-full py-3 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>{t('aiCompanion.generatingButton')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {activeMode === 'simplify_job' && t('aiCompanion.btnExplainJob')}
                  {activeMode === 'skill_gap' && t('aiCompanion.btnAnalyzeGap')}
                  {activeMode === 'resume_summary' && t('aiCompanion.btnResumeSummary')}
                  {activeMode === 'career_plan' && t('aiCompanion.btnCareerPlan')}
                  {activeMode === 'mentor_chat' && t('aiCompanion.btnMentorAdvice')}
                </span>
              </>
            )}
          </button>

          {/* Ethical Guardrail Notice */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-500 flex items-start gap-2 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              <strong>{t('aiCompanion.integrityGuardrailTitle')}</strong> {t('aiCompanion.integrityGuardrailText')}
            </span>
          </div>
        </div>

        {/* Right Column: Guidance Output Workspace */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#134E3F]" />
                <h3 className="text-sm font-bold text-stone-900">
                  {t('aiCompanion.outputTitle')}
                </h3>
              </div>

              {resultSource && (
                <span className="text-[11px] text-stone-500">
                  {t('aiCompanion.engineLabel', { source: resultSource.replace('_', ' ') })}
                </span>
              )}
            </div>

            {isLoading && (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#134E3F] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-stone-500">{t('aiCompanion.analyzingWait')}</p>
              </div>
            )}

            {!isLoading && !resultContent && (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-stone-800">{t('aiCompanion.emptyOutputTitle')}</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {t('aiCompanion.emptyOutputSub')}
                </p>
              </div>
            )}

            {!isLoading && resultContent && (
              <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line space-y-3 font-sans">
                {resultContent}
              </div>
            )}
          </div>

          {/* Action Footer when result is available */}
          {!isLoading && resultContent && (
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 mt-6">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('aiCompanion.copiedText') : t('aiCompanion.copyText')}</span>
              </button>

              {activeMode === 'resume_summary' && (
                <button
                  onClick={handleApplyToProfileBio}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('aiCompanion.saveAsBio')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
