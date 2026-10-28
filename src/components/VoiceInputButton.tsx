import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  lang?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  lang,
}) => {
  const { profile, addToast } = useApp();
  const [isListening, setIsListening] = useState(false);

  const targetLang = lang || (profile.language === 'hi' ? 'hi-IN' : 'en-IN');

  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast({
        type: 'warning',
        title: 'Voice Input Unavailable',
        description: 'Your browser does not support Web Speech recognition. Please use standard text input.',
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = targetLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        addToast({
          type: 'info',
          title: 'Listening...',
          description: profile.language === 'hi' ? 'कृपया बोलें (हिंदी/English)' : 'Please speak clearly now',
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
          addToast({
            type: 'success',
            title: 'Voice Recognized',
            description: `"${transcript}"`,
          });
        }
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error', e);
        setIsListening(false);
        addToast({
          type: 'warning',
          title: 'Could not catch voice',
          description: 'Try speaking again or type into the input field.',
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition', err);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleVoice}
      title={isListening ? 'Stop listening' : 'Speak using microphone'}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        isListening
          ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500 animate-pulse'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
      } ${className}`}
      aria-label="Toggle voice input"
    >
      {isListening ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4" />}
    </button>
  );
};
