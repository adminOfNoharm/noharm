import { Question } from './interfaces';

// Define the configuration for each field type
interface FieldConfig {
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'fields';
  placeholder?: string;
  min?: number;
  max?: number;
}

// Define the specific configurations for each question type
interface QuestionTypeConfig {
  basicFields: {
    [key: string]: FieldConfig;
  };
  specificFields?: {
    [key: string]: FieldConfig;
  };
}

// Main configuration object
export const questionConfig: Record<Question['type'], QuestionTypeConfig> = {
  SingleSelection: {
    basicFields: {
      question: {
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question'
      },
      subtext: {
        label: 'Subtext',
        type: 'text',
        placeholder: 'Enter additional context or instructions'
      },
      required: {
        label: 'Required field',
        type: 'checkbox'
      }
    },
    specificFields: {
      otherOption: {
        label: 'Allow "Other" option',
        type: 'checkbox'
      }
    }
  },

  MultiSelection: {
    basicFields: {
      question: {
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question'
      },
      subtext: {
        label: 'Subtext',
        type: 'text',
        placeholder: 'Enter additional context or instructions'
      },
      required: {
        label: 'Required field',
        type: 'checkbox'
      }
    },
    specificFields: {
      otherOption: {
        label: 'Allow "Other" option',
        type: 'checkbox'
      },
      minSelections: {
        label: 'Min Selections',
        type: 'number',
        min: 0
      },
      maxSelections: {
        label: 'Max Selections',
        type: 'number',
        min: 0
      }
    }
  },

  SlidingScale: {
    basicFields: {
      question: {
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question'
      },
      subtext: {
        label: 'Subtext',
        type: 'text',
        placeholder: 'Enter additional context or instructions'
      },
      required: {
        label: 'Required field',
        type: 'checkbox'
      }
    },
    specificFields: {
      minLabel: {
        label: 'Min Label',
        type: 'text',
        placeholder: 'e.g., Not at all likely'
      },
      maxLabel: {
        label: 'Max Label',
        type: 'text',
        placeholder: 'e.g., Extremely likely'
      }
    }
  },

  EmotiveScale: {
    basicFields: {
      question: {
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question'
      },
      subtext: {
        label: 'Subtext',
        type: 'text',
        placeholder: 'Enter additional context or instructions'
      },
      required: {
        label: 'Required field',
        type: 'checkbox'
      }
    }
  },

  SignalScale: {
    basicFields: {
      question: {
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question'
      },
      subtext: {
        label: 'Subtext',
        type: 'text',
        placeholder: 'Enter additional context or instructions'
      },
      required: {
        label: 'Required field',
        type: 'checkbox'
      }
    }
  },

  DetailForm: {
    basicFields: {
      question: {
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question'
      },
      subtext: {
        label: 'Subtext',
        type: 'text',
        placeholder: 'Enter additional context or instructions'
      },
      required: {
        label: 'Required field',
        type: 'checkbox'
      }
    },
    specificFields: {
      fields: {
        label: 'Form Fields',
        type: 'fields',
      }
    }
  },

  SingleSelectionWithBooleanConditional: {
    basicFields: {
      question: {
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question'
      },
      subtext: {
        label: 'Subtext',
        type: 'text',
        placeholder: 'Enter additional context or instructions'
      },
      required: {
        label: 'Required field',
        type: 'checkbox'
      }
    }
  }
}; 