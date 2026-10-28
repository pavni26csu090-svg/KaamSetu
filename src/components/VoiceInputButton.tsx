import React from 'react';
import { Mic } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoiceInputButtonProps {
  onTranscript?: (text: string) => void;
  className?: string;
  lang?: string;
  initialQuery?: string;
  mode?: 'modal' | 'inline';
  ariaLabel?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  initialQuery = '',
  mode = 'modal',
  ariaLabel,
}) => {
  const { openVoiceModal, profile } = useApp();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Opens the dedicated accessible Voice Command modal with microphone listening started
    openVoiceModal(initialQuery, true);
  };

  const label =
    ariaLabel ||
    (profile.language === 'hi'
      ? 'वॉइस सर्च और बोलकर अवसर खोजें'
      : 'Voice search and natural speech commands');

  return (
    <button
      type="button"
      onClick={handleClick}
      title={profile.language === 'hi' ? 'बोलकर खोजें (हिंदी/English)' : 'Speak naturally to search opportunities'}
      className={`p-2 rounded-xl transition-all flex items-center justify-center bg-stone-100 text-stone-700 hover:bg-[#134E3F] hover:text-amber-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#134E3F] shadow-2xs ${className}`}
      aria-label={label}
    >
      <Mic className="w-4 h-4 transition-transform group-hover:scale-110" />
    </button>
  );
};
