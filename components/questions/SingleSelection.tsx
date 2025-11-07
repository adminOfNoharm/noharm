import { Button } from "@/components/ui/button";
import { SingleSelectionProps } from '@/lib/interfaces';
import { useState, useEffect } from 'react';

const SingleSelection = (
  { question, options = [], selectedOption, onSelect, required = true, subtext, otherOption }: SingleSelectionProps) => {
  const [otherText, setOtherText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  // Check if the selected option is not in the options array
  useEffect(() => {
    const isOther = Boolean(selectedOption && !options.includes(selectedOption));
    setIsOtherSelected(isOther);
    if (isOther && selectedOption) {
      setOtherText(selectedOption);
    }
  }, [selectedOption, options]);

  const handleOtherSelect = () => {
    if (!isOtherSelected) {
      setIsOtherSelected(true);
      onSelect?.(otherText || "");
    }
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setOtherText(newText);
    onSelect?.(newText);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-wide font-primary">{question}</h2>
        {subtext && (
          <p className="text-gray-600 text-lg font-secondary mt-2">{subtext}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            className={`w-full h-auto min-h-[4rem] text-md text-gray-600 font-secondary whitespace-normal py-3 px-4 flex items-center justify-center text-center ${
              selectedOption === option ? "border-green-500 border-2 text-black" : "border-gray-300"
            }`}
            onClick={() => {
              setIsOtherSelected(false);
              onSelect?.(option);
            }}
          >
            {option}
          </Button>
        ))}
        
        {otherOption && (
          <>
            <Button
              variant="outline"
              className={`w-full h-auto min-h-[4rem] text-md text-gray-600 font-secondary whitespace-normal py-3 px-4 flex items-center justify-center text-center ${
                isOtherSelected ? "border-green-500 border-2 text-black" : "border-gray-300"
              }`}
              onClick={handleOtherSelect}
            >
              Other
            </Button>
            
            {isOtherSelected && (
              <div className="col-span-full">
                <input
                  type="text"
                  value={otherText}
                  onChange={handleOtherTextChange}
                  placeholder="Please specify..."
                  className="w-full p-2 border-2 rounded-md border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                  autoFocus
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SingleSelection; 