
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

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

// Export the supabase client from the integrations directory
export { supabase };

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('chat_sessions').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      toast({
        title: 'Database Connection Error',
        description: `Could not connect to Supabase: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
    
    console.log('Supabase connection successful!', data);
    return true;
  } catch (err: any) {
    console.error('Unexpected error testing Supabase connection:', err);
    toast({
      title: 'Database Connection Error',
      description: err.message || 'An unexpected error occurred',
      variant: 'destructive',
    });
    return false;
  }
};

// Helper function to generate a title from prompt text
export const generateTitleFromPrompt = (prompt: string, maxLength: number = 50): string => {
  // Remove special characters and extra spaces
  const cleanPrompt = prompt.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  
  // If prompt is short enough, use it directly
  if (cleanPrompt.length <= maxLength) {
    return cleanPrompt;
  }
  
  // Extract important words (nouns, verbs, etc.) - we'll just take first few words for simplicity
  const words = cleanPrompt.split(' ');
  const importantWords = words.slice(0, 5);
  
  return importantWords.join(' ') + (words.length > 5 ? '...' : '');
};

// Chat History functions
export const createNewChat = async (initialTitle: string = 'New Chat'): Promise<ChatSession | null> => {
  try {
    console.log('Creating new chat with title:', initialTitle);
    
    const newChat = {
      title: initialTitle,
      updated_at: new Date().toISOString()
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
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
    
    console.log('Successfully created new chat:', data);
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
    console.log('Fetching chat history...');
    let query = supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Failed to load chat history',
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }
    
    console.log('Successfully fetched chat history:', data);
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
    console.log(`Fetching messages for chat ${chatId}...`);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat-id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      toast({
        title: 'Failed to load chat messages',
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} messages for chat ${chatId}`);
    
    // Transform data to match the ChatMessage interface
    const messages: ChatMessage[] = data.map(item => ({
      id: item.id,
      chat_id: item['chat-id'], // Map from database column to interface property
      role: item.role as 'user' | 'assistant',
      content: item.content,
      created_at: item.created_at
    }));
    
    return messages;
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
    console.log('Saving chat message:', message);
    
    // Transform to match the database column name
    const dbMessage = {
      'chat-id': message.chat_id, // Map from interface property to database column
      content: message.content,
      role: message.role
    };
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([dbMessage])
      .select()
      .single();

    if (error) {
      console.error('Error saving chat message:', error);
      toast({
        title: 'Failed to save message',
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
    
    console.log('Successfully saved chat message:', data);
    
    // Update the timestamp on the chat session
    const updateResult = await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.chat_id);
      
    if (updateResult.error) {
      console.error('Error updating chat timestamp:', updateResult.error);
    }
    
    // Transform response to match ChatMessage interface
    const savedMessage: ChatMessage = {
      id: data.id,
      chat_id: data['chat-id'], // Map from database column to interface property
      role: data.role as 'user' | 'assistant',
      content: data.content,
      created_at: data.created_at
    };
    
    return savedMessage;
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
    console.log(`Updating title for chat ${chatId} to "${title}"`);
    const { error } = await supabase
      .from('chat_sessions')
      .update({ 
        title,
        updated_at: new Date().toISOString() 
      })
      .eq('id', chatId);

    if (error) {
      console.error('Error updating chat title:', error);
      toast({
        title: 'Failed to update chat title',
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
    
    console.log(`Successfully updated title for chat ${chatId}`);
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
    console.log(`Deleting chat ${chatId}...`);
    
    // Delete all messages in this chat
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('chat-id', chatId);

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
        description: `Database error: ${sessionError.message}`,
        variant: 'destructive',
      });
      return false;
    }
    
    console.log(`Successfully deleted chat ${chatId}`);
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
