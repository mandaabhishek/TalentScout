import React from 'react';
import { ResumeAnalysis, BehavioralAnalysis, TechnicalAnalysis } from '../types';
import { AlertTriangle, CheckCircle, TrendingUp, ShieldAlert, Award } from 'lucide-react';

interface Props {
  type: 'resume' | 'behavioral' | 'technical';
  data: ResumeAnalysis | BehavioralAnalysis | TechnicalAnalysis;
}

const ProgressBar = ({ label, score, colorClass = "bg-indigo-600" }: { label: string, score: number, colorClass?: string }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="font-bold text-slate-900">{score}</span>
    </div>
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${score}%` }}></div>
    </div>
  </div>
);

export const AnalysisResult: React.FC<Props> = ({ type, data }) => {
  
  const getScoreColor = (score: number) => {
    // Custom threshold for technical
    if (type === 'technical') {
       if (score >= 60) return 'bg-emerald-500';
       if (score >= 35) return 'bg-indigo-500';
       if (score >= 20) return 'bg-amber-500';
       return 'bg-red-500';
    }
    // Standard thresholds for resume/behavioral
    if (score >= 80) return 'bg-emerald-500'; 
    if (score >= 70) return 'bg-indigo-500';
    if (score >= 50) return 'bg-amber-500'; 
    return 'bg-red-500'; 
  };

  const getScoreTextColor = (score: number) => {
    if (type === 'technical') {
       if (score >= 60) return 'text-emerald-600';
       if (score >= 35) return 'text-indigo-600';
       if (score >= 20) return 'text-amber-600';
       return 'text-red-600';
    }
    if (score >= 80) return 'text-emerald-600'; 
    if (score >= 70) return 'text-indigo-600';
    if (score >= 50) return 'text-amber-600'; 
    return 'text-red-600'; 
  };

  const renderResume = (d: ResumeAnalysis) => {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Resume Analysis</h3>
                <p className="text-slate-500 text-sm">Overall Match</p>
            </div>
            <div className={`text-4xl font-bold ${getScoreTextColor(d.overall_resume_score)}`}>
                {d.overall_resume_score}/100
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
                <h4 className="font-semibold text-slate-700 mb-3">Key Metrics</h4>
                <ProgressBar label="Tech Stack Match" score={d.tech_stack_match_percentage} colorClass={getScoreColor(d.tech_stack_match_percentage)} />
                <ProgressBar label="Internship Relevance" score={d.internship_relevance_score} colorClass={getScoreColor(d.internship_relevance_score)} />
                <ProgressBar label="Project Complexity" score={d.project_complexity_score} colorClass={getScoreColor(d.project_complexity_score)} />
                <ProgressBar label="Experience Consistency" score={d.experience_consistency_score} colorClass={getScoreColor(d.experience_consistency_score)} />
            </div>
            <div>
                <h4 className="font-semibold text-slate-700 mb-3">Risk Analysis</h4>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100 mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                             <ShieldAlert size={16} /> Authenticity Risk
                        </span>
                        <span className={`font-bold ${d.skill_authenticity_risk > 30 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {d.skill_authenticity_risk}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Probability of exaggerated skills.</p>
                </div>
                
                {d.missing_critical_skills.length > 0 ? (
                    <div className="bg-red-50 p-4 rounded-md border border-red-100">
                        <h5 className="text-red-800 text-sm font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Missing Skills</h5>
                        <div className="flex flex-wrap gap-2">
                            {d.missing_critical_skills.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-white text-red-700 text-xs border border-red-100 rounded">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
                        <CheckCircle size={16} /> No critical skills missing.
                    </div>
                )}
            </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h4 className="text-blue-900 font-semibold text-sm mb-2">Improvement Suggestions</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                {d.improvement_suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
        </div>
      </div>
    );
  };

  const renderBehavioral = (d: BehavioralAnalysis) => {
      return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Behavioral Assessment</h3>
                    <p className="text-slate-500 text-sm">Soft Skills Score</p>
                </div>
                <div className="text-right">
                    <div className={`text-4xl font-bold ${getScoreTextColor(d.overall_soft_skill_score)}`}>
                        {d.overall_soft_skill_score}/100
                    </div>
                    <div className={`text-sm font-semibold mt-1 ${
                        d.behavioral_risk_flag === 'High' ? 'text-red-600' : 
                        d.behavioral_risk_flag === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                        {d.behavioral_risk_flag} Risk Profile
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <ProgressBar label="Communication" score={d.communication_score} colorClass={getScoreColor(d.communication_score)} />
                <ProgressBar label="Structured Thinking" score={d.structured_thinking_score} colorClass={getScoreColor(d.structured_thinking_score)} />
                <ProgressBar label="Problem Ownership" score={d.problem_ownership_score} colorClass={getScoreColor(d.problem_ownership_score)} />
                <ProgressBar label="Emotional Intelligence" score={d.emotional_intelligence_score} colorClass={getScoreColor(d.emotional_intelligence_score)} />
                <ProgressBar label="Authenticity" score={d.authenticity_score} colorClass={getScoreColor(d.authenticity_score)} />
            </div>

            <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                <h4 className="text-slate-800 font-semibold text-sm mb-2">Feedback</h4>
                <ul className="space-y-1 text-sm text-slate-700">
                    {d.improvement_feedback.map((f, i) => (
                         <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span> {f}
                         </li>
                    ))}
                </ul>
            </div>
        </div>
      );
  };

  const renderTechnical = (d: TechnicalAnalysis) => {
      return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Technical Evaluation</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Award size={16} className="text-amber-500" />
                        <span className="text-sm font-medium text-slate-600">{d.technical_level_estimate} Level</span>
                    </div>
                </div>
                <div className={`text-4xl font-bold ${getScoreTextColor(d.overall_technical_score)}`}>
                    {d.overall_technical_score}/100
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Capabilities</h4>
                    <ProgressBar label="Conceptual Accuracy" score={d.conceptual_accuracy_score} colorClass={getScoreColor(d.conceptual_accuracy_score)} />
                    <ProgressBar label="Depth of Understanding" score={d.depth_of_understanding_score} colorClass={getScoreColor(d.depth_of_understanding_score)} />
                    <ProgressBar label="Logical Clarity" score={d.logical_clarity_score} colorClass={getScoreColor(d.logical_clarity_score)} />
                    <ProgressBar label="Practical Application" score={d.practical_application_score} colorClass={getScoreColor(d.practical_application_score)} />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Gaps & Weaknesses</h4>
                    {d.technical_gaps.length > 0 ? (
                        <div className="flex flex-col gap-2">
                             {d.technical_gaps.map((gap, i) => (
                                <div key={i} className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm border border-red-100 flex items-center gap-2">
                                    <AlertTriangle size={14} /> {gap}
                                </div>
                             ))}
                        </div>
                    ) : (
                        <p className="text-sm text-emerald-600 italic">No major technical gaps detected.</p>
                    )}
                </div>
            </div>
        </div>
      );
  }

  if (type === 'resume') return renderResume(data as ResumeAnalysis);
  if (type === 'behavioral') return renderBehavioral(data as BehavioralAnalysis);
  return renderTechnical(data as TechnicalAnalysis);
};