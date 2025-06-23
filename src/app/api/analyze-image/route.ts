import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What do you see in this image? Please provide a detailed description."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error('No analysis generated');
    }

    return NextResponse.json({ analysis: response.choices[0].message.content });
    
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    let errorMessage = 'Error analyzing image';
    
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded';
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'Rate limit exceeded, please try again later';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key';
    } else if (error.code === 'model_not_found') {
      errorMessage = 'Please make sure you have access to GPT-4 Vision Preview in your OpenAI account';
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 