import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type MessageContent = 
  | string 
  | { type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }[];

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 }
      );
    }

    // Add system message
    const systemMessage: Message = {
      role: 'system',
      content: 'You are a helpful AI assistant that can analyze images and answer questions about them.'
    };

    // Prepare messages array
    let messages: Message[] = [systemMessage];

    // If there's an image, add it to the first user message
    if (body.image) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${body.image}`
            }
          }
        ]
      });
    }

    // Add the conversation messages
    messages = messages.concat(body.messages);

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any, // Type assertion needed due to OpenAI types limitation
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Return the response
    return NextResponse.json({
      message: completion.choices[0].message.content
    });

  } catch (error: any) {
    console.error('API Error:', error);

    // Handle specific error cases
    if (error.code === 'model_not_found') {
      return NextResponse.json(
        { error: 'The GPT-4o-mini model is not available or you do not have access to it' },
        { status: 500 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 500 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 