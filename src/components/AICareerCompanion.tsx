import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  FileText,
  Calendar,
  Send,
  Copy,
  Check,
  RotateCw,
  MessageSquare,
  Bot,
  ShieldAlert,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

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

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId) || opportunities[0];

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
        question: customQ || mentorQuestion || 'How do I start applying for entry jobs with confidence?',
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
      const title = payload?.title || 'This role';
      const org = payload?.organization || 'Partner Organisation';
      if (isHi) {
        return `### 📌 काम का सरल विवरण: ${title} (${org})\n\n**1. रोज़ाना आपको क्या करना होगा:**\n• टीम के साथ मिलकर दैनिक कार्यों की योजना बनाना और काम पूरा करना।\n• ग्राहक या सहकर्मियों के सवालों का समय पर और स्पष्ट उत्तर देना।\n• काम की प्रगति को डिजिटल शीट या ऐप में सुरक्षित दर्ज करना।\n\n**2. आवश्यक मूलभूत समझ:**\n• काम सीखने की तत्परता और समय की पाबंदी।\n• बातचीत में स्पष्टता और बुनियादी डिजिटल समझ।\n\n**3. आवेदन से पहले तैयारी:**\n• अपने पिछले अनुभवों या प्रोजेक्ट का 1 संक्षिप्त विवरण तैयार करें।`;
      }
      return `### 📌 Plain-Language Breakdown: ${title} at ${org}\n\n**1. What you will actually do day-to-day:**\n• Coordinate with leads to complete allocated daily tasks on schedule.\n• Communicate clearly with customers, team members, or field partners.\n• Maintain organized notes, basic digital records, or spreadsheets.\n\n**2. Core skills you really need:**\n• Dependability, clear communication, and willingness to learn on the job.\n• Basic familiarity with tools and working mode (${payload?.workMode || 'flexible'}).\n\n**3. How to prepare before applying:**\n• Review 1-2 examples from your studies, freelance tasks, or community work.`;
    }

    if (mode === 'resume_summary') {
      const skills = payload?.skills?.length ? payload.skills.slice(0, 3).join(', ') : 'digital communication and task coordination';
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
      title: 'Copied to Clipboard',
      description: 'You can paste this guidance into notes or your resume.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToProfileBio = () => {
    if (!resultContent) return;
    updateProfile({ bio: resultContent });
    addToast({
      type: 'success',
      title: 'Saved to Profile Bio',
      description: 'Your personal summary has been updated.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#134E3F] tracking-wide uppercase mb-1">
          <span>AI Guidance System</span>
          <span aria-hidden="true">·</span>
          <span>Transparent &amp; Dignity-Centered</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {language === 'hi' ? 'एआई करियर साथी' : 'AI Career Companion'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
          Get jargon-free job explanations, personalized skill comparisons, verified résumé summaries, and honest step-by-step career plans powered by Google AI or verified deterministic algorithms.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'simplify_job' as GuidanceMode, label: 'Explain Job Description', icon: BookOpen },
          { id: 'skill_gap' as GuidanceMode, label: 'Skill Gap & Bridge', icon: Sparkles },
          { id: 'resume_summary' as GuidanceMode, label: 'Draft Résumé Summary', icon: FileText },
          { id: 'career_plan' as GuidanceMode, label: '30-Day Career Plan', icon: Calendar },
          { id: 'mentor_chat' as GuidanceMode, label: 'Ask Career Mentor', icon: MessageSquare },
        ].map((tab) => {
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
          {/* Mode 1 & 2: Job Selector */}
          {(activeMode === 'simplify_job' || activeMode === 'skill_gap') && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Select Opportunity to Analyze
              </label>
              <select
                value={selectedOppId}
                onChange={(e) => setSelectedOppId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#134E3F]"
              >
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.organization})
                  </option>
                ))}
              </select>

              {selectedOpp && (
                <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 text-stone-600 border border-stone-100">
                  <p><strong className="text-stone-800">Role:</strong> {selectedOpp.title}</p>
                  <p><strong className="text-stone-800">Mode:</strong> {selectedOpp.workMode} · {selectedOpp.location}</p>
                  <p><strong className="text-stone-800">Required Skills:</strong> {selectedOpp.skillsRequired.join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Résumé Context */}
          {activeMode === 'resume_summary' && (
            <div className="space-y-3 text-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                User Profile Data (No Fabrications)
              </label>
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-100 text-stone-600">
                <p><strong className="text-stone-800">Name:</strong> {profile.name}</p>
                <p><strong className="text-stone-800">Target Goals:</strong> {profile.goals.join(', ')}</p>
                <p><strong className="text-stone-800">Current Skills:</strong> {profile.skills.join(', ')}</p>
                <p><strong className="text-stone-800">Location:</strong> {profile.location}</p>
              </div>
              <p className="text-[11px] text-stone-500">
                Generates a clean 3-sentence professional summary strictly rooted in your actual verified details.
              </p>
            </div>
          )}

          {/* Mode 4: Career Plan Context */}
          {activeMode === 'career_plan' && (
            <div className="space-y-3 text-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Plan Constraints
              </label>
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-100 text-stone-600">
                <p><strong className="text-stone-800">Availability:</strong> {profile.availability.replace('_', ' ')}</p>
                <p><strong className="text-stone-800">Current Competencies:</strong> {profile.skills.length} skills listed</p>
                <p><strong className="text-stone-800">Preferred Language:</strong> {language === 'hi' ? 'Hindi' : 'English'}</p>
              </div>
              <p className="text-[11px] text-stone-500">
                Outputs an achievable 4-week calendar with 2 practical actions per week and 1 demonstrable deliverable.
              </p>
            </div>
          )}

          {/* Mode 5: Career Mentor Chat */}
          {activeMode === 'mentor_chat' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Ask Your Question
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
                placeholder="Ask about interviewing, balancing freelance work, transitioning trades, or negotiating local freelance quotes..."
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F]"
              />
              <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                <span>Quick prompts:</span>
                <button
                  type="button"
                  onClick={() => setMentorQuestion('How do I explain self-taught web skills in an interview?')}
                  className="underline hover:text-stone-900"
                >
                  "Explaining self-taught skills"
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setMentorQuestion('What questions should I ask before starting a solar installation apprenticeship?')}
                  className="underline hover:text-stone-900"
                >
                  "Solar apprenticeship tips"
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
                <span>Generating Guidance...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {activeMode === 'simplify_job' && 'Explain in Plain Terms'}
                  {activeMode === 'skill_gap' && 'Analyze Skill Gap'}
                  {activeMode === 'resume_summary' && 'Generate Résumé Summary'}
                  {activeMode === 'career_plan' && 'Generate 30-Day Plan'}
                  {activeMode === 'mentor_chat' && 'Get Mentor Advice'}
                </span>
              </>
            )}
          </button>

          {/* Ethical Guardrail Notice */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-500 flex items-start gap-2 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              <strong>Integrity Guardrail:</strong> KaamSetu never hallucinates experience, fabricates certifications, or promises guaranteed job placements. Guidance focuses strictly on realistic skill progression.
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
                  Guidance Output
                </h3>
              </div>

              {resultSource && (
                <span className="text-[11px] text-stone-500">
                  Engine: <strong className="text-stone-700 capitalize">{resultSource.replace('_', ' ')}</strong>
                </span>
              )}
            </div>

            {isLoading && (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#134E3F] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-stone-500">Analyzing career path and generating clear guidance...</p>
              </div>
            )}

            {!isLoading && !resultContent && (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-stone-800">No Guidance Generated Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Select your target opportunity or ask a question on the left and click the generate button.
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
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              {activeMode === 'resume_summary' && (
                <button
                  onClick={handleApplyToProfileBio}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save as My Profile Bio</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
