
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Content, Template, ScheduledPost } from "@/types/content";

interface ContentContextType {
  content: Content[];
  templates: Template[];
  scheduledPosts: ScheduledPost[];
  activeContent: Content | null;
  setActiveContent: (content: Content | null) => void;
  createContent: (content: Partial<Content>) => Content;
  updateContent: (id: string, content: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  schedulePost: (contentId: string, platform: string, date: Date) => void;
  loadTemplates: () => void;
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
  const [content, setContent] = useState<Content[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [activeContent, setActiveContent] = useState<Content | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("content");
    const savedTemplates = localStorage.getItem("templates");
    const savedScheduledPosts = localStorage.getItem("scheduledPosts");

    if (savedContent) setContent(JSON.parse(savedContent));
    if (savedScheduledPosts) setScheduledPosts(JSON.parse(savedScheduledPosts));
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("content", JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    localStorage.setItem("scheduledPosts", JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

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
    localStorage.setItem("templates", JSON.stringify(defaultTemplates));
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const createContent = (newContent: Partial<Content>): Content => {
    const contentItem: Content = {
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

    setContent(prev => [...prev, contentItem]);
    return contentItem;
  };

  const updateContent = (id: string, updatedFields: Partial<Content>) => {
    setContent(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updatedFields, updatedAt: new Date() } 
          : item
      )
    );
  };

  const deleteContent = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id));
    
    // Also delete any scheduled posts for this content
    setScheduledPosts(prev => prev.filter(post => post.contentId !== id));
    
    // Reset active content if deleted
    if (activeContent && activeContent.id === id) {
      setActiveContent(null);
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
    loadTemplates
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};
