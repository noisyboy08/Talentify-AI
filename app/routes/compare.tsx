import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import CompareResumes from "~/components/CompareResumes";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/compare";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talentify AI | Compare Resumes" },
    { name: "description", content: "Compare two resumes side by side" },
  ];
}

export default function ComparePage() {
  const { id1, id2 } = useParams();
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/compare");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  if (!id1 || !id2) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <div className="text-center p-8">
          <p className="text-red-500">Invalid resume IDs for comparison</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <div className="py-8">
        <CompareResumes resumeId1={id1} resumeId2={id2} />
      </div>
    </main>
  );
}

