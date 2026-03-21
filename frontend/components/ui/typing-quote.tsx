"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Quote {
  text: string;
  author: string;
  role: string;
  company: string;
}

interface TypingQuoteProps {
  quotes: Quote[];
}

export function TypingQuote({ quotes }: TypingQuoteProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const currentQuote = quotes[quoteIndex].text;

    if (isTyping && !isDeleting) {
      if (displayText.length < currentQuote.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentQuote.slice(0, displayText.length + 1));
        }, 40);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2800);
      }
    } else if (isDeleting) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentQuote.slice(0, displayText.length - 1));
        }, 20);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setQuoteIndex((prev) => (prev + 1) % quotes.length);
        }, 500);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, isDeleting, quoteIndex, quotes]);

  const activeQuote = quotes[quoteIndex];

  return (
    <div className="flex flex-col max-w-[440px]">
      <div className="min-h-[140px]">
        <h2 className="font-serif italic text-[22px] leading-[1.6] text-white">
          &quot;{displayText}
          <span className="animate-blink inline-block w-[2px] h-[20px] bg-white align-middle ml-0.5"></span>&quot;
        </h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5 text-[14px] text-white/65 font-sans"
        >
          &mdash; {activeQuote.author}, {activeQuote.role} @ {activeQuote.company}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-row gap-2 mt-6">
        {quotes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (idx !== quoteIndex) {
                setQuoteIndex(idx);
                setDisplayText("");
                setIsDeleting(false);
                setIsTyping(true);
              }
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === quoteIndex ? "bg-white" : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to quote ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
