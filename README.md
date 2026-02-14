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
 1.Install "Live Server" extension

 2.Right-click index.html → "Open with Live Server"

### Option 2: Python HTTP Server
```bash
python -m http.server 8000
# Open http://localhost:8000
npx serve .
Usage
Upload Resume & JD → Get instant Tech Stack Match score

70%+ Pass → Proceed to AI Interview

Voice Interview → Answer behavioral + technical questions

View Scorecard → Get detailed analysis & eligibility verdict

Note: Allow microphone access when prompted.
## Project Structure

📁 TalentScout AI/
│
├── 📄 index.html                 # Entry point (Import maps)
├── 📄 index.tsx                  # React mounter
├── 📄 App.tsx                    # Main app logic & state
├── 📄 types.ts                   # TypeScript interfaces
│
📁 services/
│   └── 📄 geminiService.ts       # AI logic & scoring algorithms
│
📁 components/
    └── 📄 AnalysisResult.tsx     # Scorecard UI component


##Configuration

index.html (Import Map):
{
  "imports": {
    "react": "https://esm.sh/react@19",
    "react-dom": "https://esm.sh/react-dom@19"
  }
}

Tailwind CDN (index.html):
<script src="https://cdn.tailwindcss.com"></script>
Development
Contribution Areas
Namdev Jangam: geminiService.ts (AI Logic & Parsing)
Abhishek Manda: App.tsx (State, Timer, Flow)
Madhu Ch: AnalysisResult.tsx (UI/Animations)
Setup for Contributors
Fork the repository

Use VS Code Live Server

Edit TypeScript files directly

Browser auto-reloads changes

AI Simulation Logic
Resume: Set theory intersection of skills

Behavioral: STAR keyword detection

Technical: Terminology density scoring
Setup for Contributors
Fork the repository

Use VS Code Live Server

Edit TypeScript files directly

Browser auto-reloads changes

AI Simulation Logic
Resume: Set theory intersection of skills

Behavioral: STAR keyword detection

Technical: Terminology density scoring
<table> <tr> <td align="center"> <strong>Namdev Jangam</strong><br/> AI Logic & Parsing </td> <td align="center"> <strong>Abhishek Manda</strong><br/> App Flow & State </td> <td align="center"> <strong>Madhu Ch</strong><br/> UI Design & Animations </td> </tr> </table>

## 📄 License

MIT License. Free to use for educational and hackathon purposes.
























































