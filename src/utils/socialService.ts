
// Social media service integration
// In a real app, this would connect to social media APIs

import { SocialPlatform } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";

interface SocialAccount {
  platform: SocialPlatform;
  username: string;
  connected: boolean;
  profileImage?: string;
}

interface PublishOptions {
  platform: SocialPlatform;
  content: string;
  mediaUrl?: string;
  scheduledTime?: Date;
}

// Get API key for social platforms
export const getSocialApiKey = (platform: SocialPlatform): string => {
  const key = localStorage.getItem(`${platform}_api_key`);
  return key || '';
};

export const saveSocialApiKey = (platform: SocialPlatform, apiKey: string): void => {
  localStorage.setItem(`${platform}_api_key`, apiKey);
};

export const getConnectedAccounts = (): SocialAccount[] => {
  const savedAccounts = localStorage.getItem('socialAccounts');
  
  if (savedAccounts) {
    return JSON.parse(savedAccounts);
  }
  
  // Default accounts (not connected)
  return [
    { 
      platform: 'twitter',
      username: '',
      connected: true,
    }
  ];
};

export const connectAccount = (platform: SocialPlatform, apiKey: string): Promise<SocialAccount> => {
  // In a real app, this would authenticate with the platform's API
  // For this demo, we'll simulate success but store the API key
  saveSocialApiKey(platform, apiKey);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const accounts = getConnectedAccounts();
      const updatedAccounts = accounts.map(account => {
        if (account.platform === platform) {
          return {
            ...account,
            username: `user_${platform}`,
            connected: true,
            profileImage: `https://via.placeholder.com/40?text=${platform.charAt(0).toUpperCase()}`
          };
        }
        return account;
      });
      
      localStorage.setItem('socialAccounts', JSON.stringify(updatedAccounts));
      resolve(updatedAccounts.find(a => a.platform === platform) as SocialAccount);
    }, 1000);
  });
};

export const disconnectAccount = (platform: SocialPlatform): Promise<void> => {
  // Remove API key when disconnecting
  localStorage.removeItem(`${platform}_api_key`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const accounts = getConnectedAccounts();
      const updatedAccounts = accounts.map(account => {
        if (account.platform === platform) {
          return {
            ...account,
            username: '',
            connected: false,
            profileImage: undefined
          };
        }
        return account;
      });
      
      localStorage.setItem('socialAccounts', JSON.stringify(updatedAccounts));
      resolve();
    }, 500);
  });
};

export const publishContent = async (options: PublishOptions): Promise<{ success: boolean; message: string }> => {
  const { platform, content, mediaUrl, scheduledTime } = options;
  
  // Only handle Twitter platform
  if (platform === 'twitter') {
    try {
      // Call the Supabase Edge Function for Twitter posting
      const { data, error } = await supabase.functions.invoke('twitter-post', {
        body: { text: content }
      });
      
      if (error) {
        console.error('Error calling Twitter post function:', error);
        return {
          success: false,
          message: `Failed to post to Twitter: ${error.message}`
        };
      }
      
      if (data && data.success === false) {
        return {
          success: false,
          message: `Failed to post to Twitter: ${data.error || 'Unknown error'}`
        };
      }
      
      return { 
        success: true, 
        message: scheduledTime 
          ? `Tweet scheduled for ${scheduledTime.toLocaleString()}` 
          : `Tweet posted successfully` 
      };
    } catch (error: any) {
      console.error('Twitter posting error:', error);
      return {
        success: false,
        message: `Error posting to Twitter: ${error.message || 'Unknown error'}`
      };
    }
  }
  
  return {
    success: false,
    message: `Publishing to ${platform} is not supported.`
  };
};

// Format for Twitter API credentials
export const getMetaApiFormat = () => {
  return `
# Twitter API Credentials Format

# Consumer API Keys
TWITTER_CONSUMER_KEY=your_api_key_here
TWITTER_CONSUMER_SECRET=your_api_secret_here

# Authentication Tokens
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
`;
};
