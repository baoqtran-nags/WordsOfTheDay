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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Complete Vocabulary Bank
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse {VOCABULARY_DATABASE.length} curated C1/C2 advanced industry vocabulary items, roots & idioms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search words, idioms, Latin/Greek roots, or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {INDUSTRY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedIndustry(cat)}
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border font-medium ${
                  selectedIndustry === cat
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No vocabulary found matching "{searchTerm}".</p>
            </div>
          ) : (
            filteredWords.map((item) => {
              const isSaved = savedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">
                          {item.word}
                        </h4>
                        <span className="text-xs font-mono text-slate-500">
                          {item.ipa}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                          {item.industry}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {item.definition}
                      </p>

                      {item.etymology && (
                        <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-1.5">
                          <History className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-800">Roots:</strong> {item.etymology}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => playPronunciation(item.word)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleSave(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title={isSaved ? 'Saved' : 'Save word'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 italic">
                    Example: "{item.examples[0]}"
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredWords.length} terms</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors shadow-xs"
          >
            Close Glossary
          </button>
        </div>

      </div>
    </div>
  );
};
