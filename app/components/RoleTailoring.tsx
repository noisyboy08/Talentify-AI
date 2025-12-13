import { useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Target, Loader2, CheckCircle2 } from "lucide-react";
import type { RoleType, RoleTemplate } from "~/types/features";

interface RoleTailoringProps {
  resumeId: string;
  resumePath: string;
}

const ROLE_TEMPLATES: Record<RoleType, RoleTemplate> = {
  'software-engineer': {
    role: 'software-engineer',
    name: 'Software Engineer',
    keywords: ['algorithms', 'data structures', 'system design', 'API', 'microservices', 'cloud', 'CI/CD', 'testing', 'code review'],
    sections: ['Technical Skills', 'Projects', 'Experience', 'Education'],
    format: 'chronological',
    tips: ['Highlight technical projects', 'Include GitHub links', 'Quantify impact with metrics', 'Show problem-solving skills'],
  },
  'product-manager': {
    role: 'product-manager',
    name: 'Product Manager',
    keywords: ['product strategy', 'roadmap', 'stakeholder management', 'user research', 'metrics', 'agile', 'scrum', 'prioritization'],
    sections: ['Summary', 'Experience', 'Skills', 'Education'],
    format: 'hybrid',
    tips: ['Focus on business impact', 'Show cross-functional collaboration', 'Include product metrics', 'Highlight user-centric approach'],
  },
  'data-scientist': {
    role: 'data-scientist',
    name: 'Data Scientist',
    keywords: ['machine learning', 'statistics', 'python', 'SQL', 'data visualization', 'modeling', 'A/B testing', 'feature engineering'],
    sections: ['Technical Skills', 'Projects', 'Experience', 'Education'],
    format: 'functional',
    tips: ['Showcase ML projects', 'Include model performance metrics', 'Highlight statistical analysis', 'Demonstrate data storytelling'],
  },
  'cybersecurity': {
    role: 'cybersecurity',
    name: 'Cybersecurity Specialist',
    keywords: ['penetration testing', 'vulnerability assessment', 'SIEM', 'threat analysis', 'compliance', 'firewall', 'encryption', 'incident response'],
    sections: ['Certifications', 'Experience', 'Technical Skills', 'Education'],
    format: 'chronological',
    tips: ['Highlight certifications', 'Show security projects', 'Include compliance experience', 'Demonstrate threat detection skills'],
  },
  'marketing': {
    role: 'marketing',
    name: 'Marketing Professional',
    keywords: ['digital marketing', 'SEO', 'content strategy', 'analytics', 'campaign management', 'social media', 'branding', 'ROI'],
    sections: ['Summary', 'Experience', 'Skills', 'Education'],
    format: 'hybrid',
    tips: ['Show campaign results', 'Include metrics and ROI', 'Highlight creative projects', 'Demonstrate analytical skills'],
  },
  'designer': {
    role: 'designer',
    name: 'Designer',
    keywords: ['UI/UX', 'user research', 'prototyping', 'design systems', 'Figma', 'Adobe Creative Suite', 'wireframing', 'usability testing'],
    sections: ['Portfolio', 'Experience', 'Skills', 'Education'],
    format: 'functional',
    tips: ['Include portfolio links', 'Show design process', 'Highlight user-centered design', 'Demonstrate visual skills'],
  },
  'sales': {
    role: 'sales',
    name: 'Sales Professional',
    keywords: ['revenue', 'quota', 'CRM', 'client relations', 'negotiation', 'pipeline', 'closing', 'territory management'],
    sections: ['Summary', 'Experience', 'Achievements', 'Skills'],
    format: 'chronological',
    tips: ['Quantify sales achievements', 'Show revenue growth', 'Highlight client relationships', 'Demonstrate closing skills'],
  },
  'consultant': {
    role: 'consultant',
    name: 'Consultant',
    keywords: ['strategy', 'analysis', 'client engagement', 'problem-solving', 'stakeholder management', 'project management', 'recommendations', 'implementation'],
    sections: ['Summary', 'Experience', 'Skills', 'Education'],
    format: 'hybrid',
    tips: ['Showcase problem-solving', 'Include client impact', 'Highlight analytical skills', 'Demonstrate communication abilities'],
  },
};

export function RoleTailoring({ resumeId, resumePath }: RoleTailoringProps) {
  const { ai } = usePuterStore();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [loading, setLoading] = useState(false);
  const [tailoredContent, setTailoredContent] = useState<string | null>(null);

  const handleTailor = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    setLoading(true);
    setTailoredContent(null);

    try {
      const template = ROLE_TEMPLATES[selectedRole];
      const prompt = `You are an expert resume writer specializing in ${template.name} roles.

Rewrite the following resume to optimize it for a ${template.name} position.

Key requirements:
- Use these keywords naturally: ${template.keywords.join(', ')}
- Follow ${template.format} format
- Focus on: ${template.tips.join(', ')}
- Make it ATS-friendly
- Quantify achievements where possible

Resume content will be provided from the file at path: ${resumePath}

Return a complete, tailored resume optimized for ${template.name} roles. Format it clearly with sections.`;

      const response = await ai.feedback(resumePath, prompt);
      
      if (!response || !response.message) {
        throw new Error('No response from AI');
      }

      const content = typeof response.message.content === 'string'
        ? response.message.content
        : response.message.content[0]?.text || '';

      if (!content) {
        throw new Error('Empty response from AI');
      }

      setTailoredContent(content);
    } catch (error) {
      console.error('Tailoring error:', error);
      alert(`Failed to tailor resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Role-Based Tailoring</h2>
      </div>

      <div className="space-y-6">
        <p className="text-gray-600">
          Select a role to automatically tailor your resume with industry-specific keywords, format, and best practices.
        </p>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Target Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {Object.values(ROLE_TEMPLATES).map((template) => (
              <button
                key={template.role}
                onClick={() => {
                  setSelectedRole(template.role);
                  setTailoredContent(null);
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left touch-manipulation active:scale-95 ${
                  selectedRole === template.role
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-sm sm:text-base text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {template.format} format
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Role Details */}
        {selectedRole && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              {ROLE_TEMPLATES[selectedRole].name} Optimization
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Key Keywords:</div>
                <div className="flex flex-wrap gap-2">
                  {ROLE_TEMPLATES[selectedRole].keywords.slice(0, 6).map((keyword: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Tips:</div>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {ROLE_TEMPLATES[selectedRole].tips.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tailor Button */}
        {selectedRole && (
          <button
            onClick={handleTailor}
            disabled={loading}
            className="w-full primary-gradient text-white py-3 sm:py-4 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg touch-manipulation active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Tailoring Resume...
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                Tailor Resume for {ROLE_TEMPLATES[selectedRole].name}
              </>
            )}
          </button>
        )}

        {/* Tailored Content */}
        {tailoredContent && (
          <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Tailored Resume</h3>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {tailoredContent}
              </pre>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(tailoredContent);
                  alert('Copied to clipboard!');
                } catch (err) {
                  const textArea = document.createElement('textarea');
                  textArea.value = tailoredContent;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Copied to clipboard!');
                }
              }}
              className="mt-4 w-full py-2 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Copy Tailored Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

