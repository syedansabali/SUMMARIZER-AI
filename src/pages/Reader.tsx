import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ZoomIn, 
  ZoomOut, 
  Highlighter, 
  Bookmark, 
  LayoutGrid, 
  Search,
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  BrainCircuit,
  Zap,
  Mic,
  Paperclip,
  Send,
  Download,
  Share2,
  Loader2,
  User,
  Bot
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '../lib/utils';
import { geminiService, Message } from '../services/gemini';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';
import { v4 as uuidv4 } from 'uuid';

export function Reader() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I\'ve finished analyzing your document. How can I help you explore it today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isTutoringMode, setIsTutoringMode] = useState(false);
  const [tutorDifficulty, setTutorDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [tutorQuestionLimit, setTutorQuestionLimit] = useState(5);
  const [tutorQuestionCount, setTutorQuestionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<{ text: string; id: string }[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'research'>('chat');
  const virtuosoRef = useRef<any>(null);
  const [researchData, setResearchData] = useState<{
    topics: string[];
    connections: string[];
    questions: string[];
  } | null>(null);
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one phrase to make it feel more controlled
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const handleBookmark = () => {
    if (!summary) return;
    const date = new Date().toLocaleString();
    const newBookmark = `Bookmark from ${date}: ${summary.substring(0, 100)}...`;
    setBookmarks(prev => [...prev, newBookmark]);
    alert('Summary bookmarked!');
  };

  useEffect(() => {
    if (doc?.text) {
      // Split text into virtual "pages" (approx 4000 characters each for readability)
      const text = doc.text;
      const size = 4000;
      const chunks = [];
      for (let i = 0; i < text.length; i += size) {
        chunks.push(text.substring(i, i + size));
      }
      setPages(chunks);
    }
  }, [doc]);

  const handleTextSelection = () => {
    if (!isHighlighting) return;
    const selection = window.getSelection();
    if (selection && selection.toString().length > 5) {
      const selected = selection.toString();
      setHighlights(prev => [...prev, { text: selected, id: uuidv4() }]);
      selection.removeAllRanges();
      // Visual feedback could be added here
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 50), 200));
  };

  const handleExportPDF = () => {
    const docPdf = new jsPDF();
    const margin = 20;
    let yPos = 20;

    // Title
    docPdf.setFontSize(22);
    docPdf.text(doc?.filename || 'Document Insights', margin, yPos);
    yPos += 15;

    // Highlights
    if (highlights.length > 0) {
      docPdf.setFontSize(16);
      docPdf.text('Stored Highlights', margin, yPos);
      yPos += 10;
      docPdf.setFontSize(10);
      highlights.forEach(h => {
        const splitText = docPdf.splitTextToSize(`• ${h.text}`, 170);
        docPdf.text(splitText, margin, yPos);
        yPos += (splitText.length * 5) + 5;
        if (yPos > 270) {
          docPdf.addPage();
          yPos = 20;
        }
      });
      yPos += 10;
    }

    // Summary Header
    docPdf.setFontSize(16);
    docPdf.text('Executive Summary', margin, yPos);
    yPos += 10;

    // Summary Content
    docPdf.setFontSize(12);
    const splitSummary = docPdf.splitTextToSize(summary || 'No summary generated.', 170);
    docPdf.text(splitSummary, margin, yPos);
    yPos += (splitSummary.length * 7) + 15;

    // Bookmarks
    if (bookmarks.length > 0) {
      if (yPos > 250) {
        docPdf.addPage();
        yPos = 20;
      }
      docPdf.setFontSize(16);
      docPdf.text('Saved Bookmarks', margin, yPos);
      yPos += 10;
      docPdf.setFontSize(10);
      bookmarks.forEach(b => {
        const splitB = docPdf.splitTextToSize(b, 170);
        docPdf.text(splitB, margin, yPos);
        yPos += (splitB.length * 5) + 5;
        if (yPos > 270) {
          docPdf.addPage();
          yPos = 20;
        }
      });
    }

    docPdf.save(`${doc?.filename || 'document'}_insights.pdf`);
  };

  const startTutoring = async () => {
    if (!doc?.text) return;
    setIsTutoringMode(true);
    setIsSending(true);
    setTutorQuestionCount(1);
    try {
      const question = await geminiService.generateTutoringQuestion(doc.text, messages, tutorDifficulty);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `🎓 **Tutor Mode Active**\n\nLevel: **${tutorDifficulty.toUpperCase()}**\nLimit: **${tutorQuestionLimit} Questions**\n\nI'll ask you some questions to test your knowledge of this document. Here's your first one:\n\n${question}` 
      }]);
      setCurrentQuestion(question);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const toggleTutoring = () => {
    if (!isTutoringMode) {
      startTutoring();
    } else {
      setIsTutoringMode(false);
      setCurrentQuestion(null);
      setMessages(prev => [...prev, { role: 'model', text: 'Tutor mode deactivated. Feel free to ask any other questions!' }]);
    }
  };

  useEffect(() => {
    if (!jobId) {
      navigate('/dashboard');
      return;
    }

    const fetchDoc = async () => {
      try {
        const response = await fetch(`/api/documents/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch document');
        const data = await response.json();
        setDoc(data);
        
        // Generate initial summary and research insights
        if (data.text) {
          setIsResearchLoading(true);
          const sumPromise = geminiService.summarizeDocument(data.text);
          const researchPromise = geminiService.generateResearchAssistantSuggestions(data.text);
          
          const [sum, research] = await Promise.all([sumPromise, researchPromise]);
          
          setSummary(sum);
          setResearchData(research);
          setIsResearchLoading(false);
        }
      } catch (err) {
        console.error(err);
        setIsResearchLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [jobId, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !doc?.text) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      let context = '';
      if (isTutoringMode && currentQuestion) {
        // Evaluation logic
        const evaluation = await geminiService.evaluateTutoringAnswer(doc.text, currentQuestion, userMsg);
        setMessages(prev => [...prev, { role: 'model', text: evaluation }]);
        
        if (tutorQuestionCount >= tutorQuestionLimit) {
          setMessages(prev => [...prev, { role: 'model', text: `🎉 **Session Complete!**\n\nYou've finished your ${tutorQuestionLimit}-question session. Great job! Tutor mode is now deactivating.` }]);
          setIsTutoringMode(false);
          setCurrentQuestion(null);
          setIsSending(false);
          return;
        }

        setTimeout(async () => {
          setIsSending(true);
          const nextQuestion = await geminiService.generateTutoringQuestion(doc.text, [...messages, { role: 'user', text: userMsg }, { role: 'model', text: evaluation }], tutorDifficulty);
          setTutorQuestionCount(prev => prev + 1);
          setMessages(prev => [...prev, { role: 'model', text: `Question ${tutorQuestionCount + 1}/${tutorQuestionLimit}:\n\n${nextQuestion}` }]);
          setCurrentQuestion(nextQuestion);
          setIsSending(false);
        }, 1000);
      } else {
        // RAG Retrieval
        const ragRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, query: userMsg, chatId: jobId, messages })
        });
        
        if (ragRes.ok) {
          const { context: retrievedContext } = await ragRes.json();
          context = retrievedContext;
        }

        const response = await geminiService.chatWithDocument(context || doc.text, messages, userMsg);
        setMessages(prev => [...prev, { role: 'model', text: response }]);

        // Save assistant response to background
        fetch('/api/chat/save-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: jobId, text: response }) // Using jobId as chatId for simplicity in this version
        }).catch(err => console.error('Failed to save response:', err));
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Error: Failed to get AI response.' }]);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-on-surface-variant font-mono animate-pulse">Initializing AETHER CORE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-[73px] flex overflow-hidden bg-surface">
      {/* Left Pane: PDF Viewer */}
      <section className="flex-1 flex flex-col border-r border-white/5 relative bg-[#131318]">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => handleZoom(-10)}><ZoomOut className="w-4 h-4" /></Button>
            <span className="text-xs font-semibold px-2">{zoom}%</span>
            <Button variant="ghost" size="sm" className="p-2" onClick={() => handleZoom(10)}><ZoomIn className="w-4 h-4" /></Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("p-2", isHighlighting ? "bg-secondary/20 text-secondary" : "text-on-surface-variant")}
                onClick={() => setIsHighlighting(!isHighlighting)}
              >
                <Highlighter className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("p-2", bookmarks.length > 0 && "text-primary")}
                onClick={handleBookmark}
              >
                <Bookmark className={cn("w-4 h-4", bookmarks.length > 0 && "fill-current")} />
              </Button>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
              <ChevronLeft 
                className={cn("w-4 h-4 cursor-pointer hover:text-white", currentPage <= 1 && "opacity-20 pointer-events-none")} 
                onClick={() => virtuosoRef.current?.scrollToIndex(currentPage - 2)}
              />
              <span>Page {currentPage} / {pages.length || 1}</span>
              <ChevronRight 
                className={cn("w-4 h-4 cursor-pointer hover:text-white", currentPage >= pages.length && "opacity-20 pointer-events-none")} 
                onClick={() => virtuosoRef.current?.scrollToIndex(currentPage)}
              />
            </div>
          </div>

          <div>
            <Button variant="ghost" size="sm" className="p-2"><LayoutGrid className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Virtuoso Content Surface */}
        <div className="flex-1 bg-[#1a1a20] relative" onMouseUp={handleTextSelection}>
          <Virtuoso
            ref={virtuosoRef}
            data={pages}
            overscan={2}
            rangeChanged={(range) => setCurrentPage(range.startIndex + 1)}
            itemContent={(index, pageContent) => (
              <div className="flex justify-center py-12 px-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  className="max-w-[800px] w-full bg-white shadow-2xl min-h-[1050px] p-16 text-[#121212] font-serif relative"
                >
                  {index === 0 && (
                    <>
                      <h1 className="text-3xl font-bold mb-8 border-b pb-4">{doc?.filename || 'Document View'}</h1>
                      {summary && (
                        <div className="mb-12 bg-primary/5 p-6 rounded-xl border border-primary/10">
                           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                            <Sparkles className="w-5 h-5" /> Executive Summary
                           </h2>
                           <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-justify text-sm italic">
                            {summary}
                           </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className={cn(
                    "prose prose-sm max-w-none prose-slate whitespace-pre-wrap leading-relaxed opacity-90 text-sm selection:bg-secondary/30",
                    isHighlighting && "cursor-text"
                  )}>
                    {pageContent}
                  </div>

                  <div className="absolute bottom-6 right-10 text-[10px] font-mono text-black/20">
                    Summarizer AI Engine / PAGE {index + 1}
                  </div>
                </motion.div>
              </div>
            )}
            style={{ height: '100%' }}
            className="scrollbar-hide"
          />
        </div>
      </section>

      {/* Right Pane: AI Assistant */}
      <aside className="w-[450px] shrink-0 border-l border-white/5 flex flex-col glass-panel shadow-2xl relative z-20">
        <div className="p-4 border-b border-white/5 bg-surface-container-low/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                isTutoringMode ? "bg-secondary/20 glow-cyan" : "bg-primary/20 glow-purple"
              )}>
                {isTutoringMode ? <BrainCircuit className="w-5 h-5 text-secondary" /> : <Sparkles className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <h2 className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-white">
                  {isTutoringMode ? t('reader.tutorMode') : t('reader.studyCore')}
                </h2>
                <p className="text-[10px] font-mono text-secondary opacity-60">
                  {isSending ? t('reader.distilling') : isTutoringMode ? 'Tutoring Active' : t('reader.ready')}
                </p>
              </div>
            </div>
            
            <Button 
              variant="glass" 
              size="sm" 
              onClick={toggleTutoring}
              className={cn(
                "h-8 text-[9px] uppercase tracking-widest font-bold px-3 space-x-2",
                isTutoringMode ? "border-secondary/50 text-secondary" : "border-white/10 text-white/60"
              )}
            >
              <Zap className={cn("w-3 h-3", isTutoringMode && "fill-secondary text-secondary")} />
              <span>{t('reader.tutorMode')}</span>
            </Button>
          </div>

          {!isTutoringMode && (
            <div className="flex items-center gap-4 py-1 animate-in fade-in slide-in-from-top-2">
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-[8px] uppercase tracking-widest font-bold text-white/40">Difficulty</p>
                <select 
                  value={tutorDifficulty}
                  onChange={(e) => setTutorDifficulty(e.target.value as any)}
                  className="bg-white/5 border-none rounded-md text-[10px] text-white p-1 focus:ring-1 focus:ring-secondary/50"
                >
                  <option value="beginner" className="bg-surface">Beginner</option>
                  <option value="intermediate" className="bg-surface">Intermediate</option>
                  <option value="advanced" className="bg-surface">Advanced</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-[8px] uppercase tracking-widest font-bold text-white/40">Questions</p>
                <input 
                  type="number" 
                  min="1" 
                  max="20"
                  value={tutorQuestionLimit}
                  onChange={(e) => setTutorQuestionLimit(parseInt(e.target.value) || 5)}
                  className="bg-white/5 border-none rounded-md text-[10px] text-white p-1 focus:ring-1 focus:ring-secondary/50 w-full"
                />
              </div>
            </div>
          )}

          <div className="flex gap-1 bg-surface/50 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 py-2 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all",
                activeTab === 'chat' ? "bg-primary/20 text-primary shadow-sm" : "opacity-40 hover:opacity-100"
              )}
            >
              Summarizer AI Chat
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={cn(
                "flex-1 py-2 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
                activeTab === 'research' ? "bg-secondary/20 text-secondary shadow-sm" : "opacity-40 hover:opacity-100"
              )}
            >
              <Search className="w-3 h-3" />
              Research Lab
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {activeTab === 'chat' ? (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "glass-card p-4 rounded-xl max-w-[90%] shadow-lg border-white/5",
                  msg.role === 'user' ? "ml-auto bg-primary/10 border-primary/20" : "mr-auto bg-surface-container-low"
                )}>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-white/40 mb-2 font-mono flex items-center gap-2">
                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    {msg.role === 'user' ? 'USER' : 'SUMMARIZER AI'}
                  </p>
                  <p className="text-sm leading-relaxed text-white whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              ))}
              {isSending && (
                <div className="glass-card p-4 rounded-xl max-w-[90%] mr-auto bg-surface-container-low animate-pulse">
                   <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                   </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {isResearchLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs uppercase font-bold tracking-widest">Generating Research Map...</p>
                </div>
              ) : researchData ? (
                <>
                  <section>
                    <h3 className="text-[10px] uppercase font-bold text-secondary tracking-widest mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Related Research Topics
                    </h3>
                    <div className="space-y-3">
                      {researchData.topics.map((topic, i) => (
                        <div key={i} className="glass-card p-4 rounded-xl border-white/5 hover:border-secondary/30 transition-colors group cursor-pointer">
                          <p className="text-sm text-white group-hover:text-secondary transition-colors font-medium">{topic}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] uppercase font-bold text-primary tracking-widest mb-4 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" /> Academic Connections
                    </h3>
                    <div className="space-y-3">
                      {researchData.connections.map((conn, i) => (
                        <div key={i} className="glass-card p-4 rounded-xl border-white/5 hover:border-primary/30 transition-colors group">
                          <p className="text-sm text-white/80 italic leading-relaxed">{conn}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] uppercase font-bold text-white tracking-widest mb-4 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" /> Deep-Dive Questions
                    </h3>
                    <div className="space-y-3">
                      {researchData.questions.map((q, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setActiveTab('chat');
                            setInputValue(q);
                          }}
                          className="w-full text-left glass-card p-4 rounded-xl border-white/5 hover:bg-white/5 transition-all text-sm text-white"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <p className="text-sm text-white/40 text-center py-10">No research data available for this document.</p>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area - Only show when Chat tab is active */}
        {activeTab === 'chat' && (
          <div className="p-6 bg-surface-container-low/40 border-t border-white/5">
            <div className="relative flex items-end gap-3">
              <div className="flex-1 glass-panel px-4 py-3 min-h-[50px] flex items-center group focus-within:border-primary/50 transition-colors">
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-on-surface-variant resize-none h-6 pt-0" 
                  placeholder={t('reader.placeholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button 
                  onClick={toggleListening}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "text-on-surface-variant hover:text-primary"
                  )}
                >
                  <Mic className={cn("w-4 h-4", isListening && "fill-current")} />
                </button>
              </div>
              <Button 
                className="w-12 h-12 p-0 rounded-xl shrink-0"
                onClick={handleSend}
                disabled={isSending || !inputValue.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-[480px] flex flex-col gap-3">
        <Button 
          onClick={handleExportPDF}
          className="h-12 px-6 gap-3 shadow-2xl rounded-xl"
        >
          <Download className="w-4 h-4" />
          Export as PDF
        </Button>
      </div>
    </div>
  );
}
