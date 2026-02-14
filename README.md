# 🧠 TalentScout AI

**TalentScout AI** is an intelligent, automated recruitment evaluation engine that streamlines hiring by guiding candidates from resume screening to real-time behavioral and technical interviews. Built with React 19, TypeScript, and Tailwind CSS.


---

## Overview
TalentScout AI acts as your AI-powered recruiter, automating the entire candidate evaluation process:

- **Smart Resume Screening** with 70%+ tech stack match requirement
- **Voice-based Interview Wizard** using Web Speech API
- **Deep Analytical Scoring** with visual scorecards
- **Zero external dependencies** - runs entirely in-browser

---

## What We Attempted to Solve
We designed a two-stage pre-defined pre-interview screening system.

Stage 1 — Resume & JD Alignment
In Stage 1, the system analyzes the candidate’s resume against the job description .

Instead of simple keyword matching, we evaluate:

Technical alignment
Skill coverage
Missing skills
Risk score
Overall readiness score
Only candidates meeting a defined threshold move to Stage 2.

This ensures:

Automated filtering
Structured scoring
Reduced bias
Better job-description alignment

## Stage 2 — audio Interaction
In Stage 2, we simulate a structured audio interaction.

Candidates answer pre-defined technical questions in real time. Their responses are converted from speech to text and evaluated for:

Communication clarity
Technical articulation
Depth of understanding
Structured thinking
Only candidates who pass this stage proceed to a formal interview.

--

## Key Features

### 📄 Smart Resume Screening
- PDF parsing using `pdfjs-dist`
- Tech Stack Match percentage calculation
- Authenticity risk detection
- 70%+ pass threshold for interviews

### 🎙️ AI Interview Wizard
- Real-time voice-to-text with Web Speech API
- Dynamic JD-based technical questions
- 60-second timer per question
- Behavioral (STAR method) + Technical tracks

### 📊 Deep Analytical Scoring
- Color-coded performance dashboards
- Actionable feedback suggestions
- Automatic eligibility determination

---

## Tech Stack
Frontend: React 19 (ES Modules)
Language: TypeScript
Styling: Tailwind CSS
Icons: Lucide React
PDF Processing: PDF.js
Audio: Web Speech API
Build: Importmap (esm.sh)

---

## Prerequisites

- **Browser**: Chrome, Edge, or Safari (Web Speech API required)
- **Permissions**: Microphone access for interview phase
- **Development**: VS Code with Live Server extension (recommended)

---

## Installation
No `npm install` required! This project uses CDN-based ES modules.

1. Clone or download the repository
2. Open the project folder
3. Serve the files (see Running section)

---

## Running the Application

### Option 1: VS Code Live Server (Recommended)
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Option 2: Python HTTP Server
python -m http.server 8000
### Open http://localhost:8000

Option 3: Node.js
npx serve .
Usage
1. Upload Resume & JD → Get instant Tech Stack Match score
2. 70%+ Pass → Proceed to AI Interview
3. Voice Interview → Answer behavioral + technical questions
4. View Scorecard → Get detailed analysis & eligibility verdict
Note: Allow microphone access when prompted.
---
## Project Structure
```
TalentScout AI/
├── index.html          (Entry point)
├── index.tsx           (React mounter)  
├── App.tsx             (Main logic)
├── types.ts            (Interfaces)
├── services/
│   └── geminiService.ts (AI logic)
└── components/
    └── AnalysisResult.tsx (UI)
```
## Configuration
```
{
  "imports": {
    "react": "https://esm.sh/react@19",
    "react-dom": "https://esm.sh/react-dom@19"
  }
}

```

Tailwind CDN (index.html):
```
<script src="https://cdn.tailwindcss.com"></script>
```
## Development

Namdev Jangam: geminiService.ts (AI Logic & Parsing)
Abhishek Manda: App.tsx (State, Timer, Flow)
Madhu Ch: AnalysisResult.tsx (UI/Animations)

Setup for Contributors
1. Fork the repository
2. Use VS Code Live Server
3. Edit TypeScript files directly
4. Browser auto-reloads changes
AI Simulation Logic
1. Resume: Set theory intersection of skills
2. Behavioral: STAR keyword detection
3. Technical: Terminology density scoring
## Contributors
<table> <tr> <td align="center"> <strong>Namdev Jangam</strong><br/> AI Logic & Parsing </td> <td align="center"> <strong>Abhishek Manda</strong><br/> App Flow & State </td> <td align="center"> <strong>Madhu Ch</strong><br/> UI Design & Animations </td> </tr> </table>

## 📄License
MIT License - Free for educational and hackathon use.









































