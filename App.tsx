import React, { useState, useEffect, useRef } from 'react';
import { Tab, ResumeAnalysis, BehavioralAnalysis, TechnicalAnalysis } from './types';
import { analyzeResume, analyzeBehavioral, analyzeTechnical, getBehavioralQuestions, getTechnicalQuestions } from './services/geminiService';
import { AnalysisResult } from './components/AnalysisResult';
import { BrainCircuit, Loader2, Lock, ArrowRight, XCircle, Trophy, Upload, FileText, Send, CheckCircle, Mic, MicOff, Clock, AlertTriangle } from 'lucide-react';

const RESUME_PASS_THRESHOLD = 70;
const BEHAVIORAL_PASS_THRESHOLD = 70;
const TECHNICAL_PASS_THRESHOLD = 35; // Lowered as requested

// --- Sub-component: Interview Wizard ---
interface QuestionItem {
  question: string;
  type: 'behavioral' | 'technical';
}

interface WizardProps {
  questions: QuestionItem[];
  onComplete: (answers: { question: string; answer: string; type: 'behavioral' | 'technical' }[]) => void;
  isLoading: boolean;
  title: string;
}

const InterviewWizard: React.FC<WizardProps> = ({ questions, onComplete, isLoading, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Refs to access latest state inside timer closure
  const answerRef = useRef(currentAnswer);
  const answersRef = useRef(answers);
  
  useEffect(() => { answerRef.current = currentAnswer; }, [currentAnswer]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        // console.error("Speech recognition error", event.error);
        // Ignore errors to prevent UI spam, just stop listening state
        if (event.error === 'not-allowed') {
            alert("Microphone access blocked. Please enable permissions.");
        }
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
            // Append with a space
            setCurrentAnswer(prev => {
                const needsSpace = prev.length > 0 && !prev.endsWith(' ');
                return prev + (needsSpace ? ' ' : '') + finalTranscript;
            });
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const handleMoveToNext = (updatedAnswers: string[]) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer("");
      // Mic will be restarted by the useEffect dependent on currentIndex
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      
      const result = questions.map((q, i) => ({
        question: q.question,
        type: q.type,
        answer: updatedAnswers[i]
      }));
      onComplete(result);
    }
  };

  const handleTimeUp = () => {
     // Stop mic briefly to ensure clean break
     if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
     }

     const text = answerRef.current;
     const currentAnswers = [...answersRef.current];
     currentAnswers[currentIndex] = text || "(No answer provided in time)";
     setAnswers(currentAnswers);
     
     handleMoveToNext(currentAnswers);
  };

  const handleNextClick = () => {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = currentAnswer;
      setAnswers(newAnswers);
      handleMoveToNext(newAnswers);
  };

  const toggleListening = () => {
      if (!recognitionRef.current) {
          alert("Speech recognition not supported.");
          return;
      }
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          try { recognitionRef.current.start(); } catch(e) {}
      }
  };

  // Timer & Auto-Mic Logic for Current Question
  useEffect(() => {
    setTimeLeft(60);
    
    // Auto-start microphone
    if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
        } catch (e) {
            // Already started or blocked
        }
    }
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp(); // Accessing function defined above
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
       if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]); // Re-run when question changes

  const currentQ = questions[currentIndex];

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fadeIn relative overflow-hidden">
      {/* Timer Bar */}
      <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full">
         <div 
            className={`h-full transition-all duration-1000 linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-indigo-500'}`} 
            style={{ width: `${(timeLeft / 60) * 100}%` }}
         ></div>
      </div>

      <div className="flex justify-between items-center mb-6 border-b pb-4 mt-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${currentQ.type === 'behavioral' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {currentQ.type === 'behavioral' ? 'Behavioral' : 'Technical'}
            </span>
            <p className="text-slate-500 text-sm">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
             <div className={`flex items-center gap-1 font-mono font-bold text-lg ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                <Clock size={18} /> {timeLeft}s
             </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-slate-800 mb-4 leading-relaxed">{currentQ.question}</h4>
        <div className="relative">
            <textarea
            className="w-full p-4 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-40 resize-none bg-slate-50"
            placeholder="Listening... (Speak now)"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            autoFocus
            />
            
            <button 
                onClick={toggleListening}
                className={`absolute bottom-4 right-4 p-2 rounded-full transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                title={isListening ? "Stop Recording" : "Start Recording"}
            >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            {isListening ? <span className="text-red-500 flex items-center gap-1"><Mic size={10} /> Microphone Active</span> : "Microphone Paused"}
            - Auto-advances in {timeLeft}s
        </p>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleNextClick}
          disabled={!currentAnswer.trim() && !isListening && timeLeft > 0} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              {currentIndex === questions.length - 1 ? "Submit Interview" : "Next Question"}
              {currentIndex !== questions.length - 1 && <ArrowRight size={18} />}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.RESUME);
  const [loading, setLoading] = useState(false);

  // Resume State
  const [resumeText, setResumeText] = useState("");
  const [resumeInputMethod, setResumeInputMethod] = useState<'text' | 'file'>('text');
  const [resumeFile, setResumeFile] = useState<{name: string, data: string, mimeType: string} | null>(null);

  // JD State
  const [jdText, setJdText] = useState("");
  const [jdInputMethod, setJdInputMethod] = useState<'text' | 'file'>('text');
  const [jdFile, setJdFile] = useState<{name: string, data: string, mimeType: string} | null>(null);

  const [resumeResult, setResumeResult] = useState<ResumeAnalysis | null>(null);

  // Interview State
  const [interviewQuestions, setInterviewQuestions] = useState<QuestionItem[]>([]);
  const [interviewResults, setInterviewResults] = useState<{
    behavioral: BehavioralAnalysis | null;
    technical: TechnicalAnalysis | null;
  } | null>(null);

  // Progression Logic
  const isResumePassed = resumeResult ? resumeResult.overall_resume_score >= RESUME_PASS_THRESHOLD : false;
  
  const canAccessInterview = isResumePassed;

  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Please upload a PDF file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        setResumeFile({
            name: file.name,
            data: base64Data,
            mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Please upload a PDF file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        setJdFile({
            name: file.name,
            data: base64Data,
            mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeAnalysis = async () => {
    // Validate JD
    if (jdInputMethod === 'text' && !jdText) {
        alert("Please paste the Job Description.");
        return;
    }
    if (jdInputMethod === 'file' && !jdFile) {
        alert("Please upload a Job Description PDF.");
        return;
    }

    // Validate Resume
    if (resumeInputMethod === 'text' && !resumeText) {
        alert("Please paste the resume text.");
        return;
    }
    if (resumeInputMethod === 'file' && !resumeFile) {
        alert("Please upload a resume PDF.");
        return;
    }
    
    setLoading(true);
    try {
      const resumeInput = resumeInputMethod === 'text' 
        ? resumeText 
        : { mimeType: resumeFile!.mimeType, data: resumeFile!.data };

      const jdInput = jdInputMethod === 'text'
        ? jdText
        : { mimeType: jdFile!.mimeType, data: jdFile!.data };
        
      const res = await analyzeResume(resumeInput, jdInput);
      setResumeResult(res);
      
      const textForQuestions = jdInputMethod === 'text' ? jdText : "software engineer react node"; 
      
      const bQuestions = getBehavioralQuestions().map(q => ({ question: q, type: 'behavioral' as const }));
      const tQuestions = getTechnicalQuestions(textForQuestions).map(q => ({ question: q, type: 'technical' as const }));
      
      setInterviewQuestions([...bQuestions, ...tQuestions]);
      
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewComplete = async (answers: { question: string; answer: string; type: 'behavioral' | 'technical' }[]) => {
    setLoading(true);
    try {
      const behavioralTranscript = answers
        .filter(a => a.type === 'behavioral')
        .map(a => `Interviewer: ${a.question}\nCandidate: ${a.answer}`)
        .join("\n\n");

      const technicalTranscript = answers
        .filter(a => a.type === 'technical')
        .map(a => `Interviewer: ${a.question}\nCandidate: ${a.answer}`)
        .join("\n\n");

      const [bResult, tResult] = await Promise.all([
        analyzeBehavioral(behavioralTranscript),
        analyzeTechnical(technicalTranscript)
      ]);

      setInterviewResults({
        behavioral: bResult,
        technical: tResult
      });

    } catch (e) {
      console.error(e);
      alert("Interview analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: Tab.RESUME, label: '1. Resume Screening', locked: false },
    { id: Tab.INTERVIEW, label: '2. Interview Phase', locked: !canAccessInterview },
  ];

  const isInterviewPassed = interviewResults 
    ? (interviewResults.behavioral?.overall_soft_skill_score || 0) >= BEHAVIORAL_PASS_THRESHOLD && 
      (interviewResults.technical?.overall_technical_score || 0) >= TECHNICAL_PASS_THRESHOLD
    : false;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      
      <header className="border-b border-slate-100 py-4 px-6 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <BrainCircuit size={24} />
            <h1 className="text-xl font-bold tracking-tight">TalentScout AI</h1>
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
             Recruitment Pipeline
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        
        <div className="flex border-b border-slate-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.locked && setActiveTab(tab.id)}
              disabled={tab.locked}
              className={`pb-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : tab.locked
                    ? 'border-transparent text-slate-300 cursor-not-allowed'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.locked && <Lock size={12} />}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-8">
            
            {/* 1. RESUME SECTION */}
            {activeTab === Tab.RESUME && (
                <div className="animate-fadeIn">
                    {!resumeResult && (
                        <div className="space-y-4">
                            {/* Job Description Input */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">Job Description</label>
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        <button 
                                            onClick={() => setJdInputMethod('text')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${jdInputMethod === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Paste Text
                                        </button>
                                        <button 
                                            onClick={() => setJdInputMethod('file')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${jdInputMethod === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Upload PDF
                                        </button>
                                    </div>
                                </div>

                                {jdInputMethod === 'text' ? (
                                    <textarea
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none"
                                        placeholder="Paste Job Description..."
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                    />
                                ) : (
                                    <div className="w-full p-8 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={handleJdFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {jdFile ? (
                                            <div className="flex flex-col items-center text-indigo-600">
                                                <FileText size={32} className="mb-2" />
                                                <span className="text-sm font-medium">{jdFile.name}</span>
                                                <span className="text-xs text-indigo-400 mt-1">Click to replace</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <Upload size={32} className="mb-2" />
                                                <span className="text-sm font-medium">Click to upload JD PDF</span>
                                                <span className="text-xs mt-1">Max 5MB</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Resume Input */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">Candidate Resume</label>
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        <button 
                                            onClick={() => setResumeInputMethod('text')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${resumeInputMethod === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Paste Text
                                        </button>
                                        <button 
                                            onClick={() => setResumeInputMethod('file')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${resumeInputMethod === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Upload PDF
                                        </button>
                                    </div>
                                </div>
                                
                                {resumeInputMethod === 'text' ? (
                                    <textarea
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none"
                                        placeholder="Paste Resume Text..."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                    />
                                ) : (
                                    <div className="w-full p-8 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={handleResumeFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {resumeFile ? (
                                            <div className="flex flex-col items-center text-indigo-600">
                                                <FileText size={32} className="mb-2" />
                                                <span className="text-sm font-medium">{resumeFile.name}</span>
                                                <span className="text-xs text-indigo-400 mt-1">Click to replace</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <Upload size={32} className="mb-2" />
                                                <span className="text-sm font-medium">Click to upload PDF</span>
                                                <span className="text-xs mt-1">Max 5MB</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleResumeAnalysis}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Evaluate Candidate'}
                            </button>
                        </div>
                    )}

                    {resumeResult && (
                        <div className="space-y-6">
                            <AnalysisResult type="resume" data={resumeResult} />
                            
                            <div className={`p-4 rounded-lg border flex items-center justify-between ${isResumePassed ? 'bg-indigo-50 border-indigo-200' : 'bg-red-50 border-red-200'}`}>
                                <div>
                                    <h3 className={`font-bold ${isResumePassed ? 'text-indigo-900' : 'text-red-900'}`}>
                                        {isResumePassed ? 'Phase 1 Passed' : 'Phase 1 Failed'}
                                    </h3>
                                    <p className="text-sm opacity-80">
                                        {isResumePassed ? 'Proceed to Interview Phase.' : 'Score below 70. Rejection recommended.'}
                                    </p>
                                </div>
                                {isResumePassed ? (
                                    <button 
                                        onClick={() => setActiveTab(Tab.INTERVIEW)}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
                                    >
                                        Start Interview <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-600 font-bold text-sm">
                                        <XCircle size={16} /> Rejected
                                    </span>
                                )}
                            </div>
                            
                            <button onClick={() => setResumeResult(null)} className="text-slate-400 text-sm hover:text-slate-600 underline">
                                Reset Analysis
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 2. INTERVIEW SECTION (Combined) */}
            {activeTab === Tab.INTERVIEW && (
                <div className="animate-fadeIn">
                     {!interviewResults ? (
                        <div className="space-y-4">
                            {interviewQuestions.length > 0 ? (
                              <InterviewWizard 
                                title="Candidate Interview"
                                questions={interviewQuestions}
                                isLoading={loading}
                                onComplete={handleInterviewComplete}
                              />
                            ) : (
                              <div className="p-8 text-center text-slate-500">
                                <Loader2 className="animate-spin mx-auto mb-2" />
                                Loading questions...
                              </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Render both results */}
                            {interviewResults.behavioral && <AnalysisResult type="behavioral" data={interviewResults.behavioral} />}
                            {interviewResults.technical && <AnalysisResult type="technical" data={interviewResults.technical} />}

                            <div className={`p-6 rounded-lg border flex flex-col items-center justify-center text-center gap-3 ${isInterviewPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                {isInterviewPassed ? (
                                    <>
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                            <Trophy size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-emerald-900 mb-2">You are eligible to apply!</h3>
                                            <p className="text-emerald-700">Passed both technical and behavioral assessments.</p>
                                        </div>
                                        <button className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                                            <CheckCircle size={20} />
                                            Submit Application
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-1">
                                            <XCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-red-900">Application Rejected</h3>
                                            <p className="text-red-700">
                                               {interviewResults.behavioral && interviewResults.behavioral.overall_soft_skill_score < BEHAVIORAL_PASS_THRESHOLD ? `Behavioral score too low (<${BEHAVIORAL_PASS_THRESHOLD}). ` : ""}
                                               {interviewResults.technical && interviewResults.technical.overall_technical_score < TECHNICAL_PASS_THRESHOLD ? `Technical score too low (<${TECHNICAL_PASS_THRESHOLD}).` : ""}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-indigo-600 w-10 h-10 mb-4" />
                        <p className="text-slate-600 font-medium">Analyzing...</p>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}