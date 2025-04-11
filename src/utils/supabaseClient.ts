
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

// Initialize Supabase client with provided keys directly
const supabaseUrl = 'https://hnnzwjwezfdyqqarfigv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhubnp3andlemZkeXFxYXJmaWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjc3MzQsImV4cCI6MjA1OTk0MzczNH0.4Zfn23r1bwrSvbxMUn89670-ofPqVx721GT5jzivFgM';

// Create a single supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);

// Chat History functions
export const createNewChat = async (initialTitle: string = 'New Chat'): Promise<ChatSession | null> => {
  try {
    const newChat = {
      title: initialTitle,
    };

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([newChat])
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
  } catch (error: any) {
    console.error('Exception creating new chat:', error);
    toast({
      title: 'Failed to create chat',
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return null;
  }
};

export const getChatHistory = async (): Promise<ChatSession[]> => {
  try {
    let query = supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    
    const { data, error } = await query;

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
  } catch (error: any) {
    console.error('Exception fetching chat history:', error);
    toast({
      title: 'Failed to load chat history',
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return [];
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
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
  } catch (error: any) {
    console.error('Exception fetching chat messages:', error);
    toast({
      title: 'Failed to load chat messages',
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return [];
  }
};

export const saveChatMessage = async (message: ChatMessage): Promise<ChatMessage | null> => {
  try {
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
  } catch (error: any) {
    console.error('Exception saving chat message:', error);
    toast({
      title: 'Failed to save message',
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return null;
  }
};

export const updateChatTitle = async (chatId: string, title: string): Promise<boolean> => {
  try {
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
  } catch (error: any) {
    console.error('Exception updating chat title:', error);
    toast({
      title: 'Failed to update chat title',
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return false;
  }
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
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
  } catch (error: any) {
    console.error('Exception deleting chat:', error);
    toast({
      title: 'Failed to delete chat',
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return false;
  }
};
