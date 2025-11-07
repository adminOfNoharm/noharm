import React from 'react';
import { Button } from "@/components/ui/button";
import { EmotiveScaleProps } from '@/lib/interfaces';

export default function EmotiveScale({
  question,
  options = [
    "Just starting to understand",
    "Some understanding, but still learning",
    "Fairly confident, but there’s room to grow",
    "Well-versed and proactive",
    "Lead sustainability initiatives"
  ],
  selectedOption,
  onSelect,
  subtext,
  required = true
}: EmotiveScaleProps) {
  const emojiList = ["🤔", "😐", "🙂", "😎", "🌟"];

  return (
    <div className="space-y-8">
      {/* Question */}
      <div>
        <h2 className="text-2xl font-semibold tracking-wide font-primary">{question}</h2>
        {subtext && (
            <p className="text-gray-600 text-lg font-secondary mt-2">{subtext}</p>
          )
        }
      </div>
      {/* Button Grid */}
      <div className="flex flex-wrap gap-4 justify-center">
        {options.map((option, idx) => (
          <Button
            key={option}
            variant="outline"
            className={`flex flex-col items-center justify-center p-4 text-lg text-gray-500 font-secondary min-h-[150px] flex-[1_1_0%] text-center ${
              idx + 1 === selectedOption
                ? "border-green-500 border-2"
                : "border-gray-300"
            }`}
            onClick={() => onSelect?.(idx + 1)}
          >
            <span className="text-4xl">{emojiList[idx]}</span>
            <span className="text-sm mt-2 whitespace-normal leading-snug" style={{ color: idx + 1 === selectedOption ? 'black' : 'gray' }}>
              {option}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
