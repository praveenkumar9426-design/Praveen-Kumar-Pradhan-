import { useState } from 'react';
import { Module } from '../types';
import { BookOpen, CheckCircle, Lightbulb, Copy, Check, FileText, ChevronRight } from 'lucide-react';

interface CourseViewerProps {
  modules: Module[];
  subject: string;
}

export default function CourseViewer({ modules, subject }: CourseViewerProps) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Record<number, boolean>>({});
  const [copiedText, setCopiedText] = useState(false);
  const [expandedTerm, setExpandedTerm] = useState<number | null>(null);

  const activeModule = modules[activeModuleIndex];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const toggleCompleted = (idx: number) => {
    setCompletedModules(curr => ({
      ...curr,
      [idx]: !curr[idx]
    }));
  };

  // Convert summaries split by double-newlines into actual paragraphs for readability
  const paragraphs = activeModule?.summary
    ? activeModule.summary.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-2" id="course-viewer-container">
      {/* Sidebar switcher: Steps */}
      <div className="lg:col-span-4 flex flex-col gap-3" id="course-sidebar">
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 mb-2">
          <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase font-mono">
            Focus Subject
          </span>
          <h2 className="text-xl font-bold text-neutral-800 leading-tight mt-1">
            {subject}
          </h2>
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Progress Tracker</span>
            <span>
              {Object.values(completedModules).filter(Boolean).length} of {modules.length} modules
            </span>
          </div>
          {/* Simple fluid progress line */}
          <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-neutral-800 h-full transition-all duration-300"
              style={{ width: `${(Object.values(completedModules).filter(Boolean).length / modules.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step navigation buttons */}
        <div className="flex flex-col gap-2" id="module-step-buttons">
          {modules.map((mod, idx) => {
            const isCompleted = completedModules[idx];
            const isActive = idx === activeModuleIndex;

            return (
              <button
                id={`module-step-btn-${idx}`}
                key={idx}
                onClick={() => {
                  setActiveModuleIndex(idx);
                  setExpandedTerm(null);
                }}
                className={`flex items-start gap-3 w-full p-4 rounded-xl text-left border transition-all duration-200 outline-none cursor-pointer ${
                  isActive
                    ? "bg-white border-neutral-800 shadow-sm ring-1 ring-neutral-800"
                    : "bg-neutral-50/50 border-neutral-100 hover:bg-neutral-50"
                }`}
              >
                <div className={`mt-0.5 rounded-full p-1 ${isCompleted ? "text-emerald-600" : "text-neutral-400"}`}>
                  <CheckCircle className={`w-5 h-5 ${isCompleted ? "fill-emerald-50" : ""}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono block">
                    Part {idx + 1}
                  </span>
                  <span className={`text-sm font-semibold truncate block mt-0.5 ${isActive ? "text-neutral-900" : "text-neutral-600"}`}>
                    {mod.title}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 text-neutral-400 mt-2 transition-transform duration-200 ${isActive ? "translate-x-1" : ""}`} />
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100/50 flex gap-3 text-xs leading-relaxed text-amber-800 mt-2">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <p>
            You can use the Chat window on the right to voice questions on this specific part of the curriculum anytime!
          </p>
        </div>
      </div>

      {/* Main active learning panel */}
      {activeModule && (
        <div className="lg:col-span-8 space-y-6" id="module-main-content">
          {/* Header Title with Complete task badge */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider font-mono">
                Module {activeModuleIndex + 1} of {modules.length}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
                {activeModule.title}
              </h2>
            </div>
            <button
              id={`mark-complete-toggle-${activeModuleIndex}`}
              onClick={() => toggleCompleted(activeModuleIndex)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition border cursor-pointer outline-none ${
                completedModules[activeModuleIndex]
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-black"
              }`}
            >
              {completedModules[activeModuleIndex] ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Completed
                </>
              ) : (
                "Mark Read"
              )}
            </button>
          </div>

          {/* Structured Text Notes paragraphs */}
          <div className="space-y-4 text-neutral-700 leading-relaxed text-base" id="notes-paragraphs">
            {paragraphs.map((para, pIdx) => (
              <p key={pIdx}>{para}</p>
            ))}
          </div>

          {/* Formatted Monospace Block (e.g. Code, formula, historical dates, etc.) */}
          {activeModule.technicalNote && (
            <div className="bg-neutral-950 text-neutral-100 rounded-xl overflow-hidden shadow-inner border border-neutral-800" id="tech-snippet-card">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5 font-sans">
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  Reference Block
                </span>
                <button
                  id="copy-snippet-btn"
                  onClick={() => handleCopyCode(activeModule.technicalNote || '')}
                  className="flex items-center gap-1 hover:text-white transition duration-150 cursor-pointer text-[11px] font-sans"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre font-medium text-amber-200">
                <code>{activeModule.technicalNote}</code>
              </pre>
            </div>
          )}

          {/* Core takeaways section */}
          {activeModule.takeaways && activeModule.takeaways.length > 0 && (
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-100" id="takeaways-section">
              <h4 className="text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-3">
                Key Learning Takeaways
              </h4>
              <ul className="space-y-3">
                {activeModule.takeaways.map((takeaway, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <Check className="w-4.5 h-4.5 text-neutral-800 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Glossary Section */}
          {activeModule.keyTerms && activeModule.keyTerms.length > 0 && (
            <div id="glossary-section">
              <h4 className="text-xs font-bold uppercase text-neutral-400 font-mono tracking-wider mb-3">
                Mini Glossary (Tap to Reveal)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeModule.keyTerms.map((termObj, termIdx) => {
                  const isExpanded = expandedTerm === termIdx;
                  return (
                    <button
                      id={`glossary-btn-${termIdx}`}
                      key={termIdx}
                      onClick={() => setExpandedTerm(isExpanded ? null : termIdx)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 outline-none cursor-pointer flex flex-col justify-between min-h-24 ${
                        isExpanded
                          ? "bg-white border-neutral-900 shadow-sm"
                          : "bg-neutral-50 border-neutral-100 hover:border-neutral-200"
                      }`}
                    >
                      <div>
                        <span className="font-mono text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Term {termIdx + 1}
                        </span>
                        <h5 className="font-bold text-sm text-neutral-800 mt-1">
                          {termObj.term}
                        </h5>
                      </div>
                      
                      <div className={`mt-2 transition-all duration-150 ${isExpanded ? "block text-xs text-neutral-600" : "hidden"}`}>
                        {termObj.definition}
                      </div>

                      <div className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 mt-2">
                        {isExpanded ? "Collapse" : "Reveal Definition"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
