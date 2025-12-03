export enum AppStep {
  STORE_URL_INPUT,
  BRAND_PROFILE_DISPLAY,
  PRODUCT_URL_INPUT,
  PRODUCT_ANALYSIS_DISPLAY,
  RESULTS_DISPLAY,
}

export interface ProductCopy {
  metaTitle: string;
  metaDescription: string;
  productDescription: string;
  seoKeywords: string;
  relatedKeywords: string;
}

export enum ChatMessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  id: string; // Unique ID for React keys
}