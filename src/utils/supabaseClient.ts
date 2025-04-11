
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Types for chat messages and history
export interface ChatMessage {
  id?: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// Initialize Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Get Supabase client
const getClient = () => {
  const client = createSupabaseClient();
  if (!client) {
    toast({
      title: 'Supabase Connection Error',
      description: 'Please check your Supabase credentials in the .env file.',
      variant: 'destructive',
    });
  }
  return client;
};

// Chat History functions
export const createNewChat = async (initialTitle: string = 'New Chat'): Promise<ChatSession | null> => {
  const supabase = getClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ title: initialTitle }])
    .select()
    .single();

  if (error) {
    console.error('Error creating new chat:', error);
    toast({
      title: 'Failed to create chat',
      description: error.message,
      variant: 'destructive',
    });
    return null;
  }
  
  return data;
};

export const getChatHistory = async (): Promise<ChatSession[]> => {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat history:', error);
    toast({
      title: 'Failed to load chat history',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }
  
  return data || [];
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    toast({
      title: 'Failed to load chat messages',
      description: error.message,
      variant: 'destructive',
    });
    return [];
  }
  
  return data || [];
};

export const saveChatMessage = async (message: ChatMessage): Promise<ChatMessage | null> => {
  const supabase = getClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('chat_messages')
    .insert([message])
    .select()
    .single();

  if (error) {
    console.error('Error saving chat message:', error);
    toast({
      title: 'Failed to save message',
      description: error.message,
      variant: 'destructive',
    });
    return null;
  }
  
  // Update the timestamp on the chat session
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', message.chat_id);
  
  return data;
};

export const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
  const supabase = getClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('chat_sessions')
    .update({ title })
    .eq('id', chatId);

  if (error) {
    console.error('Error updating chat title:', error);
    toast({
      title: 'Failed to update chat title',
      description: error.message,
      variant: 'destructive',
    });
    return false;
  }
  
  return true;
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  const supabase = getClient();
  if (!supabase) return false;

  // Delete all messages in this chat
  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('chat_id', chatId);

  if (messagesError) {
    console.error('Error deleting chat messages:', messagesError);
    return false;
  }

  // Delete the chat session
  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', chatId);

  if (sessionError) {
    console.error('Error deleting chat session:', sessionError);
    toast({
      title: 'Failed to delete chat',
      description: sessionError.message,
      variant: 'destructive',
    });
    return false;
  }
  
  return true;
};
