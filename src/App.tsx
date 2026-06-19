import React, { useState, useEffect } from 'react';
import SubjectSelection from './components/SubjectSelection';
import CourseViewer from './components/CourseViewer';
import FlashcardSet from './components/FlashcardSet';
import PracticeQuiz from './components/PracticeQuiz';
import StudyBuddy from './components/StudyBuddy';
import { Course, ChatMessage, SavedActivity } from './types';
import { 
  Sparkles, 
  GraduationCap, 
  Library, 
  BookOpen, 
  Brain, 
  Settings, 
  Award,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  History,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Application Modes
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz'>('notes');
  const [loadingSubject, setLoadingSubject] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Formulating syllabus...");

  // Lazy Subsystem loads
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Classroom Companion State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Collapse/expand tutoring sidebar

  // Navigation history & Logs (Client Persistence)
  const [savedLogs, setSavedLogs] = useState<SavedActivity[]>([]);
  const [historicalCourses, setHistoricalCourses] = useState<Record<string, Course>>({});

  // Display/Error banners
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load study history logs on startup
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('edustudio_saved_logs');
      const storedHist = localStorage.getItem('edustudio_historical_courses');
      if (storedLogs) setSavedLogs(JSON.parse(storedLogs));
      if (storedHist) setHistoricalCourses(JSON.parse(storedHist));
    } catch (e) {
      console.error("Could not load local storage study logs:", e);
    }
  }, []);

  // Save history logs on change
  const saveLogsToLocal = (newLogs: SavedActivity[], newHist: Record<string, Course>) => {
    try {
      localStorage.setItem('edustudio_saved_logs', JSON.stringify(newLogs));
      localStorage.setItem('edustudio_historical_courses', JSON.stringify(newHist));
    } catch (e) {
      console.error("Could not save logs:", e);
    }
  };

  // Dynamically cycle through loading messages so waiting feels informative
  useEffect(() => {
    if (!loadingSubject) return;

    const messages = [
      "Consulting academic archives...",
      "Structuring curricular outlines...",
      "Drafting module breakdowns...",
      "Curating practice definitions...",
      "Assembling takeaways and glossary blocks...",
      "Syncing with Professor Sage..."
    ];

    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % messages.length;
      setLoadingMessage(messages[count]);
    }, 1800);

    return () => clearInterval(interval);
  }, [loadingSubject]);

  // Initial prompt builder for chat
  const setupInitialBuddyChat = (subjectName: string, modulesSummary: string) => {
    setChatMessages([
      {
        id: "sage-welcome",
        sender: "assistant",
        text: `Greetings! I am Professor Sage, and I've compiled a dynamic 3-part curriculum on "${subjectName}". Review our syllabus of notes step-by-step, review flashcards, or take a practice exam. Need clarification or a quick summary? Ask me anything right here!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // 1. Core trigger to generate course curriculum
  const handleSelectSubject = async (subject: string) => {
    setLoadingSubject(true);
    setLoadingMessage("Connecting to Gemini...");
    setGlobalError(null);
    setActiveTab('notes');
    setFlashcards([]);
    setQuizQuestions([]);

    // Check if we already have this course memorized in history to skip latent generation
    const key = subject.trim().toLowerCase();
    if (historicalCourses[key]) {
      const existing = historicalCourses[key];
      setActiveCourse(existing);
      setActiveSubject(existing.subject);
      setupInitialBuddyChat(existing.subject, existing.modules[0]?.summary);
      
      // Update activity timestamp
      updateSavedActivity(existing.subject);
      setLoadingSubject(false);
      return;
    }

    try {
      const response = await fetch("/api/generate/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || errPayload.details || "API rejected the curriculum curation request.");
      }

      const data = await response.json();
      if (data && data.course) {
        const curatedCourse: Course = data.course;
        setActiveCourse(curatedCourse);
        setActiveSubject(curatedCourse.subject);
        setupInitialBuddyChat(curatedCourse.subject, curatedCourse.modules[0]?.summary);

        // Record in history logs
        const updatedHist = { ...historicalCourses, [key]: curatedCourse };
        setHistoricalCourses(updatedHist);

        const freshLog: SavedActivity = {
          courseId: curatedCourse.id,
          subject: curatedCourse.subject,
          lastActive: new Date().toLocaleString()
        };
        const updatedLogs = [freshLog, ...savedLogs.filter(item => item.subject.toLowerCase() !== key)].slice(0, 15);
        setSavedLogs(updatedLogs);
        
        saveLogsToLocal(updatedLogs, updatedHist);
      } else {
        throw new Error("Invalid course schema response payload.");
      }
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || "An issue arose while creating this curriculum.");
    } finally {
      setLoadingSubject(false);
    }
  };

  const updateSavedActivity = (subjectName: string, updates: Partial<SavedActivity> = {}) => {
    const key = subjectName.trim().toLowerCase();
    const updated = savedLogs.map(log => {
      if (log.subject.toLowerCase() === key) {
        return {
          ...log,
          ...updates,
          lastActive: new Date().toLocaleString()
        };
      }
      return log;
    });
    setSavedLogs(updated);
    saveLogsToLocal(updated, historicalCourses);
  };

  // 2. LAZY FLASHCARD DECK fetcher (requested on click or selection)
  const fetchFlashcards = async () => {
    if (!activeSubject || flashcards.length > 0 || loadingFlashcards) return;

    setLoadingFlashcards(true);
    setGlobalError(null);

    // Provide topic modules context to help Gemini align flashcard content precisely
    const contextNotes = activeCourse?.modules.map(m => m.summary).join("\n") || "";

    try {
      const response = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: activeSubject, notes: contextNotes.substring(0, 1800) })
      });

      if (!response.ok) {
        throw new Error("Failed to curate custom active-recall card deck.");
      }

      const data = await response.json();
      if (data && data.flashcards) {
        setFlashcards(data.flashcards);
      }
    } catch (err: any) {
      console.error(err);
      setGlobalError(`Flashcards error: ${err.message}`);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // 3. LAZY PRACTICE ASSESSMENT fetcher
  const fetchPracticeQuiz = async () => {
    if (!activeSubject || quizQuestions.length > 0 || loadingQuiz) return;

    setLoadingQuiz(true);
    setGlobalError(null);

    const contextNotes = activeCourse?.modules.map(m => m.summary).join("\n") || "";

    try {
      const response = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: activeSubject, notes: contextNotes.substring(0, 1800) })
      });

      if (!response.ok) {
        throw new Error("Failed to curate mock-assessment module.");
      }

      const data = await response.json();
      if (data && data.questions) {
        setQuizQuestions(data.questions);
      }
    } catch (err: any) {
      console.error(err);
      setGlobalError(`Quiz generation failed: ${err.message}`);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Send Classroom Chat Message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeSubject || loadingChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setLoadingChat(true);
    setGlobalError(null);

    const activeModuleStr = activeCourse?.modules[0]?.summary || "";

    try {
      const response = await fetch("/api/chat/study-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-10), // Send recent context history
          contextSubject: activeSubject,
          contextNotes: activeModuleStr.substring(0, 1200)
        })
      });

      if (!response.ok) {
        throw new Error("AI Classroom Companion encountered an interruption.");
      }

      const data = await response.json();
      if (data && data.message) {
        setChatMessages(old => [...old, data.message]);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(old => [...old, {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `My apologies! I experienced a connection drop-out while formulating that answer. Please try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const clearChatHistory = () => {
    if (activeSubject) {
      setupInitialBuddyChat(activeSubject, activeCourse?.modules[0]?.summary || "");
    }
  };

  // Clear a single history log item
  const handleDeleteLogItem = (subjectToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the subject
    const key = subjectToDelete.toLowerCase();
    
    const updatedLogs = savedLogs.filter(log => log.subject.toLowerCase() !== key);
    const updatedHist = { ...historicalCourses };
    delete updatedHist[key];
    
    setSavedLogs(updatedLogs);
    setHistoricalCourses(updatedHist);
    saveLogsToLocal(updatedLogs, updatedHist);

    // If deleting active subject, clear active view
    if (activeSubject && activeSubject.toLowerCase() === key) {
      setActiveSubject(null);
      setActiveCourse(null);
    }
  };

  const handleTabChange = (tab: 'notes' | 'flashcards' | 'quiz') => {
    setActiveTab(tab);
    if (tab === 'flashcards') {
      fetchFlashcards();
    } else if (tab === 'quiz') {
      fetchPracticeQuiz();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-neutral-800 flex flex-col font-sans" id="layout-root">
      {/* Top bar header */}
      <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-40" id="global-header">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            id="logo-brand-btn"
            onClick={() => {
              setActiveSubject(null);
              setActiveCourse(null);
              setGlobalError(null);
            }} 
            className="flex items-center gap-2 px-1 focus:outline-none cursor-pointer group"
          >
            <div className="p-2 bg-neutral-900 rounded-xl text-white group-hover:scale-105 transition duration-150">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-neutral-950 tracking-tight">
              EduStudio
            </span>
          </button>

          {/* Quick-stats and subject toggle */}
          <div className="flex items-center gap-3">
            {activeSubject && (
              <button
                id="back-to-selector-header-btn"
                onClick={() => {
                  setActiveSubject(null);
                  setActiveCourse(null);
                  setGlobalError(null);
                }}
                className="text-xs font-bold text-neutral-600 hover:text-black border border-neutral-200 hover:bg-neutral-50 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Change Subject
              </button>
            )}

            <div className="h-5 w-[1px] bg-neutral-200 hidden sm:block" />

            <div className="text-[11px] font-mono font-semibold text-neutral-400 hidden sm:block">
              Study Room Active
            </div>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-rose-50 text-rose-800 text-sm font-sans px-4 py-3 border-b border-rose-100 flex items-center justify-between animate-fade-in" id="global-error-banner">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button 
            id="close-error-banner-btn"
            onClick={() => setGlobalError(null)} 
            className="p-1 hover:bg-rose-100 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Core Body Section */}
      <main className="flex-1 flex flex-col" id="global-main-container">
        {!activeSubject ? (
          /* LEVEL 1: NO SUBJECT SELECTED — RENDER SELECTION AND STUDY JOURNAL HISTORY LOGS */
          <div className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-between" id="selector-zone">
            
            {/* Subject Selector widget */}
            <SubjectSelection 
              onSelect={handleSelectSubject}
              isLoading={loadingSubject}
            />

            {/* Custom immersive loaders if course is generation status */}
            {loadingSubject && (
              <div className="fixed inset-0 bg-neutral-950/20 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" id="course-generation-spinner">
                <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl border border-neutral-100 text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></span>
                    <Sparkles className="w-5 h-5 text-amber-500 absolute animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-950 text-lg">Curation in progress</h3>
                    <p className="text-xs text-neutral-500 mt-1 font-mono font-medium leading-relaxed uppercase tracking-wider animate-pulse">
                      {loadingMessage}
                    </p>
                  </div>
                  <div className="text-[10px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                    Gemini is generating dynamic modules, checklists, and recall definitions. Please hold on.
                  </div>
                </div>
              </div>
            )}

            {/* Personal Study Logs Logs Card list */}
            {savedLogs.length > 0 && !loadingSubject && (
              <div className="max-w-4xl mx-auto w-full mt-10 border-t border-neutral-200/80 pt-8" id="study-history-logbook">
                <div className="flex items-center gap-2 mb-4 text-neutral-500">
                  <History className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                    My Study Cabinets ({savedLogs.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedLogs.map((log) => (
                    <div
                      id={`log-item-${log.subject.toLowerCase().replace(/\s+/g, '-')}`}
                      key={log.subject}
                      onClick={() => handleSelectSubject(log.subject)}
                      className="group p-4 bg-white hover:bg-neutral-50 rounded-2xl border border-neutral-200/70 hover:border-neutral-400 transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-neutral-900 group-hover:text-black truncate">
                          {log.subject}
                        </h4>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Last Study Session: {log.lastActive}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-700 bg-neutral-50 border border-neutral-100 py-1 px-2.5 rounded-lg transition">
                          Review
                        </span>
                        
                        <button
                          id={`delete-log-btn-${log.subject.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={(e) => handleDeleteLogItem(log.subject, e)}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-300 hover:text-rose-600 transition cursor-pointer"
                          title="Wipe record"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LEVEL 2: ACTIVE COURSE VIEW SCREEN — LOADED WORKSPACE */
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8" id="active-workspace-grid">
            
            {/* Primary Study content Column */}
            <div className={`col-span-1 ${isSidebarOpen ? "lg:col-span-8" : "lg:col-span-12"} space-y-6 flex flex-col justify-between`} id="study-workbench-col">
              
              <div className="space-y-6">
                {/* Visual Workspace Navigation (TABS) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-2 gap-4" id="study-panel-tabs">
                  <div className="flex items-center gap-1.5 p-1 bg-neutral-100/85 rounded-xl border border-neutral-200 inline-flex" role="tablist">
                    <button
                      id="tab-btn-notes"
                      role="tab"
                      aria-selected={activeTab === 'notes'}
                      onClick={() => handleTabChange('notes')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer outline-none ${
                        activeTab === 'notes'
                          ? "bg-white text-neutral-950 shadow-xs"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Study Notes
                    </button>
                    
                    <button
                      id="tab-btn-flashcards"
                      role="tab"
                      aria-selected={activeTab === 'flashcards'}
                      onClick={() => handleTabChange('flashcards')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer outline-none ${
                        activeTab === 'flashcards'
                          ? "bg-white text-neutral-950 shadow-xs"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      <Brain className="w-3.5 h-3.5" />
                      Recall Cards
                    </button>
                    
                    <button
                      id="tab-btn-quiz"
                      role="tab"
                      aria-selected={activeTab === 'quiz'}
                      onClick={() => handleTabChange('quiz')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer outline-none ${
                        activeTab === 'quiz'
                          ? "bg-white text-neutral-950 shadow-xs"
                          : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Mock Quiz
                    </button>
                  </div>

                  {/* Sidebar toggle button (Chat companion toggle) */}
                  <button
                    id="toggle-sidebar-btn"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="inline-flex items-center gap-2 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-xl px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black transition cursor-pointer outline-none self-start sm:self-auto"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {isSidebarOpen ? "Hide Companion" : "Show AI Companion"}
                  </button>
                </div>

                {/* Switcher Tab contents */}
                <div id="tab-workbench-wrapper" className="animate-fade-in">
                  
                  {/* TAB 1: STUDY NOTES SUMMARY MODULES */}
                  {activeTab === 'notes' && activeCourse && (
                    <CourseViewer 
                      modules={activeCourse.modules} 
                      subject={activeCourse.subject} 
                    />
                  )}

                  {/* TAB 2: ACTIVE RECALL FLASHCARDS DISPLAY WITH LOAD SCREEN */}
                  {activeTab === 'flashcards' && (
                    loadingFlashcards ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-4" id="flashcards-loader">
                        <span className="w-9 h-9 border-3 border-neutral-100 border-t-neutral-800 rounded-full animate-spin"></span>
                        <div>
                          <p className="text-sm font-bold text-neutral-800">Drafting study flashcards</p>
                          <p className="text-xs text-neutral-400 mt-1 leading-snug">Gemini is gathering key conceptual definitions...</p>
                        </div>
                      </div>
                    ) : (
                      <FlashcardSet 
                        cardList={flashcards} 
                        subject={activeSubject || "Active Topic"} 
                      />
                    )
                  )}

                  {/* TAB 3: MCQ PRACTICE ASSESSMENTS WITH LOAD SCREEN */}
                  {activeTab === 'quiz' && (
                    loadingQuiz ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-4" id="quiz-loader">
                        <span className="w-9 h-9 border-3 border-neutral-100 border-t-neutral-800 rounded-full animate-spin"></span>
                        <div>
                          <p className="text-sm font-bold text-neutral-800">Curating interactive questions</p>
                          <p className="text-xs text-neutral-400 mt-1 leading-snug">Structuring multiple choice distractor sets...</p>
                        </div>
                      </div>
                    ) : (
                      <PracticeQuiz 
                        questions={quizQuestions} 
                        subject={activeSubject || "Active Topic"}
                        onRetake={() => {
                          setActiveSubject(null);
                          setActiveCourse(null);
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Decorative brand footer footer note inside cabinet viewport */}
              <div className="text-center text-[11px] text-neutral-400 pt-8 border-t border-neutral-100 font-medium pb-2">
                All study metrics are auto-cached locally. Open lessons on any device securely.
              </div>
            </div>

            {/* AI companion Tutoring chat sidebar */}
            {isSidebarOpen && (
              <div className="col-span-1 lg:col-span-4 h-full flex flex-col justify-start" id="companion-sidebar-container">
                <div className="sticky top-20">
                  <StudyBuddy 
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={loadingChat}
                    subject={activeSubject || "Active Subject"}
                    notesContext={activeCourse?.modules[0]?.summary || ""}
                    onClearHistory={clearChatHistory}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
