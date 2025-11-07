export interface BaseQuestionProps {
  question: string;
  required: boolean;
  subtext?: string;
  [key: string]: any;  // Allow for dynamic properties
}

export interface SingleSelectionProps extends BaseQuestionProps {
  options: string[];  // Make required
  selectedOption?: string;
  onSelect?: (option: string) => void;
  otherOption?: boolean;
}

export interface MultiSelectionProps extends BaseQuestionProps {
  options: string[];  // Already required
  selectedValues?: string[];
  onSelect?: (values: string[]) => void;
  otherOption?: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export interface DetailFormField {
  id: string;  // Adding id as it's used in the component
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'select' | 'url' | 'textarea';
  required: boolean;
  placeholder?: string;
  alias: string;
  options?: string[];  // For select type fields
  textareaHeight?: 'small' | 'medium' | 'large';  // Height option for textarea fields
  columnSpan?: 1 | 2;  // Number of columns the field should span, default to 1 if not specified
}

export interface DetailFormProps extends BaseQuestionProps {
  fields: DetailFormField[];
  initialData?: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

export interface SlidingScaleProps extends BaseQuestionProps {
  options: string[];  // Make required
  minLabel: string;
  maxLabel: string;
  initialValue?: number;
  onSelect?: (value: number) => void;
}

export interface EmotiveScaleProps extends BaseQuestionProps {
  options: string[];  // Make required
  selectedOption?: number;
  onSelect?: (value: number) => void;
}

export interface SignalScaleProps extends BaseQuestionProps {
  options: string[];  // Make required
  selectedOption?: number;
  onSelect?: (value: number) => void;
}

export interface SingleSelectionWithBooleanConditionalProps extends SingleSelectionProps {
  onFollowUpChange?: (answer: string) => void;
}

export type QuestionProps =
  | SingleSelectionProps
  | MultiSelectionProps
  | DetailFormProps
  | SlidingScaleProps
  | EmotiveScaleProps
  | SignalScaleProps
  | SingleSelectionWithBooleanConditionalProps;

export interface Question {
  type: 'SingleSelection' | 'MultiSelection' | 'DetailForm' | 'SlidingScale' | 'EmotiveScale' | 'SignalScale' | 'SingleSelectionWithBooleanConditional';
  alias: string;
  editable: boolean;
  props: QuestionProps;
}

export interface Step {
  id: number;
  order: number;
  questions: Question[];
  conditionalDisplay?: ConditionalDisplay; // Optional conditional display logic
}

export interface ConditionalDisplay {
  questionAlias: string;  // The alias of the question to check
  expectedValue: any;     // The value that should trigger showing the section
  operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes'; // The comparison operator
}

export interface Section {
  id: number;
  name: string;
  color: string;
  steps: Step[];
  order?: number;
  conditionalDisplay?: ConditionalDisplay; // Optional conditional display logic
}

export type AnalyticsEvent = {
  id: string
  user_id: string | null
  event_type: 'email_link_click' | 'dashboard_visit' | 'stage_start' | 'signup_start' | 'signup_complete' | 'terms_accepted'
  event_data: {
    email?: string
    stage_name?: string
    url?: string
    source?: string
    timestamp: string
  }
  created_at: string
  users?: {
    email: string
  } | null
  auth_user?: {
    email: string
  } | null
}

export type Database = {
  // ... existing types ...
  analytics_events: AnalyticsEvent
}

export interface Certificate {
  name: string;
  status: string;
  image?: string;
}

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface CompanyInfo {
  logo: string;
  location: string;
  website: string;
  sustainabilityScore: number;
  description: string;
  operatingRegions: string[];
  foundedYear: number;
  scoreComponents: {
    technologyReadiness: number;
    impactPotential: number;
    marketViability: number;
    regularityFit: number;
    documentationAndVerification: number;
    platformEngagement: number;
    innovationType: number;
  };
}

export interface ToolInfo {
  name: string;
  description: string;
  usp: string[];
  category: string;
  inProduction: boolean;
  technologies: string[];
  customerSupport: string;
  updateFrequency: string;
  coverage: string[];
  compliance: string[];
}

export interface ProfileData {
  id: string; // This will be a UUID
  name: string;
  data: {
    companyInfo: CompanyInfo;
    toolInfo: ToolInfo;
    companyName: string;
    howItWorks: {
      steps: Array<{
        title: string;
        description: string;
      }>;
    };
    useCases: string[];
    sidebarDescription: string;
    toolDescription: {
      short: string;
      long: string;
    };
    ipStatus: string[];
    certificates?: Certificate[];
  };
  password: string;
}
