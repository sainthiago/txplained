import { User, Bot, Loader2, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`p-4 rounded-lg ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{message.content}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Transaction Hash Display */}
              {message.transactionHash && (
                <div className="flex items-center gap-2 text-sm opacity-75">
                  <ExternalLink className="w-3 h-3" />
                  <span className="font-mono text-xs">
                    {message.transactionHash.slice(0, 10)}...{message.transactionHash.slice(-8)}
                  </span>
                </div>
              )}
              
              {/* Analysis Details */}
              {message.analysis && (
                <div className="mt-4 space-y-3 border-t border-slate-200 dark:border-slate-600 pt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">Action</div>
                      <div className="text-sm">{message.analysis.action}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">Result</div>
                      <div className="text-sm">{message.analysis.result}</div>
                    </div>
                  </div>
                  
                  {message.analysis.details.length > 0 && (
                    <div>
                      <div className="font-semibold text-sm mb-1">Details</div>
                      <ul className="text-sm space-y-1">
                        {message.analysis.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-slate-400 mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.analysis.riskFlags.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <div className="font-semibold text-sm text-amber-800 dark:text-amber-200">Risk Flags</div>
                      </div>
                      <ul className="text-sm space-y-1">
                        {message.analysis.riskFlags.map((flag, index) => (
                          <li key={index} className="text-amber-700 dark:text-amber-300">
                            • {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div>Gas Used: {message.analysis.gasInfo.used}</div>
                    <div>Gas Price: {message.analysis.gasInfo.price}</div>
                    <div>Total Cost: {message.analysis.gasInfo.total}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
      )}
    </div>
  );
} 