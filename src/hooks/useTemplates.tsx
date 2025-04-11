
import { useState } from "react";
import { Template, SocialPlatform } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const loadTemplates = () => {
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
  
  return {
    templates,
    setTemplates,
    loadTemplates
  };
};
