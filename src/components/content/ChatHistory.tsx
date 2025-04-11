
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ChatHistoryItem {
  id: string;
  title: string;
  created_at: string;
  preview: string;
}

interface ChatHistoryProps {
  history: ChatHistoryItem[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  activeChat?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  history,
  onSelectChat,
  onDeleteChat,
  activeChat,
}) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="h-12 w-12 mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No chat history found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-180px)] pr-4">
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer group transition-colors ${
              activeChat === item.id
                ? 'bg-primary/10 border-primary/20'
                : 'hover:bg-accent'
            }`}
            onClick={() => onSelectChat(item.id)}
          >
            <div className="truncate">
              <p className="font-medium truncate">{item.title || 'New Chat'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(item.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatHistory;
