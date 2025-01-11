'use client';

import { Plus, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useCompletion } from 'ai/react';
import { NewAnalysisDialog } from '@/components/new-analysis-dialog';
import { MarketAnalysisContent } from './MarketAnalysisContent';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { AnalysisShimmer } from '@/components/analysis-shimmer';
import { ModeToggle } from "@/components/mode-toggle";

type Analysis = {
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

type IdeaAnalysis = {
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

type SavedAnalysis = {
  id: string;
  created_at: string;
  title: string;
  analysis: Analysis;
  market_analysis?: {
    [key: string]: IdeaAnalysis;
  };
  raw_comments?: any[];
};

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingIdea, setAnalyzingIdea] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [expandedAnalyses, setExpandedAnalyses] = useState<{ [key: string]: boolean }>({});
  const [updatingTitleId, setUpdatingTitleId] = useState<string | null>(null);

  // Filter analyses based on search query
  const filteredAnalyses = savedAnalyses.filter((analysis) =>
    analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analysis.analysis.potentialIdeas.some((idea) =>
      idea.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  const loadSavedAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading saved analyses:', error);
        setError('Failed to load saved analyses');
        return;
      }

      if (data) {
        setSavedAnalyses(data);
      }
    } catch (err) {
      console.error('Exception while loading analyses:', err);
      setError('An unexpected error occurred while loading analyses');
    }
  };

  const handleAnalyze = async (content: string, title: string) => {
    try {
      setAnalyzing(true);
      setError(null);

      console.log('Filtering comments from content...');

      // First, filter comments using DeepSeek
      const filterResponse = await fetch('/api/filter-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!filterResponse.ok) {
        throw new Error('Failed to filter comments');
      }

      const { comments } = await filterResponse.json();
      const filteredContent = comments.join('\n\n');

      console.log('Analyzing filtered content:', { title, contentLength: filteredContent.length });

      // Then proceed with the main analysis using OpenAI
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: filteredContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const analysis = await response.json();
      console.log('Analysis results:', analysis);

      // Prepare the data to save (only including fields that exist in the table)
      const analysisData = {
        title,
        analysis,
        market_analysis: {} // Initialize with empty market analysis
      };

      console.log('Saving analysis data:', analysisData);

      // Save to Supabase with better error handling
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('analyses')
        .insert(analysisData)
        .select('*')
        .single();

      if (saveError) {
        console.error('Error details:', {
          code: saveError.code,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint
        });
        setError(`Failed to save analysis: ${saveError.message}`);
        return;
      }

      if (!savedAnalysis) {
        console.error('No data returned from save operation');
        setError('Failed to save analysis: No data returned');
        return;
      }

      console.log('Successfully saved analysis:', savedAnalysis);

      // Update local state
      setResults(analysis);
      setSavedAnalyses(prev => [savedAnalysis, ...prev]);
      setSelectedAnalysis(savedAnalysis);
      setDialogOpen(false); // Close the dialog after successful save

    } catch (error: any) {
      console.error('Error analyzing content:', error);
      setError(error?.message || 'Failed to analyze content. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectAnalysis = (analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis);
    setResults(analysis.analysis);
    
    // Initialize expanded state for ideas with market analysis
    if (analysis.market_analysis) {
      const analyzedIdeas = Object.keys(analysis.market_analysis);
      const initialExpandedState = analyzedIdeas.reduce((acc, idea) => ({
        ...acc,
        [idea]: true
      }), {});
      setExpandedAnalyses(initialExpandedState);
    } else {
      setExpandedAnalyses({});
    }
  };

  const handleAnalyzeIdea = async (idea: string) => {
    setAnalyzingIdea(true);
    setSelectedIdea(idea);

    try {
      const response = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze idea');
      }

      const analysis = await response.json();

      // Save the market analysis to Supabase
      if (selectedAnalysis) {
        try {
          const updatedMarketAnalysis = {
            ...(selectedAnalysis.market_analysis || {}),
            [idea]: analysis
          };

          const { data: updatedData, error: updateError } = await supabase
            .from('analyses')
            .update({
              market_analysis: updatedMarketAnalysis
            })
            .eq('id', selectedAnalysis.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          setSelectedAnalysis(updatedData);
          setSavedAnalyses(prev => 
            prev.map(a => a.id === selectedAnalysis.id ? updatedData : a)
          );

        } catch (error) {
          console.error('Error saving market analysis:', error);
          setError('Failed to save market analysis. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error analyzing idea:', error);
      setError('Failed to analyze idea. Please try again.');
    } finally {
      setAnalyzingIdea(false);
    }
  };

  const toggleAnalysis = (idea: string) => {
    setExpandedAnalyses(prev => ({
      ...prev,
      [idea]: !prev[idea]
    }));
  };

  const handleUpdateTitle = async (analysisId: string, analysis: any) => {
    try {
      setUpdatingTitleId(analysisId);
      
      // Generate new title
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          painPoints: analysis.painPoints,
          ideas: analysis.potentialIdeas,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate title');
      
      const { title } = await response.json();
      
      // Update the analysis with new title
      const { error: updateError } = await supabase
        .from('analyses')
        .update({ title })
        .eq('id', analysisId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setSavedAnalyses(prev => 
        prev.map(a => 
          a.id === analysisId ? { ...a, title } : a
        )
      );
      
      console.log('Updated title for analysis:', analysisId, title);
      
    } catch (error) {
      console.error('Error updating title:', error);
      setError('Failed to update title');
    } finally {
      setUpdatingTitleId(null);
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      // First update local state to provide immediate feedback
      setSavedAnalyses(prev => prev.filter(a => a.id !== analysisId));
      
      // If the deleted analysis was selected, clear the selection
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
        setResults(null);
      }

      // Then delete from Supabase
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId);

      if (error) {
        // If deletion fails, revert local state
        console.error('Error deleting from Supabase:', error);
        await loadSavedAnalyses(); // Reload to ensure consistency
        throw error;
      }

      // Reload analyses to ensure consistency
      await loadSavedAnalyses();

    } catch (error) {
      console.error('Error deleting analysis:', error);
      setError('Failed to delete analysis. Please try again.');
    }
  };

  const openInBolt = (idea: string) => {
    if (selectedAnalysis?.market_analysis?.[idea]) {
      // First open git clone URL
      const gitUrl = 'https://github.com/thecodacus/bolt-nextjs-shadcn-template.git';
      window.open(`http://localhost:5173/git?url=${encodeURIComponent(gitUrl)}`, '_blank', 'noopener,noreferrer');

      // Copy prompt to clipboard for pasting after clone
      const prompt = `Idea: ${idea}

Tech Stack:
- Next.js 14 with App Router
- Shadcn UI`;
      navigator.clipboard.writeText(prompt);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        analyses={filteredAnalyses}
        selectedAnalysis={selectedAnalysis}
        onSelectAnalysis={handleSelectAnalysis}
        onDeleteAnalysis={handleDeleteAnalysis}
        onUpdateTitle={handleUpdateTitle}
        updatingTitleId={updatingTitleId}
      >
      </Sidebar>

      <main className="flex-1 flex flex-col h-screen">
        {/* Top Bar */}
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">Analysis Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {error ? (
            <div className="p-4">
              <Card className="bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </Card>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6">
              {error && (
                <div className="text-sm text-red-500 mb-4">
                  {error}
                </div>
              )}

              {analyzing ? (
                <AnalysisShimmer />
              ) : selectedAnalysis ? (
                <div className="flex w-full">
                  {/* Comments Analysis (40%) */}
                  <div className="w-[40%] border-r overflow-auto">
                    <div className="space-y-6 p-4">
                      {/* Summary Card */}
                      <Card className="p-4">
                        <h3 className="font-medium">Summary</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">Total Comments: {selectedAnalysis.analysis.totalComments}</p>
                          <p className="text-sm">Overall Sentiment: {selectedAnalysis.analysis.sentimentScore.toFixed(2)}</p>
                        </div>
                      </Card>

                      {/* Pain Points Card */}
                      <Card className="p-4">
                        <h3 className="font-medium">Pain Points</h3>
                        <div className="mt-4 space-y-4">
                          {selectedAnalysis.analysis.painPoints.map((point, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{point.topic}</h4>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Mentions: {point.count}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Sentiment: {point.sentiment.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="rounded-md bg-muted p-3">
                                <p className="text-sm font-medium text-muted-foreground">Examples:</p>
                                <ul className="mt-2 space-y-1">
                                  {point.examples.map((example, j) => (
                                    <li key={j} className="text-sm">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Ideas Analysis (60%) */}
                  <div className="w-[60%] overflow-auto">
                    <div className="p-4">
                      <Card className="p-4">
                        <h3 className="font-medium">Potential Ideas</h3>
                        <div className="mt-4 space-y-4">
                          {selectedAnalysis.analysis.potentialIdeas.map((idea, i) => (
                            <Card key={i} className="p-4 bg-muted">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1">
                                    <p className="text-sm">{idea}</p>
                                    {selectedAnalysis?.market_analysis?.[idea] && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                        Analyzed
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {selectedAnalysis?.market_analysis?.[idea] && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAnalysis(idea);
                                        }}
                                        className="px-2"
                                      >
                                        {expandedAnalyses[idea] ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (selectedAnalysis?.market_analysis?.[idea]) {
                                          openInBolt(idea);
                                        } else {
                                          handleAnalyzeIdea(idea);
                                        }
                                      }}
                                      disabled={analyzingIdea}
                                      className="whitespace-nowrap"
                                    >
                                      {analyzingIdea && selectedIdea === idea ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Analyzing...
                                        </>
                                      ) : selectedAnalysis?.market_analysis?.[idea] ? (
                                        'Open in Bolt'
                                      ) : (
                                        'Analyze Market'
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {selectedAnalysis?.market_analysis?.[idea] && expandedAnalyses[idea] && (
                                  <div className="mt-4">
                                    <MarketAnalysisContent
                                      analysis={selectedAnalysis.market_analysis[idea]}
                                    />
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No Analysis Selected</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a saved analysis or create a new one to view results
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <NewAnalysisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAnalyze={handleAnalyze}
      />
    </div>
  );
}
