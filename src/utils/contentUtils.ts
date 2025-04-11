
import { Content, ContentStatus, SocialPlatform, Template } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

export const transformDimensions = (dimensions: any): { width: number; height: number } => {
  if (!dimensions) {
    return { width: 1080, height: 1080 }; // Default dimensions
  }
  
  try {
    if (typeof dimensions === 'object' && dimensions !== null && 'width' in dimensions && 'height' in dimensions) {
      const width = Number(dimensions.width);
      const height = Number(dimensions.height);
      if (!isNaN(width) && !isNaN(height)) {
        return { width, height };
      }
    }
    
    return { width: 1080, height: 1080 };
  } catch (e) {
    console.error('Error transforming dimensions:', e);
    return { width: 1080, height: 1080 };
  }
};

export const loadContentData = async (toast: typeof toastFunction): Promise<Content[]> => {
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
      return [];
    }
    
    const transformedContent: Content[] = data.map(item => ({
      id: item.id,
      title: item.title,
      generatedText: item.generated_text || "",
      editedText: item.edited_text || "",
      selectedTemplateId: item.selected_template_id,
      imageUrl: item.image_url,
      customizations: {},
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      scheduledFor: item.scheduled_for ? new Date(item.scheduled_for) : null,
      status: (item.status as ContentStatus) || 'draft',
      platforms: item.platforms ? item.platforms.map(p => p as SocialPlatform) : [],
      user_id: item.user_id
    }));
    
    console.log(`Loaded ${transformedContent.length} content items`);
    return transformedContent;
  } catch (error) {
    console.error('Unexpected error loading content:', error);
    return [];
  }
};

export const loadTemplatesData = async (
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>, 
  loadDefaultTemplates: () => void, 
  toast: typeof toastFunction
): Promise<void> => {
  try {
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
      
      loadDefaultTemplates();
      return;
    }
    
    if (dbTemplates && dbTemplates.length > 0) {
      const transformedTemplates: Template[] = dbTemplates.map(template => ({
        id: template.id,
        name: template.name,
        previewImage: template.preview_image || '',
        dimensions: transformDimensions(template.dimensions),
        category: template.category as 'post' | 'story' | 'carousel',
        platforms: template.platforms ? template.platforms.map(p => p as SocialPlatform) : [],
      }));
      
      setTemplates(transformedTemplates);
    } else {
      loadDefaultTemplates();
    }
  } catch (error) {
    console.error('Unexpected error loading templates:', error);
    loadDefaultTemplates();
  }
};

export const createContentItem = async (
  newContent: Partial<Content>, 
  toast: typeof toastFunction
): Promise<Content> => {
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
    platforms: data.platforms ? data.platforms.map(p => p as SocialPlatform) : [],
    user_id: data.user_id
  };

  return contentItem;
};

export const updateContentItem = async (
  id: string, 
  updatedFields: Partial<Content>
): Promise<void> => {
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
    throw error;
  }
};

export const deleteContentItem = async (
  id: string,
  toast: typeof toastFunction
): Promise<void> => {
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
    throw error;
  }
};
