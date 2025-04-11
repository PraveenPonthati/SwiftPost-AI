
// Social media service integration
// In a real app, this would connect to social media APIs

import { SocialPlatform } from "@/types/content";

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
      platform: 'instagram',
      username: '',
      connected: false,
    },
    {
      platform: 'facebook',
      username: '',
      connected: false,
    },
    {
      platform: 'twitter',
      username: '',
      connected: false,
    },
    {
      platform: 'linkedin',
      username: '',
      connected: false,
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
  
  // Check if we have an API key for this platform
  const apiKey = getSocialApiKey(platform);
  if (!apiKey) {
    return {
      success: false,
      message: `API key for ${platform} is not set. Please connect your account first.`
    };
  }
  
  // In a real app, this would call the platform's API
  console.log(`Publishing to ${platform}:`, { content, mediaUrl, scheduledTime });
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate for demo
        resolve({ 
          success: true, 
          message: scheduledTime 
            ? `Content scheduled for ${platform} on ${scheduledTime.toLocaleString()}` 
            : `Content published to ${platform}` 
        });
      } else {
        resolve({ 
          success: false, 
          message: `Failed to publish to ${platform}. Please try again.` 
        });
      }
    }, 1500);
  });
};

// Format for Instagram meta graph api usage
export const getMetaApiFormat = () => {
  return `
# .env file format for META Graph API

# Meta Developer App credentials
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_ACCESS_TOKEN=your_access_token_here

# Optional: User or Page ID
META_USER_ID=your_user_or_page_id_here
`;
};
