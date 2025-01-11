import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Analyze this idea for micro-SaaS potential. Focus on finding a very specific niche problem that can be solved with a simple, focused solution.

Idea: ${idea}

Analyze and provide:
1. Niche Market: Identify a specific subset of users or businesses with this pain point
2. Similar Solutions: Focus on small, successful micro-SaaS products (not large companies)
3. Market Potential: Estimate monthly recurring revenue potential for a micro-SaaS in this space
4. Key Features: List 3-5 core features that solve the specific pain point (keep it minimal)
5. Monetization: Suggest pricing model and target price point for a micro-SaaS solution

Format the response as JSON with these fields:
{
  "similarApps": [{"name": "string", "description": "string", "url": "string"}],
  "marketPotential": {
    "size": "string (focus on realistic MRR for a micro-SaaS)",
    "growth": "string (market trend)",
    "opportunities": ["string"]
  },
  "keyDifferentiators": ["string (specific features)"],
  "challenges": ["string"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a market research expert specializing in technology products and startups. Provide detailed, data-driven analysis in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // Parse the response to ensure it's valid JSON
    const analysis = JSON.parse(content);

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Error in analyze-idea API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze idea' },
      { status: 500 }
    );
  }
}
