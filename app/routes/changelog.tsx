import { ScrollText, Sparkles, CheckCircle2, Rocket, Star } from "lucide-react";
import type { Route } from "./+types/changelog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talentify AI | Changelog" },
    { name: "description", content: "Latest updates and features" },
  ];
}

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'feature' | 'improvement' | 'fix';
  title: string;
  description: string;
  items: string[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "2.0.0",
    date: "2024-12-20",
    type: 'feature',
    title: "Major Feature Release",
    description: "Complete overhaul with advanced AI features",
    items: [
      "AI Auto-Rewrite for resume sections",
      "Resume Version Control with diff tracking",
      "Role-Based Resume Tailoring (8 roles)",
      "AI Project Enhancer with metrics",
      "AI Interview Assistant (HR + Technical)",
      "Portfolio Generator from resume",
      "Resume Health Dashboard Widget",
      "Activity tracking system",
      "Dark mode support",
      "Enhanced UI with glassmorphism",
    ],
  },
  {
    version: "1.5.0",
    date: "2024-12-15",
    type: 'feature',
    title: "Multi-Dimensional Scoring",
    description: "Advanced scoring system with 6 dimensions",
    items: [
      "ATS Compatibility Score",
      "Skills Match Score",
      "Grammar & Clarity Score",
      "Formatting Score",
      "Impact Score",
      "Consistency Score",
      "Radial chart visualizations",
      "Detailed feedback per category",
    ],
  },
  {
    version: "1.4.0",
    date: "2024-12-10",
    type: 'feature',
    title: "Job Description Analyzer",
    description: "Compare resume with job descriptions",
    items: [
      "Skill extraction from job descriptions",
      "Match percentage calculation",
      "Missing keywords identification",
      "Optimized bullet point suggestions",
      "Keyword comparison tool",
    ],
  },
  {
    version: "1.3.0",
    date: "2024-12-05",
    type: 'feature',
    title: "Red Flag Detection",
    description: "Automated issue detection",
    items: [
      "Length problem detection",
      "Missing dates detection",
      "Missing achievements detection",
      "Irrelevant skills detection",
      "Formatting issue detection",
      "Severity categorization",
    ],
  },
  {
    version: "1.2.0",
    date: "2024-11-28",
    type: 'improvement',
    title: "UI Enhancements",
    description: "Better user experience",
    items: [
      "3D card effects",
      "Smooth animations",
      "Responsive design improvements",
      "Better mobile support",
      "Enhanced dashboard",
    ],
  },
  {
    version: "1.1.0",
    date: "2024-11-20",
    type: 'feature',
    title: "Dashboard & Analytics",
    description: "Comprehensive dashboard",
    items: [
      "Resume statistics",
      "Score distribution",
      "Recent resumes",
      "Trend analysis",
    ],
  },
  {
    version: "1.0.0",
    date: "2024-11-15",
    type: 'feature',
    title: "Initial Release",
    description: "Core resume analysis features",
    items: [
      "Resume upload and analysis",
      "ATS scoring",
      "Feedback system",
      "Resume management",
      "Export functionality",
    ],
  },
];

export default function ChangelogPage() {
  const getTypeIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-5 h-5" />;
      case 'improvement':
        return <Rocket className="w-5 h-5" />;
      case 'fix':
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'improvement':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'fix':
        return 'bg-green-100 text-green-600 border-green-200';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ScrollText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Changelog</h1>
          </div>
          <p className="text-gray-600">Latest updates, features, and improvements</p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-6">
          {changelog.map((entry, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getTypeColor(entry.type)}`}>
                      {getTypeIcon(entry.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-gray-900">{entry.version}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-sm font-medium">Latest</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{entry.title}</h3>
                <p className="text-gray-600">{entry.description}</p>
              </div>
              <div className="p-6 bg-gray-50">
                <ul className="space-y-2">
                  {entry.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 text-center">
          <p className="text-gray-700 mb-2">
            <strong>Have feedback or suggestions?</strong>
          </p>
          <p className="text-sm text-gray-600">
            We're constantly improving Talentify AI. Your feedback helps us build better features.
          </p>
        </div>
      </div>
    </main>
  );
}

