
export type SocialPlatform = 'twitter';

export interface Template {
  id: string;
  name: string;
  previewImage: string;
  dimensions: {
    width: number;
    height: number;
  };
  category: 'post' | 'story' | 'carousel';
  platforms: SocialPlatform[];
}

export type ContentStatus = 'draft' | 'scheduled' | 'published';

export interface Content {
  id: string;
  title: string;
  generatedText: string;
  editedText: string;
  selectedTemplateId: string | null;
  imageUrl: string | null;
  customizations: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor: Date | null;
  status: ContentStatus;
  platforms: SocialPlatform[];
  user_id?: string;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platform: SocialPlatform;
  scheduledFor: Date;
  status: 'pending' | 'published' | 'failed';
  error?: string;
}
