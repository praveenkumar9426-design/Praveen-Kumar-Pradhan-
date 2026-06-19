import { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import { HelpCircle, RefreshCw, Check, Sparkles, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface FlashcardSetProps {
  cardList: { question: string; answer: string }[];
  subject: string;
}

export default function FlashcardSet({ cardList, subject }: FlashcardSetProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize status on cardList load
  useEffect(() => {
    setCards(
      cardList.map((c, idx) => ({
        id: idx.toString(),
        question: c.question,
        answer: c.answer,
        status: 'learning'
      }))
    );
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cardList]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-64">
        <HelpCircle className="w-12 h-12 text-neutral-300 animate-pulse" />
        <p className="mt-4 text-neutral-500">Preparing flashcard deck...</p>
      </div>
    );
  }

  const activeCard = cards[currentIndex];
  const totalCards = cards.length;
  const masteredCount = cards.filter(c => c.status === 'mastered').length;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % totalCards);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);
    }, 150);
  };

  const markStatus = (status: 'learning' | 'mastered') => {
    setCards(prev =>
      prev.map((c, idx) => (idx === currentIndex ? { ...c, status } : c))
    );
    // Auto-advance to next card on rate selection for responsive feel, after brief visual transition
    setTimeout(() => {
      handleNext();
    }, 450);
  };

  const resetDeck = () => {
    setCards(prev => prev.map(c => ({ ...c, status: 'learning' })));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-xl mx-auto py-2" id="flashcard-deck-applet">
      {/* Header score controls */}
      <div className="flex items-center justify-between mb-6" id="flashcard-score-header">
        <div>
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
            Deck Mastery
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-bold font-sans text-neutral-800">
              {masteredCount} of {totalCards} Mastered
            </span>
            {masteredCount === totalCards && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border border-emerald-100">
                <Sparkles className="w-3 h-3" /> Fully Learned
              </span>
            )}
          </div>
        </div>

        <button
          id="reset-deck-btn"
          onClick={resetDeck}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black hover:bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 transition outline-none cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset progress
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-neutral-100 h-1 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-neutral-900 h-full transition-all duration-300"
          style={{ width: `${((masteredCount) / totalCards) * 100}%` }}
        />
      </div>

      {/* 3D Flippable card stage container */}
      <div id="flashcard-view-stage" className="perspective-1000 w-full h-[28rem] relative cursor-pointer">
        <div
          id="flashcard-flippable-body"
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full h-full transform-style-3d transition-all duration-500 relative rounded-3xl border border-neutral-200/80 shadow-md bg-white ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT SIDE (Question) */}
          <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-8 rounded-3xl">
            {/* Header metadata tag */}
            <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-bold text-neutral-400">
              <span className="uppercase text-neutral-400">Card Prompt</span>
              <span className="bg-neutral-50 font-semibold px-2 py-0.5 rounded-md border border-neutral-100">
                {currentIndex + 1} / {totalCards}
              </span>
            </div>

            {/* Core Question text */}
            <div className="my-auto text-center px-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-800 leading-snug">
                {activeCard.question}
              </h3>
            </div>

            {/* Instructions bottom footer */}
            <div className="text-center font-medium font-sans text-xs text-neutral-400 mt-2">
              Tap card to flip and reveal answer
            </div>
          </div>

          {/* BACK SIDE (Answer) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-8 rounded-3xl bg-neutral-50/50">
            {/* Header tag */}
            <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-bold text-neutral-400">
              <span className="uppercase text-neutral-400">Verified Answer</span>
              <span>
                {activeCard.status === 'mastered' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <Check className="w-3 h-3 stroke-[2.5]" /> Mastered
                  </span>
                ) : (
                  "Still Reviewing"
                )}
              </span>
            </div>

            {/* Core Answer text */}
            <div className="my-auto text-center px-2">
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-sans font-normal">
                {activeCard.answer}
              </p>
            </div>

            {/* Instruction footnote */}
            <div className="text-center font-medium font-sans text-xs text-neutral-400 mt-2">
              Tap card to view prompt again
            </div>
          </div>
        </div>
      </div>

      {/* Active recall action buttons */}
      <div className="mt-8 flex flex-col items-center justify-center gap-4" id="flashcard-controls">
        {/* Toggle mastery feedback after flip */}
        <div className={`flex items-center gap-3 transition-opacity duration-200 mt-1 ${isFlipped ? "opacity-100 pointer-events-auto" : "opacity-40 pointer-events-none"}`}>
          <button
            id="mark-still-learning-btn"
            onClick={() => markStatus('learning')}
            className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all outline-none cursor-pointer ${
              activeCard.status !== 'mastered'
                ? "bg-amber-50 border-amber-300 text-amber-700 focus:ring-2 focus:ring-amber-200"
                : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600 focus:ring-2 focus:ring-neutral-200"
            }`}
          >
            Still Learning
          </button>
          
          <button
            id="mark-mastered-btn"
            onClick={() => markStatus('mastered')}
            className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all outline-none cursor-pointer ${
              activeCard.status === 'mastered'
                ? "bg-emerald-600 border-emerald-600 text-white focus:ring-2 focus:ring-emerald-200"
                : "bg-white border-emerald-200 hover:border-emerald-300 text-emerald-700 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-200"
            }`}
          >
            Got it! Mastered
          </button>
        </div>

        {/* Next/Prev Navigation */}
        <div className="flex items-center gap-6 mt-2" id="flashcard-navigator">
          <button
            id="prev-card-btn"
            onClick={handlePrev}
            className="p-2.5 rounded-full border border-neutral-200 hover:bg-neutral-50 transition outline-none cursor-pointer text-neutral-700"
            title="Previous card"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" />
          </button>
          <span className="text-sm font-semibold font-mono text-neutral-500">
            {currentIndex + 1} of {totalCards}
          </span>
          <button
            id="next-card-btn"
            onClick={handleNext}
            className="p-2.5 rounded-full border border-neutral-200 hover:bg-neutral-50 transition outline-none cursor-pointer text-neutral-700"
            title="Next card"
          >
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
