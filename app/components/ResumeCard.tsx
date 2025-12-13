import { useEffect, useState } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import ScoreCircle from "./ScoreCircle";

const ResumeCard = ({ resume }: { resume: Resume }) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadResume = async () => {
      try {
        setLoading(true);
        const blob = await fs.read(resume.imagePath);
        if (!blob) {
          setLoading(false);
          return;
        }
        let url = URL.createObjectURL(blob);
        setResumeUrl(url);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (resume.imagePath) {
      loadResume();
    } else {
      setLoading(false);
    }
    setScore(resume.feedback?.overallScore || 0);
  }, [resume.imagePath, fs]);
  return (
    <Link
      to={`/resume/${resume.id}`}
      className="resume-card animate-in fade-in duration-1000 card-3d glow-3d"
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {resume.companyName && (
            <h2 className="!text-black font-bold break-words">
              {resume.companyName}
            </h2>
          )}
          {resume.jobTitle && (
            <h3 className="text-lg break-words text-gray-500">
              {resume.jobTitle}
            </h3>
          )}
          {!resume.companyName && !resume.jobTitle && (
            <h2 className="!text-black font-bold">Resume</h2>
          )}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={score} />
        </div>
      </div>
      {loading ? (
        <div className="gradient-border animate-pulse">
          <div className="w-full h-[350px] max-sm:h-[200px] bg-gray-200 flex items-center justify-center">
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      ) : resumeUrl ? (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={resumeUrl}
              alt="resume"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        </div>
      ) : (
        <div className="gradient-border">
          <div className="w-full h-[350px] max-sm:h-[200px] bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">Image not available</p>
          </div>
        </div>
      )}
      {resume.createdAt && (
        <p className="text-xs text-gray-500 text-center">
          Added {new Date(resume.createdAt).toLocaleDateString()}
        </p>
      )}
    </Link>
  );
};

export default ResumeCard;
