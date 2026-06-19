import React, { useState } from 'react';
import { Sparkles, GraduationCap, Compass, ArrowRight, BookOpen, Brain, History, Code, FlaskConical, Palette } from 'lucide-react';

interface SubjectSelectionProps {
  onSelect: (subject: string) => void;
  isLoading: boolean;
}

interface PresetTopic {
  title: string;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
  themeColor: string; // Tailwind class background & border
  textColor: string;
}

const PRESET_TOPICS: PresetTopic[] = [
  {
    title: "Quantum Superpositions",
    category: "Modern Physics",
    description: "Explore double-slits, quantum bits, wavefunctions, and the paradoxical world of Schoedinger's Cat.",
    icon: Compass,
    themeColor: "bg-blue-50 border-blue-100 hover:border-blue-300",
    textColor: "text-blue-600"
  },
  {
    title: "European Renaissance",
    category: "History & Art",
    description: "The intellectual rebirth of active humanism, Michelangelo, Galileo, and the printing press that changed everything.",
    icon: Palette,
    themeColor: "bg-rose-50 border-rose-100 hover:border-rose-300",
    textColor: "text-rose-600"
  },
  {
    title: "JavaScript Closures & Scope",
    category: "Computer Science",
    description: "Demystify lexical environments, memory retention, higher-order functions, and execution contexts in modern JS.",
    icon: Code,
    themeColor: "bg-emerald-50 border-emerald-100 hover:border-emerald-300",
    textColor: "text-emerald-600"
  },
  {
    title: "The Silk Road Exchange",
    category: "World History",
    description: "Examine trans-Eurasian trade, silk, paper-making technology transfer, cultural syncretism, and ancient trade routes.",
    icon: History,
    themeColor: "bg-amber-50 border-amber-100 hover:border-amber-300",
    textColor: "text-amber-600"
  },
  {
    title: "Cellular Photosynthesis",
    category: "Biology & Ecology",
    description: "Break down the light-dependent reactions, Calvin cycle chemistry, electron transport chain, and solar energy capture.",
    icon: FlaskConical,
    themeColor: "bg-teal-50 border-teal-100 hover:border-teal-300",
    textColor: "text-teal-600"
  },
  {
    title: "Neural Networks Core Mechanics",
    category: "Generative AI",
    description: "Understand simple backpropagation, gradient descent, weight adjustment, feedforward passes, and activation states.",
    icon: Brain,
    themeColor: "bg-indigo-50 border-indigo-100 hover:border-indigo-300",
    textColor: "text-indigo-600"
  }
];

export default function SubjectSelection({ onSelect, isLoading }: SubjectSelectionProps) {
  const [customSubject, setCustomSubject] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSubject.trim() && !isLoading) {
      onSelect(customSubject.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in" id="selector-container">
      {/* Decorative Brand Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 text-amber-700 font-mono text-xs mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini 3.5 Flash
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-3">
          What are we studying today?
        </h1>
        <p className="text-neutral-500 max-w-xl mx-auto text-base">
          Enter any topic—from high-school biology to advanced server architecture. 
          Our AI assistant will immediately construct study materials, recall cards, and assessments.
        </p>
      </div>

      {/* Main custom search entry */}
      <form onSubmit={handleSubmit} className="mb-12" id="search-form">
        <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-neutral-200 p-2 focus-within:ring-2 focus-within:ring-neutral-800 transition-all duration-300">
          <div className="pl-3 text-neutral-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <input
            id="subject-input"
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Search or enter any study subject... e.g., French Revolution, Black Holes, Data Structures"
            className="w-full bg-transparent px-4 py-3 text-lg text-neutral-800 placeholder-neutral-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            id="submit-subject-btn"
            type="submit"
            disabled={!customSubject.trim() || isLoading}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-medium px-6 py-3 rounded-xl transition duration-200 shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                Generating...
              </span>
            ) : (
              <>
                Ignite
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Topics Section */}
      <div className="mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-neutral-400" />
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
          Or jump into a curated preset
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="presets-grid">
        {PRESET_TOPICS.map((topic, idx) => {
          const IconComponent = topic.icon;
          return (
            <button
              id={`preset-card-${idx}`}
              key={topic.title}
              onClick={() => !isLoading && onSelect(topic.title)}
              disabled={isLoading}
              className={`group text-left p-5 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col justify-between h-52 outline-none ${topic.themeColor} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {topic.category}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-white shadow-xs ${topic.textColor}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-neutral-800 group-hover:text-black transition-colors mb-1.5 leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                  {topic.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-neutral-600 group-hover:text-black mt-3">
                Begin Course
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
