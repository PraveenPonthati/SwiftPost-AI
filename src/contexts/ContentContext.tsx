import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Content, ContentStatus, Template, ScheduledPost } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [activeContent, setActiveContent] = useState<Content | null>(null);

  // Load content from Supabase on mount
  useEffect(() => {
    loadContent();
    loadTemplatesData();
    // Load scheduled posts from localStorage until we implement that in Supabase
    const savedScheduledPosts = localStorage.getItem("scheduledPosts");
    if (savedScheduledPosts) setScheduledPosts(JSON.parse(savedScheduledPosts));
  }, []);

  // Save scheduled posts to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("scheduledPosts", JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  const loadContent = async () => {
    try {
      console.log('Loading content from Supabase...');
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error loading content:', error);
        toast({
          title: 'Failed to load content',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      // Transform the data to match our Content type
      const transformedContent: Content[] = data.map(item => ({
        ...item,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        scheduledFor: item.scheduled_for ? new Date(item.scheduled_for) : null,
        platforms: item.platforms ? item.platforms.map(p => p as any) : [],
        selectedTemplateId: item.selected_template_id,
        editedText: item.edited_text || '',
        generatedText: item.generated_text || '',
        imageUrl: item.image_url || null,
        customizations: {},
        // Ensure status is one of the valid ContentStatus types
        status: (item.status as ContentStatus) || 'draft',
      }));
      
      console.log(`Loaded ${transformedContent.length} content items`);
      setContent(transformedContent);
    } catch (error) {
      console.error('Unexpected error loading content:', error);
    }
  };

  const loadTemplatesData = async () => {
    try {
      // Check if templates exist in Supabase
      const { data: dbTemplates, error } = await supabase
        .from('templates')
        .select('*');
      
      if (error) {
        console.error('Error loading templates:', error);
        toast({
          title: 'Failed to load templates',
          description: error.message,
          variant: 'destructive',
        });
        
        // Fall back to default templates
        loadTemplates();
        return;
      }
      
      if (dbTemplates && dbTemplates.length > 0) {
        // Transform database templates to match our Template type
        const transformedTemplates: Template[] = dbTemplates.map(template => ({
          id: template.id,
          name: template.name,
          previewImage: template.preview_image || '',
          // Transform the JSONB dimensions to proper TypeScript type
          dimensions: transformDimensions(template.dimensions),
          category: template.category as 'post' | 'story' | 'carousel',
          platforms: template.platforms ? template.platforms.map(p => p as any) : [],
        }));
        
        setTemplates(transformedTemplates);
      } else {
        // No templates in database, use defaults
        loadTemplates();
      }
    } catch (error) {
      console.error('Unexpected error loading templates:', error);
      // Fall back to default templates
      loadTemplates();
    }
  };

  // Helper to transform JSON dimensions to correct type
  const transformDimensions = (dimensions: Json | null): { width: number; height: number } => {
    if (!dimensions) {
      return { width: 1080, height: 1080 }; // Default dimensions
    }
    
    try {
      // If it's already the right shape, just return it
      if (typeof dimensions === 'object' && dimensions !== null && 'width' in dimensions && 'height' in dimensions) {
        const width = Number(dimensions.width);
        const height = Number(dimensions.height);
        if (!isNaN(width) && !isNaN(height)) {
          return { width, height };
        }
      }
      
      // Otherwise fallback to defaults
      return { width: 1080, height: 1080 };
    } catch (e) {
      console.error('Error transforming dimensions:', e);
      return { width: 1080, height: 1080 };
    }
  };

  const loadTemplates = () => {
    // In a real app, this might be an API call
    const defaultTemplates: Template[] = [
      {
        id: "template-1",
        name: "Instagram Square",
        previewImage: "https://via.placeholder.com/600x600",
        dimensions: { width: 1080, height: 1080 },
        category: "post",
        platforms: ["instagram", "facebook"]
      },
      {
        id: "template-2",
        name: "Instagram Story",
        previewImage: "https://via.placeholder.com/1080x1920",
        dimensions: { width: 1080, height: 1920 },
        category: "story",
        platforms: ["instagram"]
      },
      {
        id: "template-3",
        name: "Twitter Post",
        previewImage: "https://via.placeholder.com/1200x675",
        dimensions: { width: 1200, height: 675 },
        category: "post",
        platforms: ["twitter"]
      },
      {
        id: "template-4",
        name: "LinkedIn Article",
        previewImage: "https://via.placeholder.com/1200x627",
        dimensions: { width: 1200, height: 627 },
        category: "post",
        platforms: ["linkedin"]
      }
    ];
    
    setTemplates(defaultTemplates);
    
    // Store templates in Supabase for future use
    defaultTemplates.forEach(async (template) => {
      await supabase
        .from('templates')
        .upsert({
          id: template.id,
          name: template.name,
          preview_image: template.previewImage,
          dimensions: template.dimensions,
          category: template.category,
          platforms: template.platforms
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error storing template:', error);
          }
        });
    });
  };

  const createContent = async (newContent: Partial<Content>): Promise<Content> => {
    try {
      // Format for Supabase
      const supabaseContent = {
        title: newContent.title || "Untitled",
        generated_text: newContent.generatedText || "",
        edited_text: newContent.editedText || "",
        selected_template_id: newContent.selectedTemplateId || null,
        image_url: newContent.imageUrl || null,
        scheduled_for: newContent.scheduledFor ? newContent.scheduledFor.toISOString() : null,
        status: newContent.status || "draft",
        platforms: newContent.platforms || []
      };
      
      const { data, error } = await supabase
        .from('content')
        .insert([supabaseContent])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating content:', error);
        toast({
          title: 'Failed to create content',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Transform to application format
      const contentItem: Content = {
        id: data.id,
        title: data.title,
        generatedText: data.generated_text || "",
        editedText: data.edited_text || "",
        selectedTemplateId: data.selected_template_id,
        imageUrl: data.image_url,
        customizations: {},
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : null,
        status: data.status as ContentStatus,
        platforms: data.platforms ? data.platforms.map(p => p as any) : [],
        user_id: data.user_id
      };

      setContent(prev => [contentItem, ...prev]);
      return contentItem;
    } catch (error: any) {
      console.error('Failed to create content:', error);
      // Create a fallback local content item in case of error
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
      // Format for Supabase
      const supabaseUpdate: Record<string, any> = {};
      
      if (updatedFields.title !== undefined) supabaseUpdate.title = updatedFields.title;
      if (updatedFields.generatedText !== undefined) supabaseUpdate.generated_text = updatedFields.generatedText;
      if (updatedFields.editedText !== undefined) supabaseUpdate.edited_text = updatedFields.editedText;
      if (updatedFields.selectedTemplateId !== undefined) supabaseUpdate.selected_template_id = updatedFields.selectedTemplateId;
      if (updatedFields.imageUrl !== undefined) supabaseUpdate.image_url = updatedFields.imageUrl;
      if (updatedFields.scheduledFor !== undefined) {
        supabaseUpdate.scheduled_for = updatedFields.scheduledFor ? updatedFields.scheduledFor.toISOString() : null;
      }
      if (updatedFields.status !== undefined) supabaseUpdate.status = updatedFields.status;
      if (updatedFields.platforms !== undefined) supabaseUpdate.platforms = updatedFields.platforms;
      
      const { error } = await supabase
        .from('content')
        .update(supabaseUpdate)
        .eq('id', id);
        
      if (error) {
        console.error('Error updating content:', error);
        toast({
          title: 'Failed to update content',
          description: error.message,
          variant: 'destructive',
        });
      }
      
      // Update local state
      setContent(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updatedFields, updatedAt: new Date() } 
            : item
        )
      );
    } catch (error: any) {
      console.error('Unexpected error updating content:', error);
      
      // Update local state anyway to maintain UI consistency
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
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting content:', error);
        toast({
          title: 'Failed to delete content',
          description: error.message,
          variant: 'destructive',
        });
      }
      
      // Update local state
      setContent(prev => prev.filter(item => item.id !== id));
      
      // Also delete any scheduled posts for this content
      setScheduledPosts(prev => prev.filter(post => post.contentId !== id));
      
      // Reset active content if deleted
      if (activeContent && activeContent.id === id) {
        setActiveContent(null);
      }
    } catch (error: any) {
      console.error('Unexpected error deleting content:', error);
    }
  };

  const schedulePost = (contentId: string, platform: string, date: Date) => {
    const newScheduledPost: ScheduledPost = {
      id: `scheduled-${Date.now()}`,
      contentId,
      platform: platform as any,
      scheduledFor: date,
      status: "pending"
    };

    setScheduledPosts(prev => [...prev, newScheduledPost]);
    
    // Update the content status
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
