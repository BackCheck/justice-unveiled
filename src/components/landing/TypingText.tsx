import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypingTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

const TypingText = ({
  words,
  className,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypingTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        return;
      }
      const deleteTimer = setTimeout(() => {
        setCurrentText(currentText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(deleteTimer);
    }

    if (currentText === currentWord) {
      setIsPaused(true);
      return;
    }

    const typeTimer = setTimeout(() => {
      setCurrentText(currentWord.slice(0, currentText.length + 1));
    }, typingSpeed);

    return () => clearTimeout(typeTimer);
  }, [currentText, isDeleting, isPaused, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={cn("relative", className)}>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-chart-2 to-primary bg-[length:200%_auto] animate-gradient-shift">
        {currentText}
      </span>
      <span 
        className={cn(
          "inline-block w-[3px] h-[1em] ml-1 bg-primary align-middle",
          "animate-pulse"
        )}
        style={{ 
          animation: "pulse 0.8s ease-in-out infinite",
          verticalAlign: "text-bottom"
        }}
      />
    </span>
  );
};

export default TypingText;
