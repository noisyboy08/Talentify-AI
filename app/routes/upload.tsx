import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import { AIResponseFormat } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import type { Route } from "./+types/upload";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talentify AI | Upload Resume" },
    { name: "description", content: "Upload your resume to get feedback" },
  ];
}

const UploadPage = () => {
  const { auth, isLoading, error, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/upload");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = (formData.get("company-name") as string)?.trim() || "";
    const jobTitle = (formData.get("job-title") as string)?.trim() || "";
    const jobDescription = (formData.get("job-description") as string)?.trim() || "";
    
    if (!file) {
      setErrorMessage("Please upload a resume file.");
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("File size must be less than 20MB.");
      return;
    }
    
    if (file.type !== "application/pdf") {
      setErrorMessage("Please upload a PDF file.");
      return;
    }
    
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);
      setErrorMessage("");
      setProgress(0);
      
      setStatusText("Uploading the file...");
      setProgress(10);
      const uploadedFile = await fs.upload([file]);

      if (!uploadedFile) {
        setErrorMessage("Failed to upload file. Please try again.");
        setIsProcessing(false);
        setProgress(0);
        return;
      }

      setStatusText("Converting PDF to image...");
      setProgress(30);
      const imageFile = await convertPdfToImage(file);

      if (!imageFile.file || imageFile.error) {
        setErrorMessage(imageFile.error || "Failed to convert PDF to image. Please ensure the PDF is valid.");
        setIsProcessing(false);
        setProgress(0);
        return;
      }

      setStatusText("Uploading the image...");
      setProgress(50);
      const uploadedImage = await fs.upload([imageFile.file]);

      if (!uploadedImage) {
        setErrorMessage("Failed to upload image. Please try again.");
        setIsProcessing(false);
        setProgress(0);
        return;
      }

      setStatusText("Preparing data...");
      setProgress(60);
      const uuid = generateUUID();
      const createdAt = new Date().toISOString();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName: companyName,
        jobTitle: jobTitle,
        jobDescription: jobDescription,
        feedback: "",
        createdAt: createdAt,
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing resume with AI...");
      setProgress(70);
      const feedback = await ai.feedback(
        uploadedFile.path,
        `You are an expert in ATS (Applicant Tracking System) and resume analysis.
        Please analyze and rate this resume and suggest how to improve it.
        The rating can be low if the resume is bad.
        Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
        If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
        If available, use the job description for the job user is applying to to give more detailed feedback.
        If provided, take the job description into consideration.
        The job title is: ${jobTitle}
        The job description is: ${jobDescription}
        Provide the feedback using the following format:
        ${AIResponseFormat}
        Return the analysis as an JSON object, without any other text and without the backticks.
        Do not include any other text or comments.`
      );

      if (!feedback) {
        setErrorMessage("Failed to analyze resume. Please try again.");
        setIsProcessing(false);
        setProgress(0);
        return;
      }

      setProgress(90);
      setStatusText("Processing feedback...");
      let feedbackText: string;
      try {
        feedbackText =
          typeof feedback.message.content === "string"
            ? feedback.message.content
            : feedback.message.content[0].text;
        
        // Clean up the feedback text (remove markdown code blocks if present)
        feedbackText = feedbackText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        const parsedFeedback = JSON.parse(feedbackText);
        data.feedback = parsedFeedback;
      } catch (parseError) {
        setErrorMessage("Failed to parse AI feedback. Please try uploading again.");
        setIsProcessing(false);
        setProgress(0);
        return;
      }

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setProgress(100);
      setStatusText("Analysis complete! Redirecting...");
      
      setTimeout(() => {
        navigate(`/resume/${uuid}`);
      }, 500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <section className="main-section">
        <div className="page-heading">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <div className="w-full max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl">{statusText}</h2>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <img src="/images/resume-scan.gif" className="w-full max-w-md" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips.</h2>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg w-full max-w-md">
              <p className="font-semibold">Error</p>
              <p>{errorMessage}</p>
            </div>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  name="job-description"
                  id="job-description"
                  placeholder="Job Description"
                  rows={5}
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              {file && (
                <button className="primary-button glow-3d card-3d" type="submit">
                  Save & Analyze Resume
                </button>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default UploadPage;
