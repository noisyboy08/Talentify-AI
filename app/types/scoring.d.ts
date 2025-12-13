// Multi-dimensional scoring types
export interface MultiDimensionalScore {
  atsCompatibility: ScoreDetail;
  skillsMatch: ScoreDetail;
  grammarClarity: ScoreDetail;
  formatting: ScoreDetail;
  impact: ScoreDetail;
  consistency: ScoreDetail;
  overall: number;
}

export interface ScoreDetail {
  score: number;
  maxScore: number;
  feedback: string[];
  tips: ImprovementTip[];
  strengths: string[];
  weaknesses: string[];
}

export interface ImprovementTip {
  type: 'critical' | 'important' | 'suggestion';
  title: string;
  description: string;
  example?: string;
}

export interface JobDescriptionAnalysis {
  requiredSkills: string[];
  optionalSkills: string[];
  missingKeywords: string[];
  matchPercentage: number;
  suggestedBullets: SuggestedBullet[];
  extractedRequirements: string[];
}

export interface SuggestedBullet {
  original: string;
  improved: string;
  reason: string;
  metrics?: string;
}

export interface RedFlag {
  type: 'critical' | 'warning' | 'info';
  category: 'length' | 'dates' | 'achievements' | 'skills' | 'formatting' | 'content';
  title: string;
  description: string;
  suggestion: string;
  icon: string;
}

export interface ResumeVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  scores: MultiDimensionalScore;
  changes: VersionChange[];
  feedback: string;
  resumePath: string;
}

export interface VersionChange {
  section: string;
  before: string;
  after: string;
  impact: 'positive' | 'negative' | 'neutral';
  scoreChange: number;
}

export interface StyleProfile {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  preferredFormat: string;
  tips: string[];
}

