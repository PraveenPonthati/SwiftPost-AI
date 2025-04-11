
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  getChatHistory, 
  getChatMessages, 
  saveChatMessage, 
  createNewChat, 
  deleteChat,
  ChatMessage,
  ChatSession,
  supabase
} from '@/utils/supabaseClient';
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

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Add debug information
        console.log('Supabase client:', supabase);
        console.log('Testing Supabase connection...');
        
        // Test if we can connect to Supabase
        const { data: testData, error: testError } = await supabase
          .from('chat_sessions')
          .select('count')
          .limit(1);
          
        console.log('Connection test result:', { testData, testError });
        
        const history = await getChatHistory();
        console.log('Loaded chat history:', history);
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

  // Handle selecting a chat
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    loadMessages(chatId);
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId: string) => {
    const success = await deleteChat(chatId);
    if (success) {
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setCurrentMessages([]);
      }
    }
  };

  // Handle sending messages
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setLoading(true);
    
    try {
      if (!activeChatId) {
        console.log('Creating new chat...');
        const newChat = await createNewChat();
        console.log('New chat created:', newChat);
        if (!newChat) {
          setLoading(false);
          return;
        }
        setActiveChatId(newChat.id);
        setChatHistory(prev => [newChat, ...prev]);
      }

      const chatId = activeChatId as string;
      
      // Save user message
      const userMessage: ChatMessage = {
        chat_id: chatId,
        role: 'user',
        content: message
      };
      
      // Update UI optimistically
      setCurrentMessages(prev => [...prev, userMessage]);
      
      // Save to database
      console.log('Saving user message:', userMessage);
      const savedMessage = await saveChatMessage(userMessage);
      console.log('User message saved:', savedMessage);
      
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
      console.log('Saving assistant message:', assistantMessage);
      const savedAssistantMessage = await saveChatMessage(assistantMessage);
      console.log('Assistant message saved:', savedAssistantMessage);
      
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
