import SingleSelection from "@/components/questions/SingleSelection";
import MultiSelection from "@/components/questions/MultiSelection";
import SlidingScale from "@/components/questions/SlidingScale";
import EmotiveScale from "@/components/questions/EmotiveScale";
import SignalScale from "@/components/questions/SignalScale";
import DetailForm from "@/components/questions/DetailForm";
import SingleSelectionWithBooleanConditional from "@/components/questions/SingleSelectionWithBooleanConditional";

import { 
  Question,
  SingleSelectionProps,
  MultiSelectionProps,
  SlidingScaleProps,
  EmotiveScaleProps,
  SignalScaleProps,
  DetailFormProps,
  SingleSelectionWithBooleanConditionalProps,
} from "@/lib/interfaces";

interface DynamicQuestionRendererProps {
  question: Question;
  selectedValues: Record<string, any>;
  setSelectedValue: (alias: string, value: any) => void;
}

// Type guard functions to ensure type safety
function isSingleSelectionProps(props: Question['props']): props is SingleSelectionProps {
  return 'question' in props;
}

function isSingleSelectionWithBooleanConditionalProps(props: Question['props']): props is SingleSelectionWithBooleanConditionalProps {
  return 'question' in props;
}

function isMultiSelectionProps(props: Question['props']): props is MultiSelectionProps {
  return 'question' in props;
}

function isSlidingScaleProps(props: Question['props']): props is SlidingScaleProps {
  return 'question' in props;
}

function isEmotiveScaleProps(props: Question['props']): props is EmotiveScaleProps {
  return 'question' in props;
}

function isSignalScaleProps(props: Question['props']): props is SignalScaleProps {
  return 'question' in props;
}

function isDetailFormProps(props: Question['props']): props is DetailFormProps {
  return true; // DetailForm has minimal required props
}

const DynamicQuestionRenderer: React.FC<DynamicQuestionRendererProps> = ({
  question,
  selectedValues,
  setSelectedValue,
}) => {
  const alias = question.alias;
  const props = question.props;

  switch (question.type) {
    case "SingleSelection":
      if (!isSingleSelectionProps(props)) return null;
      return (
        <SingleSelection
          question={props.question || ''}
          options={props.options || []}
          selectedOption={selectedValues[alias] || ''}
          onSelect={(value) => setSelectedValue(alias, value)}
          subtext={props.subtext}
          required={props.required}
          otherOption={props.otherOption}
        />
      );

    case "SingleSelectionWithBooleanConditional":
      if (!isSingleSelectionWithBooleanConditionalProps(props)) return null;
      
      // Handle both old format (object) and new format (string)
      let selectedOption = selectedValues[alias];
      
      // If the value is an object with the old format, convert it to the new string format
      if (selectedOption && typeof selectedOption === 'object' && 'selectedOption' in selectedOption) {
        if (selectedOption.selectedOption === 'Yes' && selectedOption.followUpAnswer) {
          selectedOption = `Yes, ${selectedOption.followUpAnswer}`;
        } else {
          selectedOption = selectedOption.selectedOption;
        }
        
        // Update the stored value to the new format
        setTimeout(() => {
          setSelectedValue(alias, selectedOption);
        }, 0);
      }
      
      return (
        <SingleSelectionWithBooleanConditional
          question={props.question || ""}
          options={props.options || []}
          selectedOption={selectedOption || ""}
          followUpQuestion={props.followUpQuestion || ""}
          required={props.required || false}
          subtext={props.subtext || ""}
          onSelect={(option: string) => setSelectedValue(alias, option)}
        />
      );

    case "MultiSelection":
      if (!isMultiSelectionProps(props)) return null;
      return (
        <MultiSelection
          question={props.question || ""}
          options={props.options || []}
          selectedValues={selectedValues[alias] || []}
          onSelect={(values) => setSelectedValue(alias, values)}
          subtext={props.subtext}
          required={props.required}
          otherOption={props.otherOption}
          minSelections={props.minSelections}
          maxSelections={props.maxSelections}
        />
      );

    case "SlidingScale":
      if (!isSlidingScaleProps(props)) return null;
      return (
        <SlidingScale
          question={props.question || ''}
          options={props.options}
          initialValue={selectedValues[alias] || 3}
          onSelect={(value) => setSelectedValue(alias, value)}
          subtext={props.subtext}
          required={props.required}
          minLabel={props.minLabel}
          maxLabel={props.maxLabel}
        />
      );

    case "EmotiveScale":
      if (!isEmotiveScaleProps(props)) return null;
      return (
        <EmotiveScale
          question={props.question || ''}
          options={props.options}
          selectedOption={selectedValues[alias] || 0}
          onSelect={(value) => setSelectedValue(alias, value)}
          subtext={props.subtext}
          required={props.required}
        />
      );

    case "SignalScale":
      if (!isSignalScaleProps(props)) return null;
      return (
        <SignalScale
          question={props.question || ''}
          options={props.options}
          selectedOption={selectedValues[alias] || 0}
          onSelect={(value) => setSelectedValue(alias, value)}
          subtext={props.subtext}
          required={props.required}
        />
      );

    case "DetailForm":
      if (!isDetailFormProps(props)) return null;
      const initialData = selectedValues[alias] || {};
      return (
        <DetailForm
          initialData={initialData}
          onChange={(data) => {
            setSelectedValue(alias, data);
          }}
          subtext={props.subtext}
          required={props.required}
          fields={props.fields || []}
          question={props.question}
        />
      );

    default:
      return null;
  }
};

export default DynamicQuestionRenderer;
