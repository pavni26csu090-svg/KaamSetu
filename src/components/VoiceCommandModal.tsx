import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Search,
  Sparkles,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Info,
  MapPin,
  Building2,
  Briefcase,
  SlidersHorizontal,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Opportunity, OpportunityCategory, Language } from '../types';
import {
  parseVoiceIntent,
  matchOpportunities,
  getRecommendedCategories,
  ParsedVoiceIntent,
  MatchedOpportunityResult,
} from '../utils/voiceIntentParser';
import { getLocalizedOpp } from '../utils/localization';

export type VoiceState = 'ready' | 'listening' | 'processing' | 'results' | 'error';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  startListeningOnInit?: boolean;
  initialQuery?: string;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen,
  onClose,
  startListeningOnInit = false,
  initialQuery = '',
}) => {
  const {
    opportunities,
    language,
    profile,
    setSelectedOpportunityForDetail,
    setCurrentView,
    setSearchQuery,
    setSelectedTypeFilter,
  } = useApp();

  const isSimpleMode = Boolean(profile.accessibility?.simplifiedLanguage);

  // Recognition Language: default to app language, but user can toggle
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>(language === 'hi' ? 'hi' : 'en');
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [transcript, setTranscript] = useState<string>(initialQuery);
  const [interimText, setInterimText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  // Parsed intent & results
  const [parsedIntent, setParsedIntent] = useState<ParsedVoiceIntent | null>(null);
  const [matchedResults, setMatchedResults] = useState<MatchedOpportunityResult[]>([]);
  const [manualQuery, setManualQuery] = useState<string>('');

  // Active criteria filters that user can remove dynamically
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<OpportunityCategory | undefined>(undefined);
  const [activeWorkModeFilter, setActiveWorkModeFilter] = useState<string | undefined>(undefined);
  const [activeJobTypeFilter, setActiveJobTypeFilter] = useState<string | undefined>(undefined);
  const [activeLocationFilter, setActiveLocationFilter] = useState<string | undefined>(undefined);

  const recognitionRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync voiceLang with profile language on modal open if not touched
  useEffect(() => {
    if (isOpen) {
      setVoiceLang(language === 'hi' ? 'hi' : 'en');
    }
  }, [isOpen, language]);

  // Check Web Speech API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Execute Search from query
  const executeSearch = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      setVoiceState('ready');
      return;
    }

    setVoiceState('processing');
    setTranscript(trimmed);
    setManualQuery(trimmed);

    // Intent parsing
    const intent = parseVoiceIntent(trimmed);
    setParsedIntent(intent);
    setActiveCategoryFilter(intent.category);
    setActiveWorkModeFilter(intent.workMode);
    setActiveJobTypeFilter(intent.jobType);
    setActiveLocationFilter(intent.location);

    // Execute matching against real opportunities dataset
    const matches = matchOpportunities(intent, opportunities, language);
    setMatchedResults(matches);
    setVoiceState('results');
  };

  // Re-filter when user removes or changes a criteria chip
  const reFilterWithModifiedCriteria = (
    newCategory?: OpportunityCategory,
    newWorkMode?: string,
    newJobType?: string,
    newLocation?: string
  ) => {
    if (!parsedIntent) return;

    const modifiedIntent: ParsedVoiceIntent = {
      ...parsedIntent,
      category: newCategory,
      workMode: newWorkMode as any,
      jobType: newJobType as any,
      location: newLocation,
    };

    const matches = matchOpportunities(modifiedIntent, opportunities, language);
    setMatchedResults(matches);
  };

  // Start speech recognition
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setVoiceState('error');
      setErrorMessage(
        voiceLang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस पहचान उपलब्ध नहीं है। कृपया नीचे लिखकर खोजें।'
          : 'Speech recognition is not supported in this browser. Please type your query naturally below.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState('listening');
        setInterimText('');
        setErrorMessage('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTranscript) {
          setInterimText('');
          executeSearch(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceState('error');
          setErrorMessage(
            voiceLang === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत हो गई। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें या नीचे लिखें।'
              : 'Microphone permission was denied. Please allow microphone access in your browser or type your search naturally below.'
          );
        } else if (event.error === 'no-speech') {
          setVoiceState('error');
          setErrorMessage(
            voiceLang === 'hi'
              ? 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन के पास साफ़ बोलें या दोबारा प्रयास करें।'
              : 'No speech was detected. Please check your microphone and speak clearly, or type your query.'
          );
        } else {
          setVoiceState('error');
          setErrorMessage(
            voiceLang === 'hi'
              ? 'वॉइस पहचान में समस्या आई। आप नीचे लिखकर तुरंत खोज सकते हैं।'
              : `Speech recognition encountered an issue (${event.error}). You can type your request below.`
          );
        }
      };

      recognition.onend = () => {
        // If we were listening and got an interim text that wasn't finalized
        if (interimText && voiceState === 'listening') {
          executeSearch(interimText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setVoiceState('error');
      setErrorMessage(
        voiceLang === 'hi'
          ? 'माइक्रोफ़ोन शुरू नहीं हो सका। कृपया टेक्स्ट खोज का उपयोग करें।'
          : 'Could not access microphone. Please type your query below.'
      );
    }
  };

  // Stop listening manually
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (interimText) {
      executeSearch(interimText);
    } else if (voiceState === 'listening') {
      setVoiceState('ready');
    }
  };

  // On initial open
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        executeSearch(initialQuery);
      } else if (startListeningOnInit) {
        startListening();
      } else {
        setVoiceState('ready');
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setInterimText('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    onClose();
  };

  const handleViewOpportunityDetails = (opp: Opportunity) => {
    setSelectedOpportunityForDetail(opp);
    setCurrentView('opportunities');
    handleClose();
  };

  const handleSelectCategoryFallback = (cat: OpportunityCategory) => {
    const oppsInCat = opportunities.filter((o) => o.category === cat);
    setMatchedResults(
      oppsInCat.map((o) => ({
        opportunity: o,
        score: 30,
        matchReasons: [
          {
            en: `Selected Category: ${cat.replace('_', ' ')}`,
            hi: `चुनी गई श्रेणी`,
          },
        ],
      }))
    );
    setActiveCategoryFilter(cat);
    setVoiceState('results');
  };

  if (!isOpen) return null;

  // Example suggested queries
  const sampleVoicePrompts = [
    {
      en: 'Find frontend internships for beginners.',
      hi: 'शुरुआती लोगों के लिए फ्रंटएंड इंटर्नशिप खोजें।',
    },
    {
      en: 'Show remote Python jobs.',
      hi: 'रिमोट पायथन जॉब्स दिखाएं।',
    },
    {
      en: 'Mujhe Delhi mein part-time job chahiye.',
      hi: 'मुझे दिल्ली में पार्ट-टाइम जॉब चाहिए।',
    },
    {
      en: 'Aisi internship dikhao jisme training bhi mile.',
      hi: 'ऐसी इंटर्नशिप दिखाओ जिसमें ट्रेनिंग भी मिले।',
    },
    {
      en: 'Find electronics or robotics opportunities.',
      hi: 'इलेक्ट्रॉनिक्स या रोबोटिक्स के अवसर खोजें।',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-stone-50/90 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#134E3F] text-amber-200 flex items-center justify-center shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="text-base sm:text-lg font-bold text-stone-900">
                {voiceLang === 'hi' ? 'वॉइस कमांड व नेचुरल सर्च' : 'Voice Command & Natural Search'}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500">
                {voiceLang === 'hi'
                  ? 'अपनी भाषा में बोलें — हम सीधे सही अवसर ढूंढेंगे'
                  : 'Speak naturally in English, Hindi, or Hinglish to match real opportunities'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setVoiceLang('en')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  voiceLang === 'en'
                    ? 'bg-white text-[#134E3F] shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Switch voice speech language to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setVoiceLang('hi')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  voiceLang === 'hi'
                    ? 'bg-white text-[#134E3F] shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Switch voice speech language to Hindi"
              >
                हिन्दी
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
              aria-label="Close voice search modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Status Indicator Bar */}
          <div aria-live="polite" className="sr-only">
            {voiceState === 'listening'
              ? 'Listening to microphone...'
              : voiceState === 'processing'
              ? 'Processing speech...'
              : voiceState === 'results'
              ? `Found ${matchedResults.length} opportunities.`
              : ''}
          </div>

          {/* Simple Mode Announcement */}
          {isSimpleMode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                Simple Mode Active
              </span>
              <span>
                {voiceLang === 'hi'
                  ? 'सरल मोड सक्रिय: बड़े बटन और स्पष्ट निर्देश।'
                  : 'Simple Mode Active: Large buttons, clear speech transcript, and plain match explanations.'}
              </span>
            </div>
          )}

          {/* STATE 1: READY */}
          {voiceState === 'ready' && (
            <div className="text-center py-6 sm:py-8 space-y-6">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={startListening}
                  className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#134E3F] text-white flex flex-col items-center justify-center shadow-lg hover:bg-[#0E3B30] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-[#134E3F]/30"
                  aria-label="Click to start speaking"
                >
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-amber-200 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold mt-1 text-white">
                    {voiceLang === 'hi' ? 'बोलें' : 'Speak'}
                  </span>
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {voiceLang === 'hi'
                    ? 'माइक्रोफ़ोन पर क्लिक करें और बोलें'
                    : 'Click the microphone and speak naturally'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  {voiceLang === 'hi'
                    ? 'आप हिंदी या अंग्रेजी में अपनी पसंद का काम, शहर या इंटर्नशिप बता सकते हैं।'
                    : 'Mention desired roles, skills, locations, remote preference, or beginner internships.'}
                </p>
              </div>

              {/* Sample Quick Voice Prompts */}
              <div className="pt-2 border-t border-stone-100 max-w-xl mx-auto space-y-2">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {voiceLang === 'hi' ? 'उदाहरणात्मक वाक्य (क्लिक करके आज़माएं):' : 'Try saying (or click to test):'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {sampleVoicePrompts.map((p, idx) => {
                    const text = voiceLang === 'hi' ? p.hi : p.en;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => executeSearch(text)}
                        className="px-3 py-1.5 text-xs text-left bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full border border-stone-200/60 transition-colors flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>"{text}"</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Natural Text Fallback Input */}
              <div className="pt-4 max-w-lg mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualQuery.trim()) executeSearch(manualQuery);
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder={
                      voiceLang === 'hi'
                        ? 'या यहाँ टाइप करें (उदा. "Delhi mein remote python job")'
                        : 'Or type naturally (e.g. "remote Python jobs for freshers")'
                    }
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#134E3F] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-xl transition-colors whitespace-nowrap shadow-xs"
                  >
                    {voiceLang === 'hi' ? 'खोजें' : 'Search'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STATE 2: LISTENING */}
          {voiceState === 'listening' && (
            <div className="text-center py-8 sm:py-10 space-y-6">
              {/* Pulsing Animated Waveform Ring */}
              <div className="relative inline-flex items-center justify-center">
                <span className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-rose-400/20 animate-ping" />
                <span className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-400/30 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                  <Mic className="w-10 h-10 text-white animate-bounce" />
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  {voiceLang === 'hi' ? 'माइक्रोफ़ोन सुन रहा है...' : 'Listening... Speak now'}
                </div>
                <p className="text-sm font-medium text-stone-800">
                  {voiceLang === 'hi'
                    ? 'कृपया साफ़-साफ़ बोलें। बोलने के बाद बटन दबाएं या रुकें।'
                    : 'Speak naturally. Mention roles, location, remote, or training.'}
                </p>

                {/* Live Real-time Interim Transcript */}
                <div className="min-h-12 p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 italic text-sm">
                  {interimText ? (
                    <span>"{interimText}"</span>
                  ) : (
                    <span className="text-stone-400">
                      {voiceLang === 'hi' ? 'आपकी आवाज़ की प्रतीक्षा...' : 'Waiting for voice audio...'}
                    </span>
                  )}
                </div>
              </div>

              {/* Stop & Process Control */}
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  <span>{voiceLang === 'hi' ? 'रोकें और खोजें' : 'Stop & Search Now'}</span>
                </button>
              </div>

              {/* Privacy Notice */}
              <p className="text-[11px] text-stone-500 max-w-md mx-auto flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>
                  {voiceLang === 'hi'
                    ? 'गोपनीयता: ऑडियो ब्राउज़र में ही प्रोसेस होता है और कहीं स्टोर नहीं होता।'
                    : 'Privacy: Audio is processed via your browser speech API and is never recorded or stored.'}
                </span>
              </p>
            </div>
          )}

          {/* STATE 3: PROCESSING */}
          {voiceState === 'processing' && (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-[#134E3F] animate-spin">
                <RotateCw className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">
                  {voiceLang === 'hi' ? 'अनुरोध समझा जा रहा है...' : 'Analyzing spoken intent...'}
                </h3>
                <p className="text-xs text-stone-600">
                  {voiceLang === 'hi'
                    ? `"${transcript}" से करियर फिल्टर निकाले जा रहे हैं`
                    : `Extracting criteria and matching verified demo opportunities for "${transcript}"`}
                </p>
              </div>
            </div>
          )}

          {/* STATE 4: ERROR & FALLBACK */}
          {voiceState === 'error' && (
            <div className="py-6 space-y-6">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <h4 className="font-bold text-rose-900">
                    {voiceLang === 'hi' ? 'वॉइस इनपुट में त्रुटि' : 'Voice Input Notice'}
                  </h4>
                  <p className="text-rose-800 leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              {/* Direct Manual Fallback Input */}
              <div className="space-y-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#134E3F]" />
                  <span>
                    {voiceLang === 'hi'
                      ? 'प्राकृतिक भाषा में टाइप करें (समान परिणाम मिलेंगे):'
                      : 'Type naturally below (extracts the exact same criteria):'}
                  </span>
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualQuery.trim()) executeSearch(manualQuery);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder={
                      voiceLang === 'hi'
                        ? 'उदा. "Delhi mein part time job" या "remote Python jobs"'
                        : 'e.g. "Find frontend internships for beginners" or "remote Python jobs"'
                    }
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#134E3F]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-xl transition-colors whitespace-nowrap shadow-xs"
                  >
                    {voiceLang === 'hi' ? 'खोजें' : 'Search'}
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={startListening}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{voiceLang === 'hi' ? 'माइक्रोफ़ोन फिर आज़माएं' : 'Retry Voice Input'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setVoiceState('ready')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  {voiceLang === 'hi' ? 'प्रारंभिक स्क्रीन' : 'Back to Start'}
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: RESULTS */}
          {voiceState === 'results' && (
            <div className="space-y-5">
              {/* Top Transcript Review & Edit Box */}
              <div className="p-3 sm:p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-[#134E3F]" />
                    <span>{voiceLang === 'hi' ? 'सुनाई दिया (समीक्षा व संपादन):' : 'Spoken Transcript (Review & Edit):'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={startListening}
                    className="text-xs text-[#134E3F] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{voiceLang === 'hi' ? 'दोबारा बोलें' : 'Speak Again'}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder={voiceLang === 'hi' ? 'अनुरोध बदलें...' : 'Adjust search transcript...'}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#134E3F]"
                  />
                  <button
                    type="button"
                    onClick={() => executeSearch(manualQuery)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-xl transition-colors whitespace-nowrap shadow-xs"
                  >
                    {voiceLang === 'hi' ? 'अपडेट करें' : 'Update Search'}
                  </button>
                </div>
              </div>

              {/* Extracted Intent Filter Chips */}
              {parsedIntent && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-stone-600 uppercase tracking-wider text-[11px] flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3 text-stone-500" />
                      <span>{voiceLang === 'hi' ? 'निकाले गए फ़िल्टर:' : 'Understood Criteria:'}</span>
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {voiceLang === 'hi' ? '(हटाने के लिए ✕ पर क्लिक करें)' : '(Click ✕ to remove any constraint)'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* Role Chip */}
                    {parsedIntent.role && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#134E3F]/10 text-[#134E3F] text-xs font-semibold rounded-lg">
                        <span>Role: "{parsedIntent.role}"</span>
                      </span>
                    )}

                    {/* Category Chip */}
                    {activeCategoryFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg">
                        <span>Category: {activeCategoryFilter.replace('_', ' ')}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCategoryFilter(undefined);
                            reFilterWithModifiedCriteria(
                              undefined,
                              activeWorkModeFilter,
                              activeJobTypeFilter,
                              activeLocationFilter
                            );
                          }}
                          className="hover:text-amber-950 font-bold ml-0.5"
                          title="Remove category filter"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {/* Work Mode Chip */}
                    {activeWorkModeFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-lg">
                        <span>Mode: {activeWorkModeFilter}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWorkModeFilter(undefined);
                            reFilterWithModifiedCriteria(
                              activeCategoryFilter,
                              undefined,
                              activeJobTypeFilter,
                              activeLocationFilter
                            );
                          }}
                          className="hover:text-emerald-950 font-bold ml-0.5"
                          title="Remove work mode filter"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {/* Job Type Chip */}
                    {activeJobTypeFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 text-sky-900 text-xs font-semibold rounded-lg">
                        <span>Type: {activeJobTypeFilter}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveJobTypeFilter(undefined);
                            reFilterWithModifiedCriteria(
                              activeCategoryFilter,
                              activeWorkModeFilter,
                              undefined,
                              activeLocationFilter
                            );
                          }}
                          className="hover:text-sky-950 font-bold ml-0.5"
                          title="Remove job type filter"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {/* Location Chip */}
                    {activeLocationFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-900 text-xs font-semibold rounded-lg">
                        <span>Location: {activeLocationFilter}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveLocationFilter(undefined);
                            reFilterWithModifiedCriteria(
                              activeCategoryFilter,
                              activeWorkModeFilter,
                              activeJobTypeFilter,
                              undefined
                            );
                          }}
                          className="hover:text-purple-950 font-bold ml-0.5"
                          title="Remove location filter"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {/* Training Preference Chip */}
                    {parsedIntent.hasTraining && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-900 text-xs font-semibold rounded-lg">
                        <span>Mentorship / Training</span>
                      </span>
                    )}

                    {/* Experience Level Chip */}
                    {parsedIntent.experienceLevel && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg">
                        <span>Level: {parsedIntent.experienceLevel}</span>
                      </span>
                    )}

                    {/* Skills Chips */}
                    {parsedIntent.skills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 text-xs font-medium rounded-lg"
                      >
                        <span>Skill: {sk}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Count & Demo Disclaimer */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    {matchedResults.length > 0 ? (
                      voiceLang === 'hi' ? (
                        `${matchedResults.length} प्रासंगिक अवसर मिले`
                      ) : (
                        `Found ${matchedResults.length} matching opportunities`
                      )
                    ) : (
                      voiceLang === 'hi' ? 'कोई सीधा अवसर नहीं मिला' : 'No direct matches found'
                    )}
                  </span>
                </div>

                <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-[10px] text-amber-900 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>Demo Dataset</span>
                </div>
              </div>

              {/* MATCHED CARDS LIST */}
              {matchedResults.length > 0 ? (
                <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                  {matchedResults.map(({ opportunity, score, matchReasons }) => {
                    const localized = getLocalizedOpp(opportunity, language);

                    return (
                      <div
                        key={opportunity.id}
                        className="p-4 bg-white border border-stone-200/90 rounded-2xl hover:border-[#134E3F]/60 transition-all shadow-2xs space-y-3"
                      >
                        {/* Title, Org & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="space-y-1">
                            <h3 className="text-sm sm:text-base font-bold text-stone-900">
                              {localized.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                              <span className="font-semibold text-stone-800 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                                {localized.organization}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                {localized.location}
                              </span>
                            </div>
                          </div>

                          {/* Work Mode & Type Badges */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                opportunity.workMode === 'remote'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : opportunity.workMode === 'hybrid'
                                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                              }`}
                            >
                              {opportunity.workMode}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200 capitalize">
                              {opportunity.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* WHY THIS MATCHES Badges */}
                        {matchReasons.length > 0 && (
                          <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                              {voiceLang === 'hi' ? 'यह परिणाम क्यों चुना गया:' : 'Why this matches your spoken request:'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {matchReasons.map((r, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[11px] text-amber-950 font-medium bg-white/80 px-2 py-0.5 rounded-md border border-amber-200/60"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{voiceLang === 'hi' ? r.hi : r.en}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stipend, Schedule & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-stone-100 text-xs">
                          <div className="flex flex-wrap items-center gap-3 text-stone-600">
                            <span className="font-semibold text-stone-900">
                              {localized.stipend}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{localized.schedule}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewOpportunityDetails(opportunity)}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                            >
                              <span>{voiceLang === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ZERO RESULTS STATE */
                <div className="py-8 px-4 text-center space-y-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-base font-bold text-stone-900">
                      {voiceLang === 'hi'
                        ? `"${transcript}" के लिए कोई सटीक अवसर नहीं मिला`
                        : `No direct opportunities match "${transcript}"`}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {voiceLang === 'hi'
                        ? 'हमारा प्रोटोटाइप 8 प्राथमिक श्रेणियों में 40 वास्तविक डेमो अवसर प्रदान करता है। आप नीचे सुझाई गई संबंधित श्रेणियां देख सकते हैं या अपनी बात को दूसरे शब्दों में कह सकते हैं।'
                        : 'Our platform currently features 40 vetted demo opportunities across 8 major career sectors. Try exploring related categories below or rephrasing your search.'}
                    </p>
                  </div>

                  {/* Recommended Alternative Categories */}
                  <div className="space-y-2 pt-2 max-w-lg mx-auto">
                    <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider text-[11px]">
                      {voiceLang === 'hi' ? 'सुझाई गई करियर श्रेणियां:' : 'Suggested Nearby Categories:'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {getRecommendedCategories(transcript).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategoryFallback(cat.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 rounded-xl border border-stone-300 shadow-2xs transition-colors"
                        >
                          {voiceLang === 'hi' ? cat.nameHi : cat.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Retry Action */}
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={startListening}
                      className="px-4 py-2 bg-[#134E3F] hover:bg-[#0E3B30] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{voiceLang === 'hi' ? 'दूसरा सवाल बोलें' : 'Speak a Different Request'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {voiceLang === 'hi'
                ? '40 वास्तविक डेमो अवसरों से जुड़ा'
                : 'Connected to KaamSetu 40-role demo opportunities dataset'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {voiceState !== 'ready' && (
              <button
                type="button"
                onClick={() => {
                  setVoiceState('ready');
                  setManualQuery('');
                  setTranscript('');
                }}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors font-medium"
              >
                {voiceLang === 'hi' ? 'नया प्रश्न' : 'New Voice Search'}
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors shadow-2xs"
            >
              {voiceLang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
