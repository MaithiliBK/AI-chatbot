'use client';

import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleImageUpload = (base64Image: string) => {
    setUploadedImage(base64Image);
    setShowImageUpload(false); // Hide the upload component after successful upload
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          image: uploadedImage // Include the image if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      setUploadedImage(null); // Clear the image after sending
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI Chat Assistant
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Welcome! Ask me anything or attach an image to discuss.
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[80%]">
                AI is thinking...
              </div>
            )}
          </div>
          
          <div className="border-t p-4">
            {showImageUpload && (
              <div className="mb-4">
                <ImageUpload onImageUpload={handleImageUpload} />
              </div>
            )}

            {uploadedImage && (
              <div className="mb-4 relative">
                <img 
                  src={`data:image/jpeg;base64,${uploadedImage}`}
                  alt="Uploaded preview"
                  className="max-h-32 rounded-lg"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            <form onSubmit={sendMessage} className="flex gap-2">
              <div className="flex-1 flex gap-2 items-center border rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 p-2 focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Attach image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading || !input.trim()}
              >
                <span>Send</span>
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
              </button>
            </form>
            
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
