import React, { useState, useMemo } from 'react';
import { WordItem } from '../types';
import { X, Search, Volume2, Bookmark, History } from 'lucide-react';
import { VOCABULARY_DATABASE, INDUSTRY_CATEGORIES } from '../data/words';
import { playPronunciation } from '../utils/speech';

interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({
  isOpen,
  onClose,
  savedIds,
  onToggleSave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filteredWords = useMemo(() => {
    return VOCABULARY_DATABASE.filter((w) => {
      const matchesSearch =
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.etymology && w.etymology.toLowerCase().includes(searchTerm.toLowerCase())) ||
        w.industry.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        selectedIndustry === 'All' || w.industry === selectedIndustry;

      return matchesSearch && matchesIndustry;
    });
  }, [searchTerm, selectedIndustry]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white border-l-2 border-slate-200 h-full flex flex-col shadow-2xl">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Complete Vocabulary Bank
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Browse {VOCABULARY_DATABASE.length} curated C1/C2 advanced industry vocabulary items with illustrations & roots
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search words, idioms, Latin/Greek roots, or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors shadow-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {INDUSTRY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedIndustry(cat)}
                className={`text-xs sm:text-sm px-3 py-1 rounded-full whitespace-nowrap transition-colors border-2 font-bold cursor-pointer ${
                  selectedIndustry === cat
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-base font-semibold">No vocabulary found matching "{searchTerm}".</p>
            </div>
          ) : (
            filteredWords.map((item) => {
              const isSaved = savedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors shadow-xs flex flex-col sm:flex-row gap-4 items-start"
                >
                  {/* Small Illustration Preview */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.word}
                      referrerPolicy="no-referrer"
                      className="w-full sm:w-28 h-24 sm:h-28 object-cover rounded-lg border border-slate-200 shrink-0"
                      loading="lazy"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            {item.word}
                          </h4>
                          <span className="text-sm font-mono text-slate-600 font-semibold">
                            {item.ipa}
                          </span>
                          <span className="text-xs font-black text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 uppercase">
                            {item.industry}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-800 mt-2 leading-relaxed font-medium">
                          {item.definition}
                        </p>

                        {item.etymology && (
                          <div className="mt-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                            <History className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span><strong className="text-slate-900 font-bold">Roots:</strong> {item.etymology}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => playPronunciation(item.word)}
                          className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onToggleSave(item.id)}
                          className={`p-2 rounded-xl border-2 transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-amber-100 border-amber-400 text-amber-800'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'
                          }`}
                          title={isSaved ? 'Saved' : 'Save word'}
                        >
                          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs sm:text-sm text-slate-700 italic">
                      Example: “{item.examples[0]}”
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t-2 border-slate-200 bg-slate-50 text-sm text-slate-600 font-semibold flex items-center justify-between">
          <span>Showing {filteredWords.length} terms</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Close Glossary
          </button>
        </div>

      </div>
    </div>
  );
};
