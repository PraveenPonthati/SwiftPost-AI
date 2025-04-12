
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type AIModel = {
  id: string;
  name: string;
  provider: 'openai' | 'gemini';
}

export interface GenerationOptions {
  prompt: string;
  topic?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  provider?: 'openai' | 'gemini' | 'mock';
  model?: string;
}

// Available models by provider
const OPENAI_MODELS: AIModel[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', provider: 'openai' },
];

const GEMINI_MODELS: AIModel[] = [
  { id: 'models/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
  { id: 'models/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini' },
  { id: 'models/gemini-pro', name: 'Gemini Pro', provider: 'gemini' },
  { id: 'models/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' }, // Added new Gemini 2.0 Flash
];

// Get available models for a provider
export const getAvailableModels = (provider: 'openai' | 'gemini' | 'mock'): AIModel[] => {
  switch (provider) {
    case 'openai':
      return OPENAI_MODELS;
    case 'gemini':
      return GEMINI_MODELS;
    default:
      return [];
  }
};

// API key management
export const getApiKey = async (provider: 'openai' | 'gemini' | 'mock'): Promise<string> => {
  // For mock provider, no API key is needed
  if (provider === 'mock') {
    return 'mock-key';
  }
  
  try {
    // First check if we are authenticated and can get the API key from the database
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', session.user.id)
        .eq('provider', provider)
        .single();
      
      if (data && !error) {
        return data.api_key;
      }
    }
  } catch (error) {
    console.error('Error fetching API key from database:', error);
    // Fall back to localStorage
  }
  
  // Fall back to localStorage if not authenticated or if there was an error
  const key = localStorage.getItem(`${provider}_api_key`);
  return key || '';
};

export const saveApiKey = (provider: 'openai' | 'gemini', apiKey: string): void => {
  localStorage.setItem(`${provider}_api_key`, apiKey);
  
  // If we're authenticated, also save to the database
  const saveToDb = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase.from('user_api_keys').upsert({
        user_id: session.user.id,
        provider,
        api_key: apiKey
      }, { onConflict: 'user_id,provider' });
    }
  };
  
  // Try to save to database but don't block
  saveToDb().catch(error => {
    console.error(`Error saving ${provider} API key to database:`, error);
  });
};

// Function to generate content using the selected provider
export const generateContent = async (options: GenerationOptions): Promise<string> => {
  const { 
    prompt, 
    provider = 'mock', 
    model = 'default',
    topic = '', 
    tone = 'professional', 
    length = 'medium', 
    includeHashtags = false 
  } = options;
  
  console.log('Generating content with options:', { ...options, model });
  
  // Actual provider integrations
  if (provider === 'openai') {
    return generateWithOpenAI(prompt, { topic, tone, length, includeHashtags, model });
  } else if (provider === 'gemini') {
    return generateWithGemini(prompt, { topic, tone, length, includeHashtags, model });
  } else {
    // Fall back to mock for demo purposes
    return generateMockContent(prompt, { topic, tone, length, includeHashtags });
  }
};

// OpenAI integration
const generateWithOpenAI = async (
  prompt: string, 
  options: { topic: string; tone: string; length: string; includeHashtags: boolean; model: string }
): Promise<string> => {
  const apiKey = await getApiKey('openai');
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add your API key in Settings.');
  }

  try {
    // Use the selected model, or fall back to gpt-4o-mini if not specified
    const selectedModel = options.model && options.model !== 'default' 
      ? options.model 
      : 'gpt-4o-mini';
      
    console.log(`Using OpenAI model: ${selectedModel}`);
      
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that creates social media content. 
                     Topic: ${options.topic || 'general'}.
                     Tone: ${options.tone}.
                     Length: ${options.length}.
                     ${options.includeHashtags ? 'Include relevant hashtags.' : 'Do not include hashtags.'}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.length === 'short' ? 100 : options.length === 'medium' ? 200 : 400
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API Error');
    }
    
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

// Gemini integration
const generateWithGemini = async (
  prompt: string, 
  options: { topic: string; tone: string; length: string; includeHashtags: boolean; model: string }
): Promise<string> => {
  const apiKey = await getApiKey('gemini');
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add your API key in Settings.');
  }

  try {
    // Use the selected model, or fall back to gemini-2.0-flash if not specified
    const selectedModel = options.model && options.model !== 'default' 
      ? options.model 
      : 'models/gemini-2.0-flash'; // Using the newer model as default
      
    console.log(`Using Gemini model: ${selectedModel}`);
    
    // Extract the model name from the full path for the API URL
    const modelName = selectedModel.replace('models/', '');
    
    // Use the generative language API v1 (not v1beta)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/${selectedModel}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Create social media content with the following parameters:
                      Topic: ${options.topic || 'general'}
                      Tone: ${options.tone}
                      Length: ${options.length}
                      Include hashtags: ${options.includeHashtags ? 'yes' : 'no'}
                      
                      User prompt: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: options.length === 'short' ? 100 : options.length === 'medium' ? 200 : 400,
          temperature: 0.7,
          topP: 1.0,
          topK: 40
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API Error');
    }
    
    // Make sure to access the correct path in the response
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Unexpected response from Gemini API');
    }
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
};

// Mock generator for testing/fallback
const generateMockContent = async (
  prompt: string, 
  options: { topic: string; tone: string; length: string; includeHashtags: boolean }
): Promise<string> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is just a mock response
      const lengths = {
        short: 50,
        medium: 100,
        long: 200
      };
      
      const mockTopics = {
        'travel': 'Discover breathtaking destinations and unforgettable experiences. The world is waiting for you to explore its wonders.',
        'food': 'Indulge in culinary delights that tantalize your taste buds. Every flavor tells a unique story.',
        'tech': 'Stay on the cutting edge of technology with the latest innovations that are shaping our future.',
        'fashion': 'Express yourself through style and embrace the trends that define modern aesthetics.',
        'fitness': 'Transform your body and mind with dedicated routines and expert guidance for optimal health.'
      };
      
      let baseText = options.topic && mockTopics[options.topic as keyof typeof mockTopics] 
        ? mockTopics[options.topic as keyof typeof mockTopics]
        : 'Creating engaging content is essential for building your brand presence online. Connect with your audience through authentic storytelling.';
      
      if (options.tone === 'casual') {
        baseText = baseText.replace(/\./g, '!');
        baseText = 'Hey there! ' + baseText;
      } else if (options.tone === 'professional') {
        baseText = 'Dear audience, ' + baseText + ' We invite you to engage with this content.';
      } else if (options.tone === 'enthusiastic') {
        baseText = 'WOW! ' + baseText.replace(/\./g, '! Amazing!');
      }
      
      if (options.includeHashtags) {
        baseText += ' #ContentCreation #SocialMedia #Engagement';
        if (options.topic) baseText += ` #${options.topic.charAt(0).toUpperCase() + options.topic.slice(1)}`;
      }
      
      resolve(baseText);
    }, 1000);
  });
};
