import { Question, DetailFormField } from './interfaces';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    stepIndex?: number;
}

export const validateQuestionValue = (question: Question, value: any): ValidationResult => {
    const isRequired = question.props.required !== false;

    // Skip validation if field is not required and value is empty
    if (!isRequired && (value === undefined || value === null || value === '')) {
        return { isValid: true };
    }

    switch (question.type) {
        case "SingleSelection":
        case "SingleSelectionWithBooleanConditional":
            if (isRequired && (!value || value === '')) {
                return { isValid: false, error: "Please select an option." };
            }
            break;

        case "MultiSelection":
            if (isRequired && (!value || value.length === 0)) {
                return { isValid: false, error: "Please select at least one option" };
            }
            if (question.props.minSelections && value && value.length < question.props.minSelections) {
                return { isValid: false, error: `Please select at least ${question.props.minSelections} options` };
            }
            if (question.props.maxSelections && value && value.length > question.props.maxSelections) {
                return { isValid: false, error: `Please select no more than ${question.props.maxSelections} options` };
            }
            break;

        case "EmotiveScale":
        case "SignalScale":
            if (isRequired && (value === undefined || value === null)) {
                return { isValid: false, error: "Please select an option" };
            }
            break;

        case "SlidingScale":
            if (isRequired && (value === undefined || value === null)) {
                return { isValid: false, error: "Please select a value" };
            }
            break;

        case "DetailForm":
            if (!value) {
                return { isValid: false, error: "Please fill in the required fields." };
            }

            const fields = question.props.fields || [];
            
            // Check required fields
            for (const field of fields) {
                if (field.required && !value[field.alias]) {
                    const formattedField = field.label || field.alias;
                    return { isValid: false, error: `${formattedField} is required` };
                }
            }

            // Validate field formats
            for (const field of fields) {
                if (value[field.alias]) {
                    // Email validation
                    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value[field.alias])) {
                        return { isValid: false, error: `Please enter a valid email address for ${field.label}` };
                    }

                    // URL validation
                    if (field.type === 'url' && !/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i.test(value[field.alias])) {
                        return { isValid: false, error: `Please enter a valid website URL for ${field.label}` };
                    }

                    // Phone validation
                    if (field.type === 'phone' && !/^\+\d{1,3}\s\d{4,14}(?:x.+)?$/.test(value[field.alias])) {
                        return { isValid: false, error: `Please enter a valid phone number for ${field.label}` };
                    }
                }
            }
            break;
    }

    return { isValid: true };
};

export const validateStep = (questions: Question[], values: Record<string, any>): ValidationResult => {
    for (const question of questions) {
        const value = values[question.alias || ''];
        const result = validateQuestionValue(question, value);
        if (!result.isValid) {
            return result;
        }
    }
    return { isValid: true };
};

export const validateSection = (steps: { questions: Question[] }[], values: Record<string, any>): ValidationResult => {
    for (const step of steps) {
        const result = validateStep(step.questions, values);
        if (!result.isValid) {
            return result;
        }
    }
    return { isValid: true };
}; 