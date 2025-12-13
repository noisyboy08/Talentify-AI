import { useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Loader2, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import type { RewriteRequest, RewriteResponse } from "~/types/features";

interface AutoRewriteProps {
  resumeId: string;
  resumePath: string;
}

export function AutoRewrite({ resumeId, resumePath }: AutoRewriteProps) {
  const { ai } = usePuterStore();
  const [selectedSection, setSelectedSection] = useState<RewriteRequest['section']>('summary');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [role, setRole] = useState<string>('');

  const sections = [
    { value: 'summary' as const, label: 'Summary', icon: '📝' },
    { value: 'experience' as const, label: 'Experience', icon: '💼' },
    { value: 'projects' as const, label: 'Projects', icon: '🚀' },
    { value: 'skills' as const, label: 'Skills', icon: '⚡' },
  ];

  const handleRewrite = async () => {
    if (!content.trim()) {
      alert('Please enter content to rewrite');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const sectionLabel = selectedSection === 'summary' ? 'Summary:' : 
                          selectedSection === 'experience' ? 'Experience bullet point:' : 
                          selectedSection === 'projects' ? 'Project description:' : 
                          'Skills section:';
      
      const roleText = role ? `Target role: ${role}` : '';
      const userContent = content; // Store in a variable to avoid conflicts
      const contentEscaped = userContent.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      
      const prompt = `You are an expert resume writer. Rewrite the following ${selectedSection} section to make it more impactful, professional, and ATS-friendly.

${sectionLabel}

${userContent}

${roleText}

Requirements:
1. Use strong action verbs
2. Add quantifiable metrics where possible
3. Make it concise and impactful
4. Include relevant keywords
5. Maintain professional tone

Return a JSON object with this exact structure:
{
  "original": "${contentEscaped}",
  "rewritten": "the improved version",
  "improvement": 85,
  "actionVerbs": ["verb1", "verb2"],
  "metrics": ["metric1", "metric2"],
  "explanation": "brief explanation of improvements"
}`;

      const response = await ai.chat(prompt, undefined, false, { model: 'claude-sonnet-4' });
      
      if (!response || !response.message) {
        throw new Error('No response from AI');
      }

      const responseContent = typeof response.message.content === 'string'
        ? response.message.content
        : response.message.content[0]?.text || '';

      if (!responseContent) {
        throw new Error('Empty response from AI');
      }

      // Clean and extract JSON
      let cleanedText = responseContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      try {
        const parsed = JSON.parse(cleanedText);
        const validatedResult: RewriteResponse = {
          original: parsed.original || userContent,
          rewritten: parsed.rewritten || responseContent,
          improvement: parsed.improvement || 0,
          actionVerbs: Array.isArray(parsed.actionVerbs) ? parsed.actionVerbs : [],
          metrics: Array.isArray(parsed.metrics) ? parsed.metrics : [],
          explanation: parsed.explanation || 'Content rewritten successfully.',
        };
        setResult(validatedResult);
      } catch (parseError) {
        // Fallback: use the content as rewritten
        setResult({
          original: userContent,
          rewritten: responseContent,
          improvement: 0,
          actionVerbs: [],
          metrics: [],
          explanation: 'AI response received but could not parse structured data. Showing raw response.',
        });
      }
    } catch (error) {
      console.error('Rewrite error:', error);
      alert(`Failed to rewrite: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Auto-Rewrite</h2>
      </div>

      <div className="space-y-6">
        {/* Section Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Section to Rewrite
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {sections.map((section) => (
              <button
                key={section.value}
                onClick={() => {
                  setSelectedSection(section.value);
                  setResult(null);
                }}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-all touch-manipulation active:scale-95 ${
                  selectedSection === section.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1">{section.icon}</div>
                <div className="text-xs sm:text-sm font-medium">{section.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Role Selection (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Role (Optional)
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Software Engineer, Product Manager"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {selectedSection === 'summary' ? 'Summary' : 
             selectedSection === 'experience' ? 'Experience Bullet Point' :
             selectedSection === 'projects' ? 'Project Description' :
             'Skills Section'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              selectedSection === 'summary' 
                ? 'Enter your professional summary...'
                : selectedSection === 'experience'
                ? 'Enter an experience bullet point...'
                : selectedSection === 'projects'
                ? 'Enter project description...'
                : 'Enter skills section...'
            }
            rows={6}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base"
          />
        </div>

        {/* Rewrite Button */}
        <button
          onClick={handleRewrite}
          disabled={loading || !content.trim()}
          className="w-full primary-gradient text-white py-3 sm:py-4 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg touch-manipulation active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Rewrite with AI
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            {/* Improvement Score */}
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-lg font-semibold text-gray-900">
                Improvement: +{result.improvement}%
              </span>
            </div>

            {/* Original vs Rewritten */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Original</h3>
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-gray-600">
                  {result.original}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Rewritten</h3>
                <div className="p-4 bg-white rounded-lg border-2 border-green-200 text-gray-900">
                  {result.rewritten}
                </div>
              </div>
            </div>

            {/* Action Verbs */}
            {result.actionVerbs.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Action Verbs Used</h3>
                <div className="flex flex-wrap gap-2">
                  {result.actionVerbs.map((verb: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {result.metrics.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Quantifiable Metrics</h3>
                <div className="flex flex-wrap gap-2">
                  {result.metrics.map((metric: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            {result.explanation && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Improvements Made</h3>
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-gray-700">
                  {result.explanation}
                </div>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.rewritten);
                  alert('Copied to clipboard!');
                } catch (err) {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = result.rewritten;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Copied to clipboard!');
                }
              }}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Copy Rewritten Text
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

