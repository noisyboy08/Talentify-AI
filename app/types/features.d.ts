// Extended type definitions for all new features

// AI Auto-Rewrite
export interface RewriteRequest {
  section: 'summary' | 'experience' | 'projects' | 'skills';
  content: string;
  role?: string; // For role-based tailoring
}

export interface RewriteResponse {
  original: string;
  rewritten: string;
  improvement: number; // Percentage improvement
  actionVerbs: string[];
  metrics: string[];
  explanation: string;
}

// Resume Version Control
export interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  createdAt: string;
  resumePath: string;
  score: {
    overall: number;
    ats: number;
    skills: number;
    grammar: number;
    formatting: number;
    impact: number;
    consistency: number;
  };
  feedback: Feedback;
  changes?: VersionDiff[];
}

export interface VersionDiff {
  section: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: string;
  newValue?: string;
  impact: 'positive' | 'negative' | 'neutral';
  scoreChange: number;
}

// Portfolio Generator
export interface PortfolioData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  skills: string[];
  experience: PortfolioExperience[];
  projects: PortfolioProject[];
  education?: PortfolioEducation[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface PortfolioExperience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string[];
  achievements?: string[];
}

export interface PortfolioProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  highlights: string[];
}

export interface PortfolioEducation {
  institution: string;
  degree: string;
  field?: string;
  year: string;
  gpa?: string;
}

// Interview Assistant
export interface InterviewQuestion {
  id: string;
  type: 'hr' | 'technical' | 'behavioral';
  question: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  suggestedAnswer?: string;
  tips?: string[];
}

export interface WeakPoint {
  area: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  relatedQuestions: string[];
}

export interface MockInterviewSession {
  id: string;
  resumeId: string;
  type: 'hr' | 'technical' | 'mixed';
  questions: InterviewQuestion[];
  answers: { questionId: string; answer: string; timestamp: string }[];
  feedback?: string;
  score?: number;
  createdAt: string;
}

// Role-Based Tailoring
export type RoleType = 
  | 'software-engineer'
  | 'product-manager'
  | 'data-scientist'
  | 'cybersecurity'
  | 'marketing'
  | 'designer'
  | 'sales'
  | 'consultant';

export interface RoleTemplate {
  role: RoleType;
  name: string;
  keywords: string[];
  sections: string[];
  format: 'chronological' | 'functional' | 'hybrid';
  tips: string[];
}

// AI Project Enhancer
export interface ProjectEnhancement {
  original: string;
  enhanced: string;
  improvements: {
    type: 'metrics' | 'impact' | 'technical-depth' | 'keywords';
    description: string;
    added: string;
  }[];
  metrics: string[];
  impact: string;
  keywords: string[];
}

// Multi-Language Support
export type Language = 'en' | 'hi' | 'fr' | 'de' | 'es';

export interface TranslatedResume {
  language: Language;
  sections: {
    summary: string;
    experience: string[];
    skills: string[];
    education?: string;
  };
  optimized: boolean;
}

// LinkedIn Profile Analysis
export interface LinkedInAnalysis {
  profileUrl: string;
  completeness: number;
  headline: {
    current: string;
    improved?: string;
    score: number;
    suggestions: string[];
  };
  about: {
    current: string;
    improved?: string;
    score: number;
    suggestions: string[];
  };
  experience: {
    score: number;
    suggestions: string[];
  };
  skills: {
    score: number;
    missing: string[];
    suggestions: string[];
  };
  recommendations: string[];
}

// Career Path Predictor
export interface CareerPath {
  currentRole: string;
  currentSkills: string[];
  suggestedPaths: SuggestedPath[];
  skillGaps: SkillGap[];
  courses: Course[];
  projects: Project[];
}

export interface SuggestedPath {
  role: string;
  match: number;
  timeline: string;
  requiredSkills: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  steps: CareerStep[];
}

export interface CareerStep {
  step: number;
  action: string;
  timeline: string;
  resources: string[];
}

export interface SkillGap {
  skill: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  currentLevel: number;
  targetLevel: number;
  resources: string[];
}

export interface Course {
  name: string;
  platform: string;
  duration: string;
  level: string;
  link: string;
  skills: string[];
}

export interface Project {
  name: string;
  description: string;
  skills: string[];
  difficulty: string;
  timeline: string;
}

// Salary Benchmark
export interface SalaryBenchmark {
  role: string;
  location: string;
  experience: number;
  skills: string[];
  benchmark: {
    min: number;
    median: number;
    max: number;
    percentile25: number;
    percentile75: number;
    currency: string;
  };
  factors: {
    skill: string;
    impact: number;
    description: string;
  }[];
  recommendations: string[];
}

// Recruiter Mode
export interface BulkResumeAnalysis {
  jobId: string;
  jobDescription: string;
  resumes: BulkResume[];
  summary: {
    total: number;
    qualified: number;
    averageScore: number;
    topCandidates: string[];
  };
}

export interface BulkResume {
  id: string;
  candidateName: string;
  resumePath: string;
  score: number;
  match: number;
  strengths: string[];
  weaknesses: string[];
  status: 'qualified' | 'maybe' | 'rejected';
}

// Dashboard Widgets
export interface DashboardWidget {
  id: string;
  type: 'resume-health' | 'match-timeline' | 'missing-skills' | 'improvement-graph' | 'latest-submissions';
  title: string;
  data: any;
}

export interface ResumeHealth {
  overall: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  breakdown: {
    category: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export interface MatchTimeline {
  date: string;
  match: number;
  jobTitle: string;
}[]

export interface MissingSkills {
  skills: {
    skill: string;
    frequency: number;
    importance: number;
  }[];
}

export interface ImprovementGraph {
  date: string;
  score: number;
  version: number;
}[]

// PDF Highlighter
export interface PDFHighlight {
  page: number;
  type: 'weak' | 'improvement' | 'good';
  text: string;
  suggestion?: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

