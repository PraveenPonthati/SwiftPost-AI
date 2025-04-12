
import { useState } from "react";
import { Template, SocialPlatform } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const loadTemplates = () => {
    const defaultTemplates: Template[] = [
      {
        id: "template-1",
        name: "Twitter Post",
        previewImage: "https://via.placeholder.com/600x600/FF5733/FFFFFF?text=Twitter+Post",
        dimensions: { width: 1080, height: 1080 },
        category: "post",
        platforms: ["twitter"]
      },
      {
        id: "template-2",
        name: "Twitter Card",
        previewImage: "https://via.placeholder.com/1080x1920/3358FF/FFFFFF?text=Twitter+Card",
        dimensions: { width: 1080, height: 1920 },
        category: "story",
        platforms: ["twitter"]
      },
      {
        id: "template-3",
        name: "Twitter Image Post",
        previewImage: "https://via.placeholder.com/1200x675/33FF57/FFFFFF?text=Twitter+Image",
        dimensions: { width: 1200, height: 675 },
        category: "post",
        platforms: ["twitter"]
      }
    ];
    
    setTemplates(defaultTemplates);
    
    defaultTemplates.forEach(async (template) => {
      try {
        await supabase
          .from('templates')
          .upsert({
            id: template.id,
            name: template.name,
            preview_image: template.previewImage,
            dimensions: template.dimensions,
            category: template.category,
            platforms: template.platforms
          });
      } catch (error) {
        console.error('Error storing template:', error);
      }
    });
  };
  
  return {
    templates,
    setTemplates,
    loadTemplates
  };
};
