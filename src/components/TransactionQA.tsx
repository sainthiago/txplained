'use client';

import { useState } from 'react';
import { Send, MessageCircle, Sparkles, User, Bot, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface QAMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface TransactionQAProps {
  txHash: string;
  chainName?: string;
}

export function TransactionQA({ txHash, chainName }: TransactionQAProps) {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const suggestedQuestions = [
    "What are the risks involved in this transaction?",
    "Could this transaction have been optimized for lower fees?",
    "What does this transaction tell us about the user's behavior?",
    "Are there any red flags I should be aware of?",
    "How does this transaction compare to typical transactions on this chain?",
    "What would have happened if this transaction failed?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: QAMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          txHash, 
          question: userMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.statusText}`);
      }

      const data = await response.json();

      const assistantMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || data.explanation || 'I apologize, but I couldn\'t provide an answer to that question.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Q&A error:', error);
      const errorMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while trying to answer your question. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full mb-6 group"
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ask About This Transaction
            </h3>
            <Sparkles className="h-4 w-4 text-yellow-500" />
            {messages.length > 0 && (
              <span className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                {messages.filter(m => m.type === 'user').length} questions
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
              {isExpanded ? 'Collapse' : 'Ask Questions'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-6">
            {/* Suggested Questions */}
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Suggested questions to get you started:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-left p-3 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                    >
                      💡 {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation */}
            {messages.length > 0 && (
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-indigo-100 dark:bg-indigo-900'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div
                      className={`flex-1 p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {message.content}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Analyzing your question...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about this transaction..."
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isLoading ? 'Asking...' : 'Ask'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 