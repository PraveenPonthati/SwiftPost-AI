
import React, { useEffect } from 'react';
import { Separator } from "@/components/ui/separator";
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/use-chat';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/utils/supabaseClient';

const AIChat = () => {
  const {
    loading,
    chatHistory,
    currentMessages,
    activeChatId,
    provider,
    setProvider,
    selectedModel,
    setSelectedModel,
    availableModels,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleSendMessage
  } = useChat();

  // Check connection to Supabase on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test if we can connect to Supabase
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('count')
          .limit(1);
          
        if (error) {
          console.error('Failed to connect to Supabase:', error);
          toast({
            title: 'Database Connection Error',
            description: 'Could not connect to the database. Chat history may not be saved.',
            variant: 'destructive',
          });
        } else {
          console.log('Successfully connected to Supabase database');
        }
      } catch (err) {
        console.error('Exception checking Supabase connection:', err);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Chat history sidebar */}
      <ChatSidebar
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      
      {/* Main chat area */}
      <div className="ml-64 flex-1 flex flex-col h-screen pt-16 pb-4">
        {/* Chat messages */}
        <ChatMessages 
          messages={currentMessages}
          loading={loading} 
        />
        
        <Separator />
        
        {/* Message input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          loading={loading}
          provider={provider}
          setProvider={setProvider}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          availableModels={availableModels}
        />
      </div>
    </div>
  );
};

export default AIChat;
