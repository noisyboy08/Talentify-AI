import { useEffect, useRef, useState } from "react";

interface Score3DProps {
  score: number;
  size?: number;
}

const Score3D = ({ score, size = 200 }: Score3DProps) => {
  // Responsive size based on screen width
  const [canvasSize, setCanvasSize] = useState(size);
  
  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 640) {
        setCanvasSize(150);
      } else if (window.innerWidth < 1024) {
        setCanvasSize(180);
      } else {
        setCanvasSize(size);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - (canvasSize < 180 ? 15 : 20);

    // Animate score arc drawing
    let progress = 0;
    const targetProgress = score / 100;
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = targetProgress * easeOut;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw animated score arc
      const scoreAngle = currentScore * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, scoreAngle);
      ctx.strokeStyle = score > 70 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.stroke();

      // Animated score text - responsive font size
      const displayScore = Math.round(currentScore * score);
      const fontSize = canvasSize < 180 ? 36 : canvasSize < 200 ? 42 : 48;
      const smallFontSize = canvasSize < 180 ? 16 : canvasSize < 200 ? 18 : 20;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${displayScore}`, centerX, centerY - (canvasSize < 180 ? 8 : 10));
      ctx.font = `${smallFontSize}px Arial`;
      ctx.fillText("/ 100", centerX, centerY + (canvasSize < 180 ? 20 : 25));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [score, canvasSize]);

  return (
    <div className="flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="drop-shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default Score3D;

