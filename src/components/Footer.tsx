import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, t, resetAllDemoData, language } = useApp();

  return (
    <footer className="border-t border-stone-200 bg-[#F5F2EB] text-stone-700 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#134E3F] text-amber-200 flex items-center justify-center font-bold text-xs">
                क
              </div>
              <span className="text-base font-bold text-stone-900 tracking-tight">KaamSetu</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              {language === 'hi'
                ? 'कौशल और अवसरों को हर भारतीय तक पहुंचाने वाला एकीकृत रोजगार व उद्यमशीलता मंच।'
                : 'A dignity-first Indian employment-tech platform bridging learners, grassroots jobseekers, and local micro-entrepreneurs to sustainable livelihoods.'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Hackathon Prototype · Skills &amp; Opportunities for All</span>
            </div>
          </div>

          {/* Column 2: Pillars */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Platform Pillars
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <button
                  onClick={() => setCurrentView('opportunities')}
                  className="hover:text-stone-900 transition-colors"
                >
                  1. Find Work &amp; Internships
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('skillbridge')}
                  className="hover:text-stone-900 transition-colors"
                >
                  2. Build Skills (SkillBridge)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('ai_companion')}
                  className="hover:text-stone-900 transition-colors"
                >
                  3. Accessible Career Guidance
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('business_hub')}
                  className="hover:text-stone-900 transition-colors"
                >
                  4. Grow Local Businesses
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Inclusive Principles */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Inclusion &amp; Access
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 leading-relaxed">
              <li>• Bilingual English &amp; Hindi interface</li>
              <li>• Simplified language mode without corporate jargon</li>
              <li>• Voice-assisted query support</li>
              <li>• Low-bandwidth friendly architecture</li>
              <li>• No degree bias: practical skills prioritized</li>
            </ul>
          </div>

          {/* Column 4: Demo State Control */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1">
              Evaluator Controls
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              All listings, submissions, and skill progress run client-side with persistent localStorage.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all demo state to fresh default sample data?')) {
                  resetAllDemoData();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>{t.resetDemo}</span>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-300/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>
            KaamSetu © {new Date().getFullYear()} · Built for social equity, skill empowerment, and inclusive opportunity.
          </p>
          <div className="flex items-center gap-1 text-stone-500">
            <span>Crafted with purpose for India’s emerging workforce</span>
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
