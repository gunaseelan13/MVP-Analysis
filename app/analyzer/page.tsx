'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
}

export default function AnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Split content into lines and filter out empty ones
      const comments = content
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      console.log(`Processing ${comments.length} lines of text`);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze text');
      }

      console.log('Analysis completed successfully');
      setResults(data);
    } catch (err: any) {
      console.error('Error analyzing text:', err);
      setError(err.message || 'Failed to analyze text. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Comment Analyzer</h1>
      
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Paste Comments</h2>
          <p className="text-gray-600">
            Paste your comments (one per line) and click analyze to discover pain points and potential business opportunities
          </p>
          
          <div className="space-y-4">
            <textarea
              className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste your comments here, one per line..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={analyzing}
            />

            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !content.trim()}
              className="w-full"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Comments'}
            </Button>

            {error && (
              <div className="text-red-500 text-sm p-4 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {analyzing && (
              <div className="text-blue-500 text-sm p-4 bg-blue-50 rounded-md">
                Analyzing your comments... This may take a few moments.
              </div>
            )}
          </div>
        </div>
      </Card>

      {results && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Summary</h3>
              <p>Total Comments: {results.totalComments}</p>
              <p>Overall Sentiment: {results.sentimentScore.toFixed(2)}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Pain Points</h3>
              <div className="grid gap-3">
                {results.painPoints.map((point, i) => (
                  <div key={i} className="border p-3 rounded">
                    <p className="font-medium">{point.topic}</p>
                    <p>Mentions: {point.count}</p>
                    <p>Sentiment: {point.sentiment.toFixed(2)}</p>
                    <div className="mt-2">
                      <p className="font-medium">Examples:</p>
                      <ul className="list-disc list-inside">
                        {point.examples.map((ex, j) => (
                          <li key={j} className="text-sm text-gray-600">{ex}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Potential Ideas</h3>
              <ul className="list-disc list-inside">
                {results.potentialIdeas.map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
