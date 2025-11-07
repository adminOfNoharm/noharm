import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SingleSelectionWithBooleanConditionalProps } from "@/lib/interfaces";

const SingleSelectionWithBooleanConditional = ({
  question,
  options,
  selectedOption,
  followUpQuestion,
  onSelect,
  required = false,
  subtext = "",
}: Omit<SingleSelectionWithBooleanConditionalProps, 'followUpAnswer' | 'onFollowUpChange'>) => {
  // Local state for the follow-up answer
  const [localFollowUpAnswer, setLocalFollowUpAnswer] = useState("");
  const isInitialMount = useRef(true);
  const isUpdatingFromEffect = useRef(false);
  
  // Parse combined answer on component mount or when selectedOption changes
  useEffect(() => {
    // Skip this effect if we're in the middle of an update from a handler
    if (isUpdatingFromEffect.current) {
      return;
    }
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Initial setup on mount
      if (typeof selectedOption === 'string' && selectedOption.startsWith("Yes, ")) {
        // Extract the follow-up answer from the combined string
        const extractedAnswer = selectedOption.substring(5); // Remove "Yes, " prefix
        setLocalFollowUpAnswer(extractedAnswer);
      }
    } else {
      // Handle updates to selectedOption after initial mount
      if (typeof selectedOption === 'string' && selectedOption.startsWith("Yes, ")) {
        const extractedAnswer = selectedOption.substring(5);
        if (extractedAnswer !== localFollowUpAnswer) {
          setLocalFollowUpAnswer(extractedAnswer);
        }
      } else if (selectedOption !== "Yes" && localFollowUpAnswer) {
        // Clear follow-up if a non-Yes option is selected
        setLocalFollowUpAnswer("");
      }
    }
  }, [selectedOption]);

  // Handle follow-up answer changes
  const handleFollowUpChange = (value: string) => {
    setLocalFollowUpAnswer(value);
    
    // Prevent circular updates
    isUpdatingFromEffect.current = true;
    
    // If "Yes" is selected, update the selectedOption with the combined value as a string
    if ((selectedOption === "Yes" || (typeof selectedOption === 'string' && selectedOption.startsWith("Yes, "))) && value) {
      // Ensure we're passing a string
      onSelect?.(`Yes, ${value}`);
    } else if (selectedOption === "Yes" || (typeof selectedOption === 'string' && selectedOption.startsWith("Yes, "))) {
      // Ensure we're passing a string
      onSelect?.("Yes");
    }
    
    isUpdatingFromEffect.current = false;
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    // Prevent circular updates
    isUpdatingFromEffect.current = true;
    
    if (option === "Yes") {
      if (localFollowUpAnswer) {
        // If selecting "Yes" and there's already a follow-up answer, combine them as a string
        onSelect?.(`Yes, ${localFollowUpAnswer}`);
      } else {
        // Just select "Yes" as a string
        onSelect?.("Yes");
      }
    } else {
      // For any other option (like "No"), just select it as a string
      onSelect?.(option);
      
      // Clear the follow-up answer
      if (localFollowUpAnswer) {
        setLocalFollowUpAnswer("");
      }
    }
    
    isUpdatingFromEffect.current = false;
  };

  // Determine if the "Yes" option is selected
  const isYesSelected = selectedOption === "Yes" || 
    (typeof selectedOption === 'string' && selectedOption.startsWith("Yes, "));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-wide font-primary">
          {question}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {subtext && (
          <p className="mt-2 text-sm text-gray-500">{subtext}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(options as string[]).map((option) => (
          <Button
            key={option}
            variant="outline"
            className={`w-full h-auto min-h-[4rem] text-md text-gray-600 font-secondary whitespace-normal py-3 px-4 flex items-center justify-center text-center ${
              selectedOption === option || (option === "Yes" && isYesSelected)
                ? "border-green-500 border-2 text-black" 
                : "border-gray-300"
            }`}
            onClick={() => handleOptionSelect(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      {isYesSelected && (
        <div className="col-span-full mt-4">
          <h3 className="text-md font-semibold font-primary mb-2">
            {followUpQuestion}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <Input
            type="text"
            value={localFollowUpAnswer}
            onChange={(e) => handleFollowUpChange(e.target.value)}
            placeholder="Please specify..."
            className="w-full p-2 border-2 rounded-md border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default SingleSelectionWithBooleanConditional;
