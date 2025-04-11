
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ChatHistory from '@/components/content/ChatHistory';
import { ChatSession } from '@/utils/supabaseClient';

interface ChatSidebarProps {
  chatHistory: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => Promise<void>;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => Promise<void>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatHistory,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat
}) => {
  return (
    <div className="w-64 border-r bg-muted/30 p-4 flex flex-col h-screen fixed left-0 top-0 pt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Chat History</h2>
        <Button variant="ghost" size="sm" onClick={onNewChat}>
          <PlusCircle className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>
      
      <ChatHistory 
        history={chatHistory.map(chat => ({
          id: chat.id,
          title: chat.title,
          created_at: chat.created_at,
          preview: ''
        }))}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
        activeChat={activeChatId || undefined}
      />
    </div>
  );
};

export default ChatSidebar;
