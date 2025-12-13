"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";

export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="h-4 w-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[200px] sm:min-h-[240px] w-full max-w-[90vw] sm:w-[28rem] md:w-[32rem] -skew-y-[4deg] sm:-skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-4 sm:py-5 pr-4 sm:pr-8 transition-all duration-700 shadow-lg hover:border-blue-300/50 hover:bg-white hover:shadow-xl hover:min-h-[240px] sm:hover:min-h-[280px] hover:z-50 [&>*]:flex [&>*]:items-start [&>*]:gap-2 overflow-visible",
        className
      )}
    >
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-visible">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className="relative inline-block rounded-full bg-blue-800/20 p-1.5 sm:p-2 flex-shrink-0">
            {icon}
          </span>
          <p className={cn("text-lg sm:text-xl font-semibold leading-tight", titleClassName)}>{title}</p>
        </div>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words pr-2 sm:pr-8 overflow-visible">{description}</p>
      </div>
      <p className="text-sm text-gray-500 mt-2 flex-shrink-0">{date}</p>
    </div>
  );
}

export interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 min-h-[500px] sm:min-h-[650px] md:min-h-[750px] pb-20 sm:pb-28 md:pb-36 overflow-visible px-4">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

// Optional demo export if needed elsewhere
export function DisplayCardsDemo() {
  const cards: DisplayCardProps[] = [
    {
      icon: <Sparkles className="h-4 w-4 text-blue-300" />,
      title: "Featured",
      description: "Discover amazing content",
      date: "Just now",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Sparkles className="h-4 w-4 text-blue-300" />,
      title: "Popular",
      description: "Trending this week",
      date: "2 days ago",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className:
        "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Sparkles className="h-4 w-4 text-blue-300" />,
      title: "New",
      description: "Latest updates and features",
      date: "Today",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className:
        "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
  ];

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center py-20">
      <div className="w-full max-w-3xl">
        <DisplayCards cards={cards} />
      </div>
    </div>
  );
}

