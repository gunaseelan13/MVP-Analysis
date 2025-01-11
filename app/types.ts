export type Analysis = {
  painPoints: {
    topic: string;
    count: number;
    sentiment: number;
    examples: string[];
  }[];
  potentialIdeas: string[];
  sentimentScore: number;
  totalComments: number;
};

export type IdeaAnalysis = {
  similarApps: {
    name: string;
    description: string;
    url?: string;
  }[];
  marketPotential: {
    size: string;
    growth: string;
    opportunities: string[];
  };
  keyDifferentiators: string[];
  challenges: string[];
};

export type SavedAnalysis = {
  id: string;
  created_at: string;
  title: string;
  analysis: Analysis;
  market_analysis?: {
    [key: string]: IdeaAnalysis;
  };
};
