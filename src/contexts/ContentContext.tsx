
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Content, ContentStatus, Template, ScheduledPost, SocialPlatform } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  loadContentData, 
  createContentItem, 
  updateContentItem, 
  deleteContentItem,
  transformDimensions,
  loadTemplatesData 
} from "@/utils/contentUtils";
import { useTemplates } from "@/hooks/useTemplates";

interface ContentContextType {
  content: Content[];
  templates: Template[];
  scheduledPosts: ScheduledPost[];
  activeContent: Content | null;
  setActiveContent: (content: Content | null) => void;
  createContent: (content: Partial<Content>) => Promise<Content>;
  updateContent: (id: string, content: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  schedulePost: (contentId: string, platform: string, date: Date) => void;
  loadTemplates: () => void;
  loadContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [content, setContent] = useState<Content[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { templates, setTemplates, loadTemplates } = useTemplates();

  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return;
      
      await loadContent();
      await loadTemplatesData(setTemplates, loadTemplates, toast);
      
      const savedScheduledPosts = localStorage.getItem("scheduledPosts");
      if (savedScheduledPosts) setScheduledPosts(JSON.parse(savedScheduledPosts));
      
      setIsInitialized(true);
    };

    initialize();
  }, [isInitialized]);

  useEffect(() => {
    localStorage.setItem("scheduledPosts", JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  const loadContent = async () => {
    try {
      const transformedContent = await loadContentData(toast);
      setContent(transformedContent);
    } catch (error) {
      console.error('Unexpected error loading content:', error);
    }
  };

  const createContent = async (newContent: Partial<Content>): Promise<Content> => {
    try {
      const contentItem = await createContentItem(newContent, toast);
      setContent(prev => [contentItem, ...prev]);
      return contentItem;
    } catch (error: any) {
      console.error('Failed to create content:', error);
      const fallbackContent: Content = {
        id: `content-${Date.now()}`,
        title: newContent.title || "Untitled",
        generatedText: newContent.generatedText || "",
        editedText: newContent.editedText || "",
        selectedTemplateId: newContent.selectedTemplateId || null,
        imageUrl: newContent.imageUrl || null,
        customizations: newContent.customizations || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        scheduledFor: newContent.scheduledFor || null,
        status: "draft",
        platforms: newContent.platforms || []
      };
      
      setContent(prev => [fallbackContent, ...prev]);
      toast({
        title: 'Warning',
        description: 'Content saved locally due to connection error',
        variant: 'default',
      });
      return fallbackContent;
    }
  };

  const updateContent = async (id: string, updatedFields: Partial<Content>): Promise<void> => {
    try {
      await updateContentItem(id, updatedFields);
      
      setContent(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updatedFields, updatedAt: new Date() } 
            : item
        )
      );
    } catch (error: any) {
      console.error('Unexpected error updating content:', error);
      
      setContent(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updatedFields, updatedAt: new Date() } 
            : item
        )
      );
    }
  };

  const deleteContent = async (id: string): Promise<void> => {
    try {
      await deleteContentItem(id, toast);
      
      setContent(prev => prev.filter(item => item.id !== id));
      setScheduledPosts(prev => prev.filter(post => post.contentId !== id));
      
      if (activeContent && activeContent.id === id) {
        setActiveContent(null);
      }
    } catch (error: any) {
      console.error('Unexpected error deleting content:', error);
    }
  };

  const schedulePost = (contentId: string, platform: string, date: Date) => {
    // Only allow Instagram as the platform
    if (platform !== 'instagram') {
      console.warn('Only Instagram is supported as a platform');
      return;
    }
    
    const newScheduledPost: ScheduledPost = {
      id: `scheduled-${Date.now()}`,
      contentId,
      platform: 'instagram',
      scheduledFor: date,
      status: "pending"
    };

    setScheduledPosts(prev => [...prev, newScheduledPost]);
    
    updateContent(contentId, {
      status: "scheduled",
      scheduledFor: date
    });
  };

  const contextValue = {
    content,
    templates,
    scheduledPosts,
    activeContent,
    setActiveContent,
    createContent,
    updateContent,
    deleteContent,
    schedulePost,
    loadTemplates,
    loadContent
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};
