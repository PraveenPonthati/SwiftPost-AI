
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Export the supabase client from the integrations directory
export { supabase };

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
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

// Types for API keys
export interface ApiKey {
  id: string;
  user_id: string;
  provider: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}

// Save API key to the database
export const saveApiKey = async (provider: string, apiKey: string, userId: string): Promise<boolean> => {
  try {
    console.log(`Saving ${provider} API key for user ${userId}`);
    
    const { error } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: userId,
        provider,
        api_key: apiKey,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      console.error(`Error saving ${provider} API key:`, error);
      toast({
        title: `Failed to save ${provider} API key`,
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
    
    console.log(`Successfully saved ${provider} API key`);
    return true;
  } catch (error: any) {
    console.error(`Exception saving ${provider} API key:`, error);
    toast({
      title: `Failed to save ${provider} API key`,
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return false;
  }
};

// Get API keys for a user
export const getUserApiKeys = async (userId: string): Promise<ApiKey[]> => {
  try {
    console.log(`Fetching API keys for user ${userId}...`);
    
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Failed to load API keys',
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} API keys for user ${userId}`);
    return data || [];
  } catch (error: any) {
    console.error('Exception fetching API keys:', error);
    toast({
      title: 'Failed to load API keys',
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return [];
  }
};

// Get a specific API key for a user
export const getUserApiKey = async (userId: string, provider: string): Promise<string | null> => {
  try {
    console.log(`Fetching ${provider} API key for user ${userId}...`);
    
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // No rows returned
        console.error(`Error fetching ${provider} API key:`, error);
        toast({
          title: `Failed to load ${provider} API key`,
          description: `Database error: ${error.message}`,
          variant: 'destructive',
        });
      }
      return null;
    }
    
    console.log(`Successfully fetched ${provider} API key`);
    return data?.api_key || null;
  } catch (error: any) {
    console.error(`Exception fetching ${provider} API key:`, error);
    toast({
      title: `Failed to load ${provider} API key`,
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return null;
  }
};

// Delete an API key
export const deleteApiKey = async (userId: string, provider: string): Promise<boolean> => {
  try {
    console.log(`Deleting ${provider} API key for user ${userId}...`);
    
    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) {
      console.error(`Error deleting ${provider} API key:`, error);
      toast({
        title: `Failed to delete ${provider} API key`,
        description: `Database error: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
    
    console.log(`Successfully deleted ${provider} API key`);
    return true;
  } catch (error: any) {
    console.error(`Exception deleting ${provider} API key:`, error);
    toast({
      title: `Failed to delete ${provider} API key`,
      description: error.message || 'Unknown error occurred',
      variant: 'destructive',
    });
    return false;
  }
};

