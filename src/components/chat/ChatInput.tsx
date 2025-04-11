
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, SendHorizontal, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
  provider: 'openai' | 'gemini' | 'mock';
  setProvider: (provider: 'openai' | 'gemini' | 'mock') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  loading,
  provider,
  setProvider,
  selectedModel,
  setSelectedModel,
  availableModels,
}) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Store the message locally since we'll clear the input
    const currentMessage = message;
    setMessage('');
    
    // Call the parent handler
    await onSendMessage(currentMessage);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <Select
          value={provider}
          onValueChange={(value) => setProvider(value as 'openai' | 'gemini' | 'mock')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="mock">Demo Mode</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map(model => (
              <SelectItem key={model} value={model}>
                {model.replace('models/', '')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon" asChild>
          <a href="/settings">
            <Settings className="h-4 w-4" />
          </a>
        </Button>
      </div>
      
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={loading || !message.trim()}
          size="icon" 
          className="h-10 w-10"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizontal className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
