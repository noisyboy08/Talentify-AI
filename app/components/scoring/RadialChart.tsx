import { useEffect, useRef } from "react";

interface RadialChartProps {
  score: number;
  label: string;
  color: "blue" | "green" | "purple" | "orange" | "pink" | "indigo";
}

const colorMap = {
  blue: { primary: "#3b82f6", secondary: "#dbeafe" },
  green: { primary: "#10b981", secondary: "#d1fae5" },
  purple: { primary: "#8b5cf6", secondary: "#e9d5ff" },
  orange: { primary: "#f59e0b", secondary: "#fef3c7" },
  pink: { primary: "#ec4899", secondary: "#fce7f3" },
  indigo: { primary: "#6366f1", secondary: "#e0e7ff" },
};

export function RadialChart({ score, label, color }: RadialChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = colorMap[color];
  const percentage = score / 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference * (1 - percentage);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width < 100 ? 30 : 45;
    const lineWidth = canvas.width < 100 ? 6 : 8;

    // Animate score drawing
    let currentProgress = 0;
    const targetProgress = percentage;
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      currentProgress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - currentProgress, 3);
      const currentPercentage = targetProgress * easeOut;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw animated score arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * currentPercentage);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Draw score text - responsive font size
      const displayScore = Math.round(currentPercentage * score);
      const fontSize = canvas.width < 100 ? 14 : 20;
      ctx.fillStyle = "#1f2937";
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${displayScore}`, centerX, centerY);

      if (currentProgress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [score, colors, percentage]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={80}
        height={80}
        className="mb-1 sm:mb-2"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p className="text-[10px] sm:text-xs font-medium text-gray-600 text-center max-w-[80px] sm:max-w-[100px] leading-tight">
        {label}
      </p>
    </div>
  );
}

