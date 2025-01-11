import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // Format the URL for Jina
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    // Fetch website data from Jina
    const response = await fetch(jinaUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch website data');
    }
    
    // Get the raw text first
    const rawText = await response.text();
    console.log('Raw response from Jina:', rawText);

    // Return the raw text for inspection
    return NextResponse.json({ 
      rawText,
      url: jinaUrl 
    });

  } catch (error) {
    console.error('Error processing website:', error);
    return NextResponse.json(
      { error: 'Failed to process website', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
