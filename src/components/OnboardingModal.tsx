import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Sparkles, UserCheck, Accessibility } from 'lucide-react';
import { UserGoal, Language } from '../types';
import { DEMO_PERSONAS } from '../data/sampleData';

const GOAL_OPTIONS: { id: UserGoal; labelEn: string; labelHi: string; descEn: string }[] = [
  {
    id: 'internship_job',
    labelEn: 'Find an internship or job',
    labelHi: 'इंटर्नशिप या नौकरी खोजें',
    descEn: 'Entry-level roles, tech internships, and junior positions.',
  },
  {
    id: 'build_skills',
    labelEn: 'Build skills for employment',
    labelHi: 'रोजगार के लिए कौशल सीखें',
    descEn: 'Personalized SkillBridge roadmaps and practical challenges.',
  },
  {
    id: 'local_work',
    labelEn: 'Discover local work',
    labelHi: 'स्थानीय काम और गिग्स खोजें',
    descEn: 'Apprenticeships, field coordination, and community opportunities.',
  },
  {
    id: 'grow_business',
    labelEn: 'Grow a small business',
    labelHi: 'छोटा व्यवसाय या कारीगरी बढ़ाएं',
    descEn: 'Showcase local services, receive inquiries, and hire helpers.',
  },
];

const PRESET_SKILLS = [
  'HTML & CSS',
  'Basic JavaScript',
  'Data Entry',
  'Verbal Communication (Hindi/English)',
  'Solar Inverter Wiring',
  'Electrical Troubleshooting',
  'Inventory Tracking',
  'WhatsApp Business',
  'Content Writing',
  'Battery Diagnostics',
];

export const OnboardingModal: React.FC = () => {
  const {
    showOnboardingModal,
    setShowOnboardingModal,
    profile,
    updateProfile,
    loadPersona,
    language,
    setLanguage,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [emailOrPhone, setEmailOrPhone] = useState(profile.emailOrPhone);
  const [goals, setGoals] = useState<UserGoal[]>(profile.goals);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [location, setLocation] = useState(profile.location);
  const [availability, setAvailability] = useState(profile.availability);
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel);
  const [bio, setBio] = useState(profile.bio);
  const [selectedLang, setSelectedLang] = useState<Language>(profile.language);
  const [simplifiedLang, setSimplifiedLang] = useState(profile.accessibility.simplifiedLanguage);
  const [lowBandwidth, setLowBandwidth] = useState(profile.accessibility.lowBandwidth);

  if (!showOnboardingModal) return null;

  const toggleGoal = (goal: UserGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkillInput.trim() && !skills.includes(customSkillInput.trim())) {
      setSkills((prev) => [...prev, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleSave = () => {
    updateProfile({
      name: name.trim() || 'Aspirant',
      emailOrPhone,
      goals: goals.length > 0 ? goals : ['internship_job'],
      skills,
      location: location.trim() || 'Pan-India',
      availability,
      educationLevel,
      bio,
      language: selectedLang,
      accessibility: {
        ...profile.accessibility,
        simplifiedLanguage: simplifiedLang,
        lowBandwidth,
      },
    });
    setLanguage(selectedLang);
    setShowOnboardingModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#FBF9F5] px-6 py-4 border-b border-stone-200 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {language === 'hi' ? 'अपनी प्रोफ़ाइल और लक्ष्य सेट करें' : 'Your Pathway & Preferences'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Personalize recommendations for jobs, skill milestones, and local business tools.
            </p>
          </div>
          <button
            onClick={() => setShowOnboardingModal(false)}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Preset Demo Personas */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-semibold text-amber-900">
                Quick Demo Personas (One-Click Setup)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    loadPersona(p.id);
                    setShowOnboardingModal(false);
                  }}
                  className="text-left p-2.5 bg-white border border-amber-200 hover:border-amber-400 rounded-lg transition-all group"
                >
                  <p className="text-xs font-bold text-stone-900 group-hover:text-[#134E3F]">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {p.roleTag}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Goals Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800 mb-2">
              1. What are your main goals? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#134E3F] bg-[#134E3F]/5 ring-1 ring-[#134E3F]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#134E3F] border-[#134E3F] text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-900">
                        {language === 'hi' ? g.labelHi : g.labelEn}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        {g.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Personal Info & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pooja Sharma"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Location / District
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Indore, MP or Pune, MH"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
              />
            </div>
          </div>

          {/* 3. Availability & Education */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Availability Schedule
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
              >
                <option value="full_time">Full-time (35-40 hrs/wk)</option>
                <option value="part_time">Part-time (15-20 hrs/wk)</option>
                <option value="weekend">Weekend Shifts</option>
                <option value="flexible_shifts">Flexible / Task-based</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Background / Education (Optional)
              </label>
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="e.g. Student, ITI trade, self-taught"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
              />
            </div>
          </div>

          {/* 4. Skills Selection & Custom Add */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800 mb-2">
              4. Select Your Current Skills
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESET_SKILLS.map((sk) => {
                const active = skills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      active
                        ? 'bg-[#134E3F] border-[#134E3F] text-white font-medium'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {active ? `✓ ${sk}` : `+ ${sk}`}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Type other skill (e.g. Figma, Welding, Bookkeeping) and hit Add..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors shrink-0"
              >
                Add Skill
              </button>
            </form>
          </div>

          {/* 5. Inclusive Access & Language */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-stone-700" />
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                5. Inclusive Access &amp; Language Preferences
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Interface Language
                </label>
                <div className="flex rounded-lg border border-stone-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedLang('en')}
                    className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                      selectedLang === 'en'
                        ? 'bg-[#134E3F] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang('hi')}
                    className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                      selectedLang === 'hi'
                        ? 'bg-[#134E3F] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-stone-900">Simplified Text</p>
                  <p className="text-[10px] text-stone-500">Everyday plain phrasing</p>
                </div>
                <input
                  type="checkbox"
                  checked={simplifiedLang}
                  onChange={(e) => setSimplifiedLang(e.target.checked)}
                  className="rounded text-[#134E3F] focus:ring-[#134E3F] w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-stone-900">Low-Bandwidth</p>
                  <p className="text-[10px] text-stone-500">Optimized data saver</p>
                </div>
                <input
                  type="checkbox"
                  checked={lowBandwidth}
                  onChange={(e) => setLowBandwidth(e.target.checked)}
                  className="rounded text-[#134E3F] focus:ring-[#134E3F] w-4 h-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-[#F5F2EB] px-6 py-3.5 border-t border-stone-200 flex items-center justify-end gap-3 z-10">
          <button
            type="button"
            onClick={() => setShowOnboardingModal(false)}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors shadow-sm"
          >
            Save &amp; Update Pathway
          </button>
        </div>
      </div>
    </div>
  );
};
