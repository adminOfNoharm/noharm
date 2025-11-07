import { Button } from "@/components/ui/button";
import { MultiSelectionProps } from '@/lib/interfaces';
import { useState, useEffect } from 'react';

const MultiSelection: React.FC<MultiSelectionProps> = ({
  question,
  options = [],
  selectedValues = [],
  onSelect,
  subtext,
  required,
  otherOption,
}) => {
  const [otherText, setOtherText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  useEffect(() => {
    const values = Array.isArray(selectedValues) ? selectedValues : [];
    const otherValue = values.find(value => !options.includes(value));
    
    if (otherValue) {
      setIsOtherSelected(true);
      setOtherText(otherValue);
    } else {
      setIsOtherSelected(false);
      setOtherText("");
    }
  }, [selectedValues, options]);

  const toggleSelection = (value: string) => {
    if (!onSelect) return;
    
    const currentValues = Array.isArray(selectedValues) ? selectedValues : [];
    
    if (currentValues.includes(value)) {
      onSelect(currentValues.filter((v) => v !== value));
    } else {
      onSelect([...currentValues, value]);
    }
  };

  const handleOtherSelect = () => {
    const currentValues = Array.isArray(selectedValues) ? selectedValues : [];
    
    if (!isOtherSelected) {
      setIsOtherSelected(true);
      if (otherText) {
        onSelect?.([...currentValues, otherText]);
      }
    } else {
      setIsOtherSelected(false);
      onSelect?.(currentValues.filter(value => options.includes(value)));
    }
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setOtherText(newText);
    
    const currentValues = Array.isArray(selectedValues) ? selectedValues : [];
    const filteredValues = currentValues.filter(value => options.includes(value));
    
    if (newText) {
      onSelect?.([...filteredValues, newText]);
    } else {
      onSelect?.(filteredValues);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
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
            className={`w-full h-auto min-h-[4rem] text-md text-gray-600 font-secondary whitespace-normal py-3 px-4 flex items-center justify-center text-center
              ${Array.isArray(selectedValues) && selectedValues.includes(option) ? "border-green-500 border-2 text-black" : "border-gray-300"
            }`}
            onClick={() => toggleSelection(option)}
          >
            {option}
          </Button>
        ))}

        {otherOption && (
          <>
            <Button
              variant="outline"
              className={`w-full h-auto min-h-[4rem] text-md text-gray-600 font-secondary whitespace-normal py-3 px-4 flex items-center justify-center text-center
                ${isOtherSelected ? "border-green-500 border-2 text-black" : "border-gray-300"
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

export default MultiSelection;
