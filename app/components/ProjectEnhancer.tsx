import { useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Rocket, Loader2, TrendingUp, CheckCircle2 } from "lucide-react";
import type { ProjectEnhancement } from "~/types/features";

interface ProjectEnhancerProps {
  resumeId?: string;
}

export function ProjectEnhancer({ resumeId }: ProjectEnhancerProps) {
  const { ai } = usePuterStore();
  const [projectDescription, setProjectDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancement, setEnhancement] = useState<ProjectEnhancement | null>(null);

  const handleEnhance = async () => {
    if (!projectDescription.trim()) {
      alert('Please enter a project description');
      return;
    }

    setLoading(true);
    setEnhancement(null);

    try {
      const prompt = `You are an expert at enhancing project descriptions for resumes.

Enhance the following project description to make it more impactful, technical, and recruiter-friendly.

Project Description:
${projectDescription}

${technologies ? `Technologies Used: ${technologies}` : ''}

Requirements:
1. Add quantifiable metrics and impact
2. Increase technical depth
3. Add relevant keywords recruiters look for
4. Highlight problem-solving and innovation
5. Show measurable outcomes
6. Make it concise but comprehensive

Return a JSON object with this exact structure:
{
  "original": "${projectDescription}",
  "enhanced": "the improved version",
  "improvements": [
    {
      "type": "metrics",
      "description": "what was added",
      "added": "specific addition"
    }
  ],
  "metrics": ["metric1", "metric2"],
  "impact": "overall impact description",
  "keywords": ["keyword1", "keyword2"]
}`;

      const response = await ai.chat(prompt, undefined, false, { model: 'claude-sonnet-4' });
      
      if (!response || !response.message) {
        throw new Error('No response from AI');
      }

      const content = typeof response.message.content === 'string'
        ? response.message.content
        : response.message.content[0]?.text || '';

      if (!content) {
        throw new Error('Empty response from AI');
      }

      // Clean and extract JSON
      let cleanedText = content
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
        const validatedEnhancement: ProjectEnhancement = {
          original: parsed.original || projectDescription,
          enhanced: parsed.enhanced || content,
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
          metrics: Array.isArray(parsed.metrics) ? parsed.metrics : [],
          impact: parsed.impact || 'Enhanced with AI',
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        };
        setEnhancement(validatedEnhancement);
      } catch (parseError) {
        // Fallback
        setEnhancement({
          original: projectDescription,
          enhanced: content,
          improvements: [],
          metrics: [],
          impact: 'Enhanced with AI',
          keywords: [],
        });
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      alert(`Failed to enhance project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Project Enhancer</h2>
      </div>

      <div className="space-y-6">
        <p className="text-gray-600">
          Enhance your project descriptions with technical depth, metrics, and impact statements.
        </p>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your project, what you built, technologies used, and your role..."
            rows={8}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm sm:text-base"
          />
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies Used (Optional)
          </label>
          <input
            type="text"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="e.g., React, Node.js, Python, AWS"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Enhance Button */}
        <button
          onClick={handleEnhance}
          disabled={loading || !projectDescription.trim()}
          className="w-full primary-gradient text-white py-3 sm:py-4 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg touch-manipulation active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Enhance Project
            </>
          )}
        </button>

        {/* Results */}
        {enhancement && (
          <div className="mt-6 space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            {/* Original vs Enhanced */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Original</h3>
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-gray-600 text-sm">
                  {enhancement.original}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Enhanced</h3>
                <div className="p-4 bg-white rounded-lg border-2 border-green-200 text-gray-900 text-sm">
                  {enhancement.enhanced}
                </div>
              </div>
            </div>

            {/* Improvements */}
            {enhancement.improvements.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Improvements Made
                </h3>
                <div className="space-y-2">
                  {enhancement.improvements.map((improvement: { type: string; description: string; added: string }, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          {improvement.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{improvement.description}</div>
                      {improvement.added && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          Added: {improvement.added}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {enhancement.metrics.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Quantifiable Metrics</h3>
                <div className="flex flex-wrap gap-2">
                  {enhancement.metrics.map((metric: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Impact */}
            {enhancement.impact && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Impact</h3>
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-gray-700">
                  {enhancement.impact}
                </div>
              </div>
            )}

            {/* Keywords */}
            {enhancement.keywords.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Keywords Added</h3>
                <div className="flex flex-wrap gap-2">
                  {enhancement.keywords.map((keyword: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(enhancement.enhanced);
                  alert('Copied to clipboard!');
                } catch (err) {
                  const textArea = document.createElement('textarea');
                  textArea.value = enhancement.enhanced;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Copied to clipboard!');
                }
              }}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Copy Enhanced Description
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

