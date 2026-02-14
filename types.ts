import React from 'react';

export interface ResumeAnalysis {
  tech_stack_match_percentage: number;
  missing_critical_skills: string[];
  internship_relevance_score: number;
  project_complexity_score: number;
  experience_consistency_score: number;
  skill_authenticity_risk: number;
  overall_resume_score: number;
  improvement_suggestions: string[];
}

export interface BehavioralAnalysis {
  communication_score: number;
  structured_thinking_score: number;
  problem_ownership_score: number;
  emotional_intelligence_score: number;
  authenticity_score: number;
  overall_soft_skill_score: number;
  behavioral_risk_flag: "Low" | "Medium" | "High";
  improvement_feedback: string[];
}

export interface TechnicalAnalysis {
  conceptual_accuracy_score: number;
  depth_of_understanding_score: number;
  logical_clarity_score: number;
  practical_application_score: number;
  error_detection_score: number;
  overall_technical_score: number;
  technical_level_estimate: "Beginner" | "Intermediate" | "Advanced";
  technical_gaps: string[];
}

export enum Tab {
  RESUME = 'resume',
  INTERVIEW = 'interview',
}

export interface NavItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}