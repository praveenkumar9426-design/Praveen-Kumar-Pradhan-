import { useState } from 'react';
import { QuizQuestion } from '../types';
import { HelpCircle, Check, X, ShieldAlert, Award, Star, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface PracticeQuizProps {
  questions: QuizQuestion[];
  subject: string;
  onRetake: () => void;
}

export default function PracticeQuiz({ questions, subject, onRetake }: PracticeQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-64">
        <HelpCircle className="w-12 h-12 text-neutral-300 animate-pulse" />
        <p className="mt-4 text-neutral-500">Preparing practice questions...</p>
      </div>
    );
  }

  const activeQuestion = questions[currentIndex];
  const userSelectionObj = selectedAnswers[currentIndex];
  const hasAnsweredCurrent = userSelectionObj !== undefined;

  const handleSelectOption = (idx: number) => {
    if (hasAnsweredCurrent) return; // Prevent double-clicking after option is locked in
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: idx
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    return score;
  };

  const totalQuestions = questions.length;
  const finalScore = calculateScore();
  const percentage = Math.round((finalScore / totalQuestions) * 100);

  // Motivational message depending on score
  const getMotivationalFeedback = (pct: number) => {
    if (pct === 100) return { title: "Outstanding! Perfect Score", msg: "You have exhibited complete cognitive assimilation of this topic. Absolute mastery achieved!", icon: Sparkles, color: "text-amber-500" };
    if (pct >= 80) return { title: "Brilliant Effort!", msg: "Outstanding retention. You understand the primary mechanics and analytical aspects perfectly.", icon: Star, color: "text-amber-500" };
    if (pct >= 60) return { title: "Good Progress!", msg: "You have captured the core foundations. Reviewing terms once more will solidify a flawless score.", icon: Award, color: "text-yellow-600" };
    return { title: "Keep Practicing!", msg: "Every incorrect choice is a learning marker. Review the Module Notes or consult with Professor Sage to review concepts.", icon: ShieldAlert, color: "text-neutral-500" };
  };

  const feedbackObj = getMotivationalFeedback(percentage);
  const FeedbackIcon = feedbackObj.icon;

  const resetQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-2" id="quiz-container">
      {!showResults ? (
        <div className="space-y-6" id="quiz-question-view">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                Practice Assessment
              </span>
              <h3 className="text-sm font-semibold text-neutral-500 truncate mt-0.5 max-w-xs sm:max-w-md">
                Subject: {subject}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-50 border border-neutral-100 px-3 py-1 rounded-full">
              Q: {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress Line */}
          <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-neutral-900 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Active Question Box */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs" id="question-card">
            <h4 className="text-lg font-bold text-neutral-900 leading-snug">
              {activeQuestion.question}
            </h4>
          </div>

          {/* 4 Multi-choice options */}
          <div className="grid grid-cols-1 gap-3" id="quiz-options-list">
            {activeQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              const isCorrectOption = activeQuestion.correctAnswerIndex === idx;

              // Color styles after locking in answer
              let buttonStyles = "bg-neutral-50/50 border-neutral-100/80 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800";
              let iconElement = null;

              if (hasAnsweredCurrent) {
                if (isSelected) {
                  if (isCorrectOption) {
                    buttonStyles = "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs";
                    iconElement = <div className="p-1 rounded-full bg-emerald-100 text-emerald-700"><Check className="w-4.5 h-4.5 stroke-[2.5]" /></div>;
                  } else {
                    buttonStyles = "bg-rose-50 border-rose-300 text-rose-800";
                    iconElement = <div className="p-1 rounded-full bg-rose-100 text-rose-700"><X className="w-4.5 h-4.5 stroke-[2.5]" /></div>;
                  }
                } else if (isCorrectOption) {
                  // Reveal correct answer if selected incorrect
                  buttonStyles = "bg-emerald-50 border-emerald-200 text-emerald-800/80";
                  iconElement = <div className="p-1 rounded-full bg-emerald-100/50 text-emerald-600"><Check className="w-4 h-4 stroke-[2.5]" /></div>;
                } else {
                  buttonStyles = "bg-neutral-500/5 border-transparent text-neutral-400 opacity-60";
                }
              }

              return (
                <button
                  id={`quiz-option-btn-${idx}`}
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnsweredCurrent}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 outline-none w-full text-base font-normal cursor-pointer ${buttonStyles}`}
                >
                  <span className="flex-1 pr-4">{option}</span>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Educational Explanation Box */}
          {hasAnsweredCurrent && (
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/85 space-y-2 animate-fade-in" id="quiz-explanation-card">
              <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-amber-700">
                Professor Sage's Rationale
              </span>
              <p className="text-sm text-neutral-700 leading-relaxed font-sans font-normal">
                {activeQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Footer Navigation */}
          {hasAnsweredCurrent && (
            <div className="flex justify-end pt-2" id="quiz-navigation-footer">
              <button
                id="next-question-btn"
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-6 py-3 rounded-xl transition duration-200 shadow-sm cursor-pointer"
              >
                {currentIndex < totalQuestions - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View Exam Report
                    <Award className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* SCORE REPORT VIEWER */
        <div className="text-center py-6 space-y-6" id="quiz-report-view">
          <div className="flex justify-center flex-col items-center">
            <div className="p-4 bg-amber-50 rounded-full border border-amber-100 mb-4 inline-block">
              <FeedbackIcon className={`w-10 h-10 ${feedbackObj.color}`} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {feedbackObj.title}
            </h3>
            <p className="text-neutral-500 font-sans text-sm max-w-md mx-auto mt-2 font-normal leading-relaxed">
              {feedbackObj.msg}
            </p>
          </div>

          {/* Large Circle percentage display */}
          <div className="relative inline-flex items-center justify-center p-6 border-4 border-neutral-100 rounded-full" id="quiz-report-circle">
            <div className="text-center">
              <div id="quiz-score-indicator" className="text-5xl font-black text-neutral-900 leading-none">
                {percentage}%
              </div>
              <div className="text-xs font-bold text-neutral-400 tracking-widest uppercase mt-1 font-mono">
                {finalScore} / {totalQuestions} Correct
              </div>
            </div>
          </div>

          {/* Detailed Question breakdown summary */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-5 text-left text-sm space-y-3.5" id="report-breakdown">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Concept Breakdown
            </h4>
            {questions.map((q, qIdx) => {
              const isCorrectMap = selectedAnswers[qIdx] === q.correctAnswerIndex;
              return (
                <div key={qIdx} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-neutral-500 font-mono text-[10px] font-bold">QUESTION {qIdx + 1}</p>
                    <p className="text-neutral-700 truncate font-sans text-[13px] font-medium mt-0.5">{q.question}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-full ${
                    isCorrectMap 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-rose-50 text-rose-700"
                  }`}>
                    {isCorrectMap ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {isCorrectMap ? "Correct" : "Incorrect"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              id="retake-exam-btn"
              onClick={resetQuiz}
              className="flex items-center gap-1.5 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold px-5 py-3 rounded-xl transition duration-150 outline-none cursor-pointer w-full sm:w-auto justify-center text-sm"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              Retake Exam
            </button>
            <button
              id="new-subject-quiz-btn"
              onClick={onRetake}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-6 py-3 rounded-xl transition duration-150 shadow-sm outline-none cursor-pointer w-full sm:w-auto justify-center text-sm"
            >
              Generate New Subject
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
