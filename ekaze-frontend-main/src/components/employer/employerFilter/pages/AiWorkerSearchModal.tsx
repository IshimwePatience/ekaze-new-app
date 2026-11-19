import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Plus, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';

interface AiWorkerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (prompt: string) => void;
  onReset: () => void;
  currentQuery?: string;
  isRw?: boolean;
}


export const AiWorkerSearchModal: React.FC<AiWorkerSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onReset,
  currentQuery = '',
  isRw = false,
}) => {
  const [prompt, setPrompt] = useState(currentQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt(currentQuery);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, currentQuery]);

  const handleSearch = () => {
    if (prompt.trim()) {
      onSearch(prompt.trim());
      onClose();
    }
  };

  const handleReset = () => {
    setPrompt('');
    onReset();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-0 flex flex-col overflow-hidden font-sans border-0 [&>button]:hidden text-slate-800">
        
        {/* Header - Matching Customise Consent Preferences / Filters Modal style */}
        <div className="px-8 pt-6 pb-2 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isRw ? 'Shakisha Umukozi na AI' : 'AI Worker Search'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Description */}
        <div className="px-8 py-2 text-left space-y-1.5 shrink-0">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {isRw
              ? 'Sobanura umukozi wifuza cyangwa ibyo ukeneye mu magambo asanzwe.'
              : 'Select specific preferences or ask Ekaze AI in plain language to find candidates matching your exact domestic staffing requirements.'}
          </p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {isRw
              ? 'Ibisubizo bihita bishyirwa hasi mu gice cya "Browse Skilled Professionals".'
              : 'Matched professionals will be displayed directly in "Browse Skilled Professionals" below.'}
          </p>
        </div>

        {/* Modal Body: Only Prompt Area Matching "Ask Something" */}
        <div className="px-8 py-5 space-y-4 text-left flex-1">
          {/* Prompt Box matching Image 2 */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 focus-within:bg-white focus-within:border-[#1677ff] focus-within:ring-2 focus-within:ring-blue-100 transition-all space-y-2">
            <div className="text-xs font-bold text-slate-700">
              {isRw ? 'Baza ikintu' : 'Ask something'}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                <Plus className="w-4 h-4" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRw
                    ? 'Baza ku bakozi, uburambe, indimi, aho baherereye...'
                    : 'Ask about workers, NIDA, skills, location...'
                }
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
              />

              <button
                type="button"
                onClick={handleSearch}
                disabled={!prompt.trim()}
                className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-[#1677ff] hover:text-white disabled:opacity-40 disabled:hover:bg-slate-200/80 disabled:hover:text-slate-600 flex items-center justify-center text-slate-600 transition-colors shrink-0 cursor-pointer border-0"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>


          {/* Disclaimer text matching Image 2 */}
          <p className="text-[11px] text-slate-400 text-center pt-2">
            {isRw
              ? 'AI ishobora kwibeshya. Ibisubizo bihitamo muri Browse Skilled Professionals hasi.'
              : 'AI can make mistakes. You are responsible for verifying platform data.'}
          </p>
        </div>

        {/* Modal Footer matching Image 3 (Reset All / Search) */}
        <div className="px-8 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-full border-2 border-[#1677ff] text-[#1677ff] bg-white hover:bg-blue-50 text-xs font-extrabold transition-all cursor-pointer"
          >
            {isRw ? 'Gusiba Byose' : 'Reset All'}
          </button>

          <button
            type="button"
            onClick={handleSearch}
            className="px-6 py-2.5 rounded-full bg-[#1677ff] text-white hover:bg-blue-600 shadow-md text-xs font-extrabold transition-all cursor-pointer"
          >
            {isRw ? 'Shakisha' : 'Search'}
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
};
