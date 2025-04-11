
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, 
  SendHorizontal, 
  Sparkles, 
  Loader2,
  Settings
} from "lucide-react";
import ChatHistory from '@/components/content/ChatHistory';
import { 
  getChatHistory, 
  getChatMessages, 
  saveChatMessage, 
  createNewChat, 
  deleteChat,
  ChatMessage,
  ChatSession
} from '@/utils/supabaseClient';
import { 
  generateContent, 
  getAvailableModels, 
  getApiKey
} from '@/utils/aiService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AIChat = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load available models when provider changes
  useEffect(() => {
    const models = getAvailableModels(provider);
    setAvailableModels(models.map(model => model.id));
    
    // Select first model as default
    if (models.length > 0) {
      setSelectedModel(models[0].id);
    }
    
    // Check if API key exists
    if (provider !== 'mock') {
      const apiKey = getApiKey(provider);
      if (!apiKey) {
        toast({
          title: `No ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key`,
          description: `Please add your API key in Settings to use ${provider === 'openai' ? 'OpenAI' : 'Gemini'} models.`,
          variant: "destructive"
        });
      }
    }
  }, [provider, toast]);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory();
        setChatHistory(history);
        
        // Load the most recent chat if available
        if (history.length > 0 && !activeChatId) {
          setActiveChatId(history[0].id);
          loadMessages(history[0].id);
        }
      } catch (error) {
        console.error('Failed to load chat history', error);
      }
    };
    
    loadHistory();
  }, []);

  // Load messages for a chat
  const loadMessages = async (chatId: string) => {
    try {
      const messages = await getChatMessages(chatId);
      setCurrentMessages(messages);
    } catch (error) {
      console.error('Failed to load chat messages', error);
    }
  };

  // Start a new chat
  const handleNewChat = async () => {
    try {
      const newChat = await createNewChat();
      if (newChat) {
        setChatHistory(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setCurrentMessages([]);
      }
    } catch (error) {
      console.error('Failed to create new chat', error);
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!activeChatId) {
      const newChat = await createNewChat();
      if (!newChat) return;
      setActiveChatId(newChat.id);
      setChatHistory(prev => [newChat, ...prev]);
    }

    setLoading(true);
    const chatId = activeChatId as string;
    
    // Save user message
    const userMessage: ChatMessage = {
      chat_id: chatId,
      role: 'user',
      content: message
    };
    
    // Update UI optimistically
    setCurrentMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    try {
      // Save to database
      await saveChatMessage(userMessage);
      
      // Generate AI response
      const response = await generateContent({
        prompt: message,
        provider,
        model: selectedModel,
        tone: 'professional'
      });
      
      // Save AI response
      const assistantMessage: ChatMessage = {
        chat_id: chatId,
        role: 'assistant',
        content: response
      };
      
      // Save to database
      await saveChatMessage(assistantMessage);
      
      // Update UI
      setCurrentMessages(prev => [...prev, assistantMessage]);
      
      // Refresh history to update timestamps
      const updatedHistory = await getChatHistory();
      setChatHistory(updatedHistory);
    } catch (error: any) {
      console.error('Error in chat process:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process your message',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Chat history sidebar */}
      <div className="w-64 border-r bg-muted/30 p-4 flex flex-col h-screen fixed left-0 top-0 pt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Chat History</h2>
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
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
          onSelectChat={(chatId) => {
            setActiveChatId(chatId);
            loadMessages(chatId);
          }}
          onDeleteChat={async (chatId) => {
            const success = await deleteChat(chatId);
            if (success) {
              setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
              if (activeChatId === chatId) {
                setActiveChatId(null);
                setCurrentMessages([]);
              }
            }
          }}
          activeChat={activeChatId || undefined}
        />
      </div>
      
      {/* Main chat area */}
      <div className="ml-64 flex-1 flex flex-col h-screen pt-16 pb-4">
        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4">
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Sparkles className="h-12 w-12 mb-2 text-primary" />
              <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Ask me anything or select a previous conversation from the sidebar.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentMessages.map((msg, index) => (
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
        
        <Separator />
        
        {/* Message input */}
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
                  <SelectItem key={model} value={model}>{model}</SelectItem>
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
      </div>
    </div>
  );
};

export default AIChat;
