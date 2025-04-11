
import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles } from "lucide-react";
import { ChatMessage } from '@/utils/supabaseClient';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loading }) => {
  return (
    <ScrollArea className="flex-1 p-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Sparkles className="h-12 w-12 mb-2 text-primary" />
          <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Ask me anything or select a previous conversation from the sidebar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`p-4 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <Card className="p-4 bg-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
              </Card>
            </div>
          )}
        </div>
      )}
    </ScrollArea>
  );
};

export default ChatMessages;
