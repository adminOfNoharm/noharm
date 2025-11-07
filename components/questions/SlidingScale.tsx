"use client";

import { useState, useEffect} from "react";
import { SlidingScaleProps } from '@/lib/interfaces';


export default function SlidingScale({
  question,
  options = ["1", "2", "3", "4", "5"], // Default labels: 1-5
  onSelect,
  initialValue = 3, // Default to middle if no initialValue
  subtext,
  required = true,
  minLabel = "",
  maxLabel = ""
}: SlidingScaleProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(initialValue - 1); // Adjusting for zero-based index

  useEffect(() => {
    console.log("initialValue", initialValue);
    setSelectedIndex(initialValue - 1);
  }, [initialValue]);

  const handleOptionClick = (index: number) => {
    console.log("index", index);
    setSelectedIndex(index);

    // Trigger callback with the current selected option
    if (onSelect) {
      onSelect(index + 1);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-wide font-primary">{question}</h2>
        {subtext && (
            <p className="text-gray-600 text-lg font-secondary mt-2">{subtext}</p>
          )
        }
      </div>

      {/* Slider Container */}
      <div className="relative w-full">
        <div className="flex justify-between text-sm mb-2">
          {minLabel !== "" && maxLabel !== "" && (
            <>
              <span className="text-gray-600">{minLabel}</span>
              <span className="text-gray-600">{maxLabel}</span>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 w-full bg-gray-200 rounded-full">
          <div
            className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-300"
            style={{
              width: `${((selectedIndex) / (options.length - 1)) * 100}%`,
            }}
          />
          {/* Markers and click targets for each option */}
          {options.map((_, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(index)}
              className={`absolute h-8 w-8 -top-3 -ml-4 cursor-pointer rounded-full transition-all duration-300 hover:bg-green-100`}
              style={{
                left: `${(index / (options.length - 1)) * 100}%`,
              }}
            >
              {/* Marker dot */}
              <div 
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 transition-all duration-300 ${
                  selectedIndex === index 
                    ? 'bg-green-500 border-green-600 scale-125' 
                    : 'bg-white border-gray-300 hover:border-green-400'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-6 relative">
          {options.map((label, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(index)}
              style={{
                position: 'absolute',
                left: `${(index / (options.length - 1)) * 100}%`,
                transform: 'translateX(-50%)',
              }}
              className={`cursor-pointer font-secondary tracking-wide transition-all duration-300 ${
                selectedIndex === index 
                  ? 'text-green-600 font-bold scale-110' 
                  : 'text-gray-600 hover:text-green-500'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
