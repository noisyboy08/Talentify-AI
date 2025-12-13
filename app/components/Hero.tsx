import { ShaderAnimation } from "~/components/ui/shader-animation";

export default function Hero() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white" style={{ height: '100vh' }}>
      <ShaderAnimation />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/40" />
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight sm:leading-none font-bold tracking-tighter text-gray-900 drop-shadow-lg mb-3 sm:mb-4 md:mb-6">
          Talentify AI
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal opacity-90 text-gray-700 drop-shadow mb-2 sm:mb-3 md:mb-4 px-2">
          Smart Resume Analysis Powered by AI
        </p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light opacity-80 text-gray-600 mt-2 sm:mt-3 md:mt-4 px-4 sm:px-6 md:px-8 max-w-3xl">
          Get instant feedback and improve your resume with AI-powered insights
        </p>
      </div>
    </div>
  );
}

