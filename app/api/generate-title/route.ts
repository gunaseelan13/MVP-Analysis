import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { ideas, painPoints } = await request.json();

    const prompt = `Based on the following analysis of user feedback, generate a concise and descriptive title (max 5 words) that captures the main theme or focus:

Pain Points:
${painPoints.map((point: any) => `- ${point.topic} (${point.count} mentions)`).join('\n')}

Potential Ideas:
${ideas.map((idea: string) => `- ${idea}`).join('\n')}

Generate only the title, nothing else. Make it specific and descriptive.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    const title = data.choices[0].message.content.trim();

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
