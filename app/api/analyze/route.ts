import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

function splitContentIntoChunks(content: string, maxChunkSize: number = 12000): string[] {
  // Split content into paragraphs or comments
  const paragraphs = content.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the chunk size, start a new chunk
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
  }

  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function analyzeChunk(chunk: string): Promise<any> {
  const prompt = `Analyze these user comments to identify potential micro-SaaS opportunities. Focus on finding specific, niche problems that can be solved with a simple software solution.

Comments:
${chunk}

Analyze the comments and identify:
1. Pain Points: Look for specific, recurring problems that affect a niche group of users
2. Micro-SaaS Ideas: For each major pain point, suggest a focused SaaS solution that:
   - Solves one specific problem well
   - Can be built by a small team
   - Has clear monetization potential
   - Could reach $5k-20k MRR

Format the response as JSON with these fields:
{
  "painPoints": [
    {
      "topic": "string (specific niche problem)",
      "count": number (mentions),
      "sentiment": number (-1 to 1),
      "examples": ["string (relevant comment excerpts)"]
    }
  ],
  "potentialIdeas": [
    "string (each idea should be a specific micro-SaaS solution, not a generic app idea. Format: 'A [type] tool for [specific user] to [solve specific problem]')"
  ],
  "sentimentScore": number,
  "totalComments": number
}`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4-1106-preview",
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

function mergeAnalyses(analyses: any[]): any {
  if (analyses.length === 0) return null;
  if (analyses.length === 1) return analyses[0];

  const merged = {
    painPoints: [],
    potentialIdeas: new Set<string>(),
    sentimentScore: 0,
    totalComments: 0,
  };

  // Helper to find existing pain point
  const findPainPoint = (topic: string) => 
    merged.painPoints.find(p => p.topic.toLowerCase() === topic.toLowerCase());

  // Process each analysis
  for (const analysis of analyses) {
    // Merge pain points
    for (const painPoint of analysis.painPoints) {
      const existing = findPainPoint(painPoint.topic);
      if (existing) {
        existing.count += painPoint.count;
        existing.sentiment = (existing.sentiment * existing.count + painPoint.sentiment * painPoint.count) / (existing.count + painPoint.count);
        existing.examples = [...new Set([...existing.examples, ...painPoint.examples])];
      } else {
        merged.painPoints.push({ ...painPoint });
      }
    }

    // Merge ideas (using Set to avoid duplicates)
    analysis.potentialIdeas.forEach(idea => merged.potentialIdeas.add(idea));

    // Update totals
    merged.totalComments += analysis.totalComments;
    merged.sentimentScore += analysis.sentimentScore * analysis.totalComments;
  }

  // Calculate final sentiment score
  merged.sentimentScore = merged.sentimentScore / merged.totalComments;

  // Convert ideas Set back to array
  merged.potentialIdeas = Array.from(merged.potentialIdeas);

  // Sort pain points by count
  merged.painPoints.sort((a, b) => b.count - a.count);

  return merged;
}

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content format' },
        { status: 400 }
      );
    }

    console.log('Processing content for analysis');
    const chunks = splitContentIntoChunks(content);
    console.log(`Split content into ${chunks.length} chunks`);

    try {
      const analyses = await Promise.all(chunks.map(analyzeChunk));
      console.log(`Successfully analyzed ${chunks.length} chunks`);

      const mergedAnalysis = mergeAnalyses(analyses);
      console.log('Successfully merged analyses');

      return NextResponse.json(mergedAnalysis);
    } catch (analysisError: any) {
      console.error('Error in analysis:', analysisError);
      throw new Error('Failed to analyze content: ' + (analysisError.message || 'Unknown error'));
    }
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
