import sellerTemplate from './seller.json';
import basicTemplate from './basic.json';

export interface FlowTemplate {
  name: string;
  description: string;
  sections: any[];
}

export const templates: Record<string, FlowTemplate> = {
  seller: sellerTemplate,
  basic: basicTemplate
};

export function getTemplateNames(): string[] {
  return Object.keys(templates);
}

export function getTemplate(name: string): FlowTemplate | null {
  return templates[name] || null;
} 