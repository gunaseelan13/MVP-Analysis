export type Analysis = {
  id?: string
  created_at?: string
  file_name: string
  total_comments: number
  pain_points: PainPoint[]
  potential_ideas: string[]
  sentiment_score: number
  file_type: 'json' | 'csv'
}

export type PainPoint = {
  topic: string
  count: number
  sentiment: number
  examples: string[]
}

export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: Analysis
        Insert: Omit<Analysis, 'id' | 'created_at'>
        Update: Partial<Analysis>
      }
    }
  }
}
