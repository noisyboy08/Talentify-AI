import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { MessageSquare, Loader2, AlertCircle, CheckCircle2, Brain } from "lucide-react";
import type { InterviewQuestion, WeakPoint, MockInterviewSession } from "~/types/features";

interface InterviewAssistantProps {
  resumeId: string;
  resumePath: string;
}

export function InterviewAssistant({ resumeId, resumePath }: InterviewAssistantProps) {
  const { ai } = usePuterStore();
  const [interviewType, setInterviewType] = useState<'hr' | 'technical' | 'mixed'>('mixed');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [session, setSession] = useState<MockInterviewSession | null>(null);

  const generateQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    setWeakPoints([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');

    try {
      const prompt = `Based on the resume at ${resumePath}, generate interview questions and identify weak points.

Generate:
1. ${interviewType === 'hr' ? '10 HR/behavioral' : interviewType === 'technical' ? '10 technical' : '5 HR and 5 technical'} interview questions
2. Identify 3-5 weak points in the resume that might be questioned

Return JSON:
{
  "questions": [
    {
      "id": "q1",
      "type": "${interviewType === 'hr' ? 'hr' : interviewType === 'technical' ? 'technical' : 'hr'}",
      "question": "question text",
      "category": "category",
      "difficulty": "medium",
      "suggestedAnswer": "suggested answer",
      "tips": ["tip1", "tip2"]
    }
  ],
  "weakPoints": [
    {
      "area": "area name",
      "severity": "medium",
      "description": "description",
      "suggestion": "suggestion",
      "relatedQuestions": ["question1", "question2"]
    }
  ]
}`;

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
        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
        const weakPoints = Array.isArray(parsed.weakPoints) ? parsed.weakPoints : [];
        
        setQuestions(questions);
        setWeakPoints(weakPoints);
        
        // Create session
        setSession({
          id: `session-${Date.now()}`,
          resumeId,
          type: interviewType,
          questions: questions,
          answers: [],
          createdAt: new Date().toISOString(),
        });
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('Question generation error:', error);
      alert(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!session || !userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const updatedAnswers = [
      ...session.answers,
      {
        questionId: currentQuestion.id,
        answer: userAnswer,
        timestamp: new Date().toISOString(),
      },
    ];

    setSession({
      ...session,
      answers: updatedAnswers,
    });

    setUserAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Interview Assistant</h2>
      </div>

      <div className="space-y-6">
        {/* Interview Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Interview Type
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(['hr', 'technical', 'mixed'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setInterviewType(type);
                  setQuestions([]);
                  setSession(null);
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation active:scale-95 ${
                  interviewType === type
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm text-gray-900 capitalize">{type}</div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {type === 'hr' ? 'Behavioral questions' : 
                   type === 'technical' ? 'Technical questions' : 
                   'Mixed questions'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {questions.length === 0 && (
          <button
            onClick={generateQuestions}
            disabled={loading}
            className="w-full primary-gradient text-white py-3 sm:py-4 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg touch-manipulation active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Generate Interview Questions
              </>
            )}
          </button>
        )}

        {/* Weak Points */}
        {weakPoints.length > 0 && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Potential Weak Points</h3>
            </div>
            <div className="space-y-3">
              {weakPoints.map((point, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      point.severity === 'high' ? 'bg-red-100 text-red-700' :
                      point.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {point.severity}
                    </span>
                    <span className="font-medium text-gray-900">{point.area}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{point.description}</div>
                  <div className="text-sm text-gray-600">
                    <strong>Suggestion:</strong> {point.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions & Mock Interview */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <div className="text-sm text-gray-500">
                {session?.answers.length || 0} answered
              </div>
            </div>

            {currentQuestion && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentQuestion.type === 'hr' ? 'bg-purple-100 text-purple-700' :
                    currentQuestion.type === 'technical' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {currentQuestion.type}
                  </span>
                  <span className="text-sm text-gray-600">{currentQuestion.category}</span>
                  {currentQuestion.difficulty && (
                    <span className="text-xs text-gray-500">
                      ({currentQuestion.difficulty})
                    </span>
                  )}
                </div>

                <div className="text-lg font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </div>

                {/* Answer Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Suggested Answer (Collapsible) */}
                {currentQuestion.suggestedAnswer && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                      View Suggested Answer
                    </summary>
                    <div className="mt-2 p-4 bg-white rounded-lg border border-blue-200 text-sm text-gray-700">
                      {currentQuestion.suggestedAnswer}
                    </div>
                  </details>
                )}

                {/* Tips */}
                {currentQuestion.tips && currentQuestion.tips.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Tips:</div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {currentQuestion.tips?.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(currentQuestionIndex - 1);
                        setUserAnswer('');
                      }
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 touch-manipulation text-sm sm:text-base"
                  >
                    Previous
                  </button>
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:bg-blue-800 flex items-center gap-2 touch-manipulation text-sm sm:text-base"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Complete Interview
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

