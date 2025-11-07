import React from 'react';
import { Button } from "@/components/ui/button";
import SignalIndicator from '../ui/signal-bars';
import { SignalScaleProps } from '@/lib/interfaces';


export default function SignalScale({
  question,
  options = [],
  selectedOption,
  onSelect,
  subtext,
  required = true
}: SignalScaleProps) {


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-wide font-primary">{question}</h2>
        {subtext && (
            <p className="text-gray-600 text-lg font-secondary mt-2">{subtext}</p>
          )
        }
      </div>
      <div className="flex flex-col gap-4 justify-center">
        {options.map((option, idx) => (
          <Button
            key={option}
            variant="outline"
            className={`flex-1 flex-row p-6 text-lg items-center justify-start font-secondary h-full ${
              idx + 1 === selectedOption ? "border-green-500 border-2" : "border-gray-300"
            }`}
            onClick={() => onSelect?.(idx + 1)}
          >
            <span className="text-4xl"><SignalIndicator activeCount={idx+1} totalBars={options.length} /></span>
            <span className="text-md ml-4 whitespace-normal" style={{ color: idx + 1 === selectedOption ? 'black' : 'gray' }}>
              {option}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};