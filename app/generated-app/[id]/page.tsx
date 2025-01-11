'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type GeneratedApp = {
  id: string;
  created_at: string;
  idea: string;
  content: string;
  market_analysis: any;
};

export default function GeneratedAppPage({
  params,
}: {
  params: { id: string };
}) {
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load app from localStorage
    const storedApps = localStorage.getItem('generated_apps');
    if (storedApps) {
      const apps = JSON.parse(storedApps);
      const foundApp = apps.find((a: GeneratedApp) => a.id === params.id);
      if (foundApp) {
        setApp(foundApp);
      } else {
        setError('Generated app not found');
      }
    } else {
      setError('No generated apps found');
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="p-4">
        <Card className="bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            {error || 'Generated app not found'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Generated App: {app.idea}</h1>
        <Link href="/generated-apps">
          <Button variant="outline">View All Apps</Button>
        </Link>
      </div>
      
      <Tabs defaultValue="blueprint" className="w-full">
        <TabsList>
          <TabsTrigger value="blueprint">App Blueprint</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blueprint">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)] w-full">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{app.content}</ReactMarkdown>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
        
        <TabsContent value="market">
          <Card className="p-6">
            <ScrollArea className="h-[calc(100vh-300px)] w-full">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-4">Similar Apps</h2>
                  <div className="grid gap-4">
                    {app.market_analysis.similarApps.map((similar: any, i: number) => (
                      <Card key={i} className="p-4">
                        <h3 className="font-medium">{similar.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {similar.description}
                        </p>
                        {similar.url && (
                          <a
                            href={similar.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline mt-2 block"
                          >
                            Visit App
                          </a>
                        )}
                      </Card>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">Market Potential</h2>
                  <div className="grid gap-4">
                    <div>
                      <h3 className="font-medium">Market Size</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {app.market_analysis.marketPotential.size}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Growth Potential</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {app.market_analysis.marketPotential.growth}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Opportunities</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {app.market_analysis.marketPotential.opportunities.map(
                          (opportunity: string, i: number) => (
                            <li key={i}>{opportunity}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">Key Differentiators</h2>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {app.market_analysis.keyDifferentiators.map(
                      (differentiator: string, i: number) => (
                        <li key={i}>{differentiator}</li>
                      )
                    )}
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">Challenges</h2>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {app.market_analysis.challenges.map(
                      (challenge: string, i: number) => (
                        <li key={i}>{challenge}</li>
                      )
                    )}
                  </ul>
                </section>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
