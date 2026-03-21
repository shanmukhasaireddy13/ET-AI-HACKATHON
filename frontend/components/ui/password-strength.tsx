"use client";

import { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (password) {
      const evaluation = zxcvbn(password);
      setScore(evaluation.score); // 0 to 4
    } else {
      setScore(0);
    }
  }, [password]);

  const strengthLabels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  
  const getStrengthWidth = (scoreNum: number) => {
    if (!password) return "0%";
    if (scoreNum <= 1) return "25%";
    if (scoreNum === 2) return "50%";
    if (scoreNum === 3) return "75%";
    return "100%";
  };

  const getStrengthColor = (scoreNum: number) => {
    if (!password) return "bg-border-custom";
    if (scoreNum <= 1) return "bg-red-500";
    if (scoreNum === 2) return "bg-orange-500";
    if (scoreNum === 3) return "bg-blue-600";
    return "bg-green-600";
  };

  const currentLabelColor = () => {
    if (!password) return "text-muted-text";
    if (score <= 1) return "text-red-500";
    if (score === 2) return "text-orange-500";
    if (score === 3) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor(score)}`}
          style={{ width: getStrengthWidth(score) }}
        />
      </div>
      {password && (
        <div className={`text-[12px] text-right font-medium ${currentLabelColor()}`}>
          {strengthLabels[score]}
        </div>
      )}
    </div>
  );
}
