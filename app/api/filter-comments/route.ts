import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured');
    }

    const prompt = `Extract only the user comments and discussions from the following content. Return ONLY the comments, one per line. Do not include any other text, formatting, or explanations.

Content:
${content}

Instructions:
- Extract only actual user comments and discussions
- Include one comment per line
- Do not include any formatting, headers, or explanations
- Do not categorize or label the comments
- Return only the text of the comments`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a comment extractor. Return only the actual comments, one per line, with no additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const comments = completion.choices[0].message.content;
    if (!comments) {
      throw new Error('No comments extracted');
    }

    return NextResponse.json({ comments: comments.split('\n').filter(Boolean) });

  } catch (error: any) {
    console.error('Error in filter-comments API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to filter comments' },
      { status: 500 }
    );
  }
}
