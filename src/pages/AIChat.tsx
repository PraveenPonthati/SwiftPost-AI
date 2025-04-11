
import React, { useEffect } from 'react';
import { Separator } from "@/components/ui/separator";
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/use-chat';
import { toast } from '@/hooks/use-toast';
import { supabase, testSupabaseConnection } from '@/utils/supabaseClient';

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
        // Test connection to Supabase
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          console.log('Connection to Supabase confirmed');
          toast({
            title: 'Database Connection Established',
            description: 'Successfully connected to Supabase database.',
          });
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
