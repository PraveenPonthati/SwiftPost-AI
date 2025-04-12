import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  ChatMessage,
  ChatSession,
  supabase
} from '@/utils/supabaseClient';
import {
  getChatHistory,
  getChatMessages,
  saveChatMessage,
  createNewChat,
  deleteChat
} from '@/utils/chatService';
import { 
  generateContent, 
  getAvailableModels, 
  getApiKey
} from '@/utils/aiService';

export function useChat() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>('gemini');
  const [selectedModel, setSelectedModel] = useState('models/gemini-2.0-flash');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load available models when provider changes
  useEffect(() => {
    const models = getAvailableModels(provider);
    setAvailableModels(models.map(model => model.id));
    
    // Select first model as default or Gemini 2.0 Flash if available
    if (models.length > 0) {
      if (provider === 'gemini') {
        const flash = models.find(m => m.id === 'models/gemini-2.0-flash');
        setSelectedModel(flash ? flash.id : models[0].id);
      } else {
        setSelectedModel(models[0].id);
      }
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

  // Load chat history from Supabase
  useEffect(() => {
    const loadHistory = async () => {
      try {
        console.log('Loading chat history from Supabase...');
        const history = await getChatHistory();
        console.log(`Loaded ${history.length} chats from database`);
        setChatHistory(history);
        
        // Load the most recent chat if available
        if (history.length > 0 && !activeChatId) {
          console.log(`Setting active chat to most recent: ${history[0].id}`);
          setActiveChatId(history[0].id);
          loadMessages(history[0].id);
        }
      } catch (error) {
        console.error('Failed to load chat history from database', error);
        toast({
          title: 'Failed to Load Chat History',
          description: 'Could not retrieve your chat history from the database.',
          variant: 'destructive'
        });
      }
    };
    
    loadHistory();
  }, []);

  // Load messages for a chat from Supabase
  const loadMessages = async (chatId: string) => {
    try {
      console.log(`Loading messages for chat ${chatId}...`);
      const messages = await getChatMessages(chatId);
      console.log(`Loaded ${messages.length} messages for chat ${chatId}`);
      setCurrentMessages(messages);
    } catch (error) {
      console.error('Failed to load chat messages from database', error);
      toast({
        title: 'Failed to Load Messages',
        description: 'Could not retrieve messages from the database.',
        variant: 'destructive'
      });
    }
  };

  // Start a new chat in Supabase
  const handleNewChat = async () => {
    try {
      console.log('Creating new chat in database...');
      const newChat = await createNewChat();
      if (newChat) {
        console.log(`New chat created with ID: ${newChat.id}`);
        setChatHistory(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setCurrentMessages([]);
      } else {
        console.error('Failed to create new chat - returned null');
      }
    } catch (error) {
      console.error('Failed to create new chat in database', error);
      toast({
        title: 'Failed to Create New Chat',
        description: 'Could not create a new chat in the database.',
        variant: 'destructive'
      });
    }
  };

  // Handle selecting a chat
  const handleSelectChat = (chatId: string) => {
    console.log(`Selecting chat ${chatId}`);
    setActiveChatId(chatId);
    loadMessages(chatId);
  };

  // Handle deleting a chat from Supabase
  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log(`Deleting chat ${chatId} from database...`);
      const success = await deleteChat(chatId);
      if (success) {
        console.log(`Successfully deleted chat ${chatId}`);
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setCurrentMessages([]);
        }
      } else {
        console.error(`Failed to delete chat ${chatId}`);
      }
    } catch (error) {
      console.error('Failed to delete chat from database', error);
      toast({
        title: 'Failed to Delete Chat',
        description: 'Could not delete the chat from the database.',
        variant: 'destructive'
      });
    }
  };

  // Handle sending messages and storing in Supabase
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setLoading(true);
    
    try {
      // Create a new chat in database if needed
      if (!activeChatId) {
        console.log('No active chat, creating new chat in database...');
        const newChat = await createNewChat();
        if (!newChat) {
          console.error('Failed to create new chat - returned null');
          setLoading(false);
          return;
        }
        console.log(`New chat created with ID: ${newChat.id}`);
        setActiveChatId(newChat.id);
        setChatHistory(prev => [newChat, ...prev]);
      }

      const chatId = activeChatId as string;
      
      // Save user message to database
      const userMessage: ChatMessage = {
        chat_id: chatId,
        role: 'user',
        content: message
      };
      
      // Update UI optimistically
      setCurrentMessages(prev => [...prev, userMessage]);
      
      // Save to database
      console.log('Saving user message to database:', userMessage);
      const savedMessage = await saveChatMessage(userMessage);
      if (!savedMessage) {
        console.error('Failed to save user message to database');
      } else {
        console.log(`User message saved with ID: ${savedMessage.id}`);
      }
      
      // Generate AI response
      console.log(`Generating AI response using ${provider} model: ${selectedModel}`);
      const response = await generateContent({
        prompt: message,
        provider,
        model: selectedModel,
        tone: 'professional'
      });
      
      // Save AI response to database
      const assistantMessage: ChatMessage = {
        chat_id: chatId,
        role: 'assistant',
        content: response
      };
      
      // Save to database
      console.log('Saving assistant message to database:', assistantMessage);
      const savedAssistantMessage = await saveChatMessage(assistantMessage);
      if (!savedAssistantMessage) {
        console.error('Failed to save assistant message to database');
      } else {
        console.log(`Assistant message saved with ID: ${savedAssistantMessage.id}`);
      }
      
      // Update UI with AI response
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

  return {
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
  };
}
