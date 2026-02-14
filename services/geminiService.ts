import { ResumeAnalysis, BehavioralAnalysis, TechnicalAnalysis } from "../types";
import * as pdfjsLib from 'pdfjs-dist';

// Handle ES module default export for pdfjs-dist.
// Some environments put the library on the default export, others on the namespace.
const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

// Set worker source for PDF.js
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

const IMPLICIT_SKILLS: Record<string, string[]> = {
  "mern": ["mongodb", "express", "react", "node", "javascript", "html", "css", "rest api"],
  "mean": ["mongodb", "express", "angular", "node", "javascript", "html", "css"],
  "java": ["oop", "object oriented programming", "spring", "maven", "gradle"],
  "python": ["django", "flask", "scripting", "pandas", "numpy"],
  "frontend": ["html", "css", "javascript", "react", "vue", "angular", "responsive design"],
  "backend": ["node", "python", "java", "sql", "database", "api"],
  "fullstack": ["frontend", "backend", "database", "deployment"],
  "devops": ["aws", "docker", "kubernetes", "ci/cd", "jenkins", "linux"],
  "aws": ["cloud", "ec2", "s3", "lambda"],
  "azure": ["cloud", "microsoft"],
  "gcp": ["cloud", "google cloud"],
  "sql": ["database", "mysql", "postgresql", "relational database"],
  "nosql": ["mongodb", "dynamodb", "cassandra"]
};

const CRITICAL_KEYWORDS = [
  "experience", "project", "education", "skill", "technology", "language", "framework", 
  "database", "internship", "degree", "bachelor", "master", "phd"
];

// --- Helper Functions ---

const normalizeText = (text: string): string => {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

const extractKeywords = (text: string): Set<string> => {
  const normalized = normalizeText(text);
  const words = new Set(normalized.split(' '));
  return words;
};

const expandSkills = (keywords: Set<string>): Set<string> => {
  const expanded = new Set(keywords);
  keywords.forEach(k => {
    if (IMPLICIT_SKILLS[k]) {
      IMPLICIT_SKILLS[k].forEach(skill => expanded.add(skill));
    }
  });
  return expanded;
};

const parsePdf = async (base64Data: string): Promise<string> => {
  try {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Use the normalized pdfjs object
    const loadingTask = pdfjs.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }
    return fullText;
  } catch (error) {
    console.error("PDF Parse Error", error);
    throw new Error("Failed to parse PDF file.");
  }
};

const getTextFromInput = async (input: string | { mimeType: string; data: string }): Promise<string> => {
  if (typeof input === 'string') {
    return input;
  } else {
    // Determine if PDF
    if (input.mimeType === 'application/pdf') {
      return await parsePdf(input.data);
    } else {
      // Fallback for simple text if somehow passed as object
      return atob(input.data); 
    }
  }
};

// --- Question Generation Functions ---

export const getBehavioralQuestions = (): string[] => {
  return [
    "Describe a situation where you had to resolve a conflict within your team. What was the outcome?",
    "Tell me about a time you made a mistake at work. How did you handle it?",
    "Describe a complex project you worked on. What was your specific role and contribution?"
  ];
};

export const getTechnicalQuestions = (jdText: string): string[] => {
  const normalized = normalizeText(jdText);
  const questions: string[] = [];

  // Frontend
  if (normalized.includes("react")) questions.push("Explain the Virtual DOM in React and how reconciliation works.");
  if (normalized.includes("angular")) questions.push("Explain Dependency Injection in Angular and its benefits.");
  if (normalized.includes("vue")) questions.push("Describe the Vue.js reactivity system.");
  if (normalized.includes("javascript") || normalized.includes("frontend")) questions.push("Explain the concept of Closures and the Event Loop in JavaScript.");
  
  // Backend
  if (normalized.includes("node")) questions.push("How does Node.js handle concurrency given it is single-threaded?");
  if (normalized.includes("python")) questions.push("Explain the difference between lists and tuples in Python, and when to use which.");
  if (normalized.includes("java")) questions.push("What is the difference between an Interface and an Abstract Class in Java?");
  if (normalized.includes("spring")) questions.push("Explain the core concept of Inversion of Control (IoC) in Spring Boot.");
  
  // Data
  if (normalized.includes("sql") || normalized.includes("database")) questions.push("Explain the ACID properties in databases.");
  if (normalized.includes("nosql") || normalized.includes("mongo")) questions.push("When would you choose a NoSQL database over a relational database?");
  
  // Cloud/DevOps
  if (normalized.includes("aws") || normalized.includes("cloud")) questions.push("Explain the difference between horizontal and vertical scaling.");
  if (normalized.includes("docker") || normalized.includes("kubernetes")) questions.push("What is the difference between a Container and a Virtual Machine?");

  // Fallback if no specific tech found
  if (questions.length === 0) {
    questions.push("Describe the most challenging technical bug you have encountered and how you fixed it.");
    questions.push("Explain how you approach designing a scalable system architecture.");
    questions.push("What are your preferred practices for ensuring code quality and maintainability?");
  }

  // Return a subset (max 3)
  return questions.sort(() => 0.5 - Math.random()).slice(0, 3);
};

// --- Analysis Functions ---

export const analyzeResume = async (
  resumeInput: string | { mimeType: string; data: string }, 
  jdInput: string | { mimeType: string; data: string }
): Promise<ResumeAnalysis> => {
  
  const resumeText = await getTextFromInput(resumeInput);
  const jdText = await getTextFromInput(jdInput);

  const normalizedResume = normalizeText(resumeText);
  const normalizedJD = normalizeText(jdText);
  
  // 2. Identify Target Skills from JD
  // Simple heuristic: extract nouns/tech terms (using IMPLICIT_SKILLS keys and general known tech terms would be better, 
  // but here we just look for matches of words > 2 chars that appear in our implicit map OR are common tech terms)
  
  // Create a vocabulary of potential tech skills from our IMPLICIT_SKILLS database plus words in JD
  const potentialSkills = new Set([...Object.keys(IMPLICIT_SKILLS), ...Object.values(IMPLICIT_SKILLS).flat()]);
  const jdWords = extractKeywords(normalizedJD);
  
  const targetSkills = new Set<string>();
  jdWords.forEach(w => {
    if (potentialSkills.has(w) || w.length > 3) { // rudimentary filter
      targetSkills.add(w);
    }
  });

  // 3. Extract Candidate Skills (Contextual Expansion)
  const candidateWords = extractKeywords(normalizedResume);
  const expandedCandidateSkills = expandSkills(candidateWords);

  // 4. Calculate Match
  let matchCount = 0;
  let missing: string[] = [];
  
  // Filter target skills to only "relevant" ones for scoring (avoid generic words being weighted too high)
  // For this "human code" simulation, we intersect JD specific words with our known tech dictionary for accuracy
  const strictTargetSkills = new Set([...targetSkills].filter(s => potentialSkills.has(s)));
  
  // If no strict skills found, fallback to all extracted words
  const skillsToEvaluate = strictTargetSkills.size > 0 ? strictTargetSkills : targetSkills;

  skillsToEvaluate.forEach(skill => {
    if (expandedCandidateSkills.has(skill)) {
      matchCount++;
    } else {
      // Check if text contains the skill (phrase match)
      if (normalizedResume.includes(skill)) {
        matchCount++;
      } else {
        if (potentialSkills.has(skill)) missing.push(skill);
      }
    }
  });

  const totalSkills = skillsToEvaluate.size || 1;
  const matchPercentage = Math.min(100, Math.round((matchCount / totalSkills) * 100));

  // 5. Internship & Project Analysis
  const hasInternship = normalizedResume.includes("intern") || normalizedResume.includes("internship");
  const hasProjects = normalizedResume.includes("project") || normalizedResume.includes("portfolio");
  const internshipScore = hasInternship ? 90 : 40;
  const projectScore = hasProjects ? 85 : 50;

  // 6. Consistency
  const hasDates = /\d{4}/.test(resumeText);
  const consistencyScore = hasDates ? 95 : 60;

  // 7. Overall Score Calculation
  // Weighted: 50% Skills, 20% Internship, 20% Projects, 10% Consistency
  const overallScore = Math.round(
    (matchPercentage * 0.5) + 
    (internshipScore * 0.2) + 
    (projectScore * 0.2) + 
    (consistencyScore * 0.1)
  );

  return {
    tech_stack_match_percentage: matchPercentage,
    missing_critical_skills: missing.slice(0, 5), // Top 5 missing
    internship_relevance_score: internshipScore,
    project_complexity_score: projectScore,
    experience_consistency_score: consistencyScore,
    skill_authenticity_risk: Math.max(0, 100 - consistencyScore - 10), // Heuristic
    overall_resume_score: overallScore,
    improvement_suggestions: [
      missing.length > 0 ? `Consider adding keywords: ${missing.slice(0, 3).join(', ')}` : "Good skill match.",
      !hasInternship ? "Internship experience is highly valued." : "Highlight specific achievements in internships.",
      !hasProjects ? "Add a dedicated Projects section." : "Quantify project results."
    ]
  };
};

export const analyzeBehavioral = async (qaText: string): Promise<BehavioralAnalysis> => {
  const normalized = normalizeText(qaText);
  
  // Heuristics for soft skills
  const strongWords = ["led", "managed", "resolved", "created", "improved", "team", "communication", "collaborated"];
  const starMethod = ["situation", "task", "action", "result", "first", "then", "finally", "outcome"];
  
  let strongCount = 0;
  strongWords.forEach(w => { if (normalized.includes(w)) strongCount++; });
  
  let starCount = 0;
  starMethod.forEach(w => { if (normalized.includes(w)) starCount++; });

  const textLength = normalized.length;
  
  // Scoring
  const commScore = Math.min(100, 50 + (strongCount * 5));
  const structScore = Math.min(100, 40 + (starCount * 8));
  const ownerScore = normalized.includes("i ") || normalized.includes("my ") ? 85 : 60;
  const eqScore = normalized.includes("team") || normalized.includes("listen") ? 90 : 50;
  
  const overall = Math.round((commScore + structScore + ownerScore + eqScore) / 4);

  return {
    communication_score: commScore,
    structured_thinking_score: structScore,
    problem_ownership_score: ownerScore,
    emotional_intelligence_score: eqScore,
    authenticity_score: textLength > 200 ? 90 : 60,
    overall_soft_skill_score: overall,
    behavioral_risk_flag: overall < 60 ? "High" : overall < 80 ? "Medium" : "Low",
    improvement_feedback: [
      starCount < 2 ? "Use the STAR method (Situation, Task, Action, Result) to structure answers." : "Good structured responses.",
      textLength < 100 ? "Elaborate more on your experiences." : "Good depth of response.",
      strongCount < 2 ? "Use more active verbs (e.g., Led, Created, Solved)." : "Strong use of action verbs."
    ]
  };
};

export const analyzeTechnical = async (qaText: string): Promise<TechnicalAnalysis> => {
  const normalized = normalizeText(qaText);
  
  // Heuristics for technical depth
  const technicalTerms = ["function", "class", "api", "database", "query", "loop", "array", "object", "component", "interface", "algorithm", "complexity", "big o"];
  
  let techTermCount = 0;
  technicalTerms.forEach(w => { if (normalized.includes(w)) techTermCount++; });

  const hasCodeBlock = qaText.includes("{") && qaText.includes("}") && (qaText.includes("const") || qaText.includes("function") || qaText.includes("var") || qaText.includes("import"));

  // Stricter scoring: Start lower, require actual content to hit the 35 mark.
  // Previous: 40 + ...
  // New: Start at 10 or 20 base.
  
  const depthScore = Math.min(100, 10 + (techTermCount * 10)); // Needs ~3 terms to hit 40
  const practicalScore = hasCodeBlock ? 95 : 20; // Big penalty for no code
  const accuracyScore = Math.min(100, 20 + (techTermCount * 8)); // Approximation
  
  const overall = Math.round((depthScore + practicalScore + accuracyScore) / 3);

  return {
    conceptual_accuracy_score: accuracyScore,
    depth_of_understanding_score: depthScore,
    logical_clarity_score: hasCodeBlock ? 90 : 50,
    practical_application_score: practicalScore,
    error_detection_score: 80, // Default assumption for demo
    overall_technical_score: overall,
    technical_level_estimate: overall > 60 ? "Advanced" : overall > 35 ? "Intermediate" : "Beginner",
    technical_gaps: techTermCount < 3 ? ["Limited use of technical terminology", "Lack of code examples"] : []
  };
};