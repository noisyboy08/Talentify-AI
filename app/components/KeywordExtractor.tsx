import { useState, useEffect } from "react";

interface KeywordExtractorProps {
  jobDescription: string;
  resumeText?: string;
}

const KeywordExtractor = ({ jobDescription, resumeText }: KeywordExtractorProps) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (!jobDescription) return;

    // Extract keywords from job description (simple extraction)
    const extractKeywords = (text: string): string[] => {
      // Remove common words and extract meaningful terms
      const commonWords = new Set([
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
        "been", "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "should", "could", "may", "might", "must", "can", "this",
        "that", "these", "those", "we", "you", "they", "he", "she", "it",
      ]);

      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !commonWords.has(word));

      // Count frequency and get unique keywords
      const wordCount: Record<string, number> = {};
      words.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word]) => word);
    };

    const extracted = extractKeywords(jobDescription);
    setKeywords(extracted);

    if (resumeText) {
      const resumeLower = resumeText.toLowerCase();
      const matched = extracted.filter((keyword) =>
        resumeLower.includes(keyword)
      );
      const missing = extracted.filter((keyword) => !resumeLower.includes(keyword));

      setMatchedKeywords(matched);
      setMissingKeywords(missing);
    } else {
      setMatchedKeywords([]);
      setMissingKeywords(extracted);
    }
  }, [jobDescription, resumeText]);

  const matchPercentage =
    keywords.length > 0 ? (matchedKeywords.length / keywords.length) * 100 : 0;

  return (
    <div className="card-3d bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Keyword Analysis</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Keyword Match</span>
          <span className="text-2xl font-bold text-blue-600">
            {matchPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${matchPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {matchedKeywords.length} of {keywords.length} keywords found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-green-600 mb-2">
            ✓ Matched Keywords ({matchedKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No matches found</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-red-600 mb-2">
            ✗ Missing Keywords ({missingKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">All keywords found!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordExtractor;

