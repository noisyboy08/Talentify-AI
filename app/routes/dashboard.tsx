import { useEffect } from "react";
import { useNavigate } from "react-router";
import Dashboard from "~/components/Dashboard";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talentify AI | Dashboard" },
    { name: "description", content: "View your resume analytics and statistics" },
  ];
}

export default function DashboardPage() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/dashboard");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <div className="py-8">
        <Dashboard />
      </div>
    </main>
  );
}

