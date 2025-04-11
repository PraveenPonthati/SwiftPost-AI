
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PanelLeft, PanelLeftClose } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/contexts/ContentContext';
import { Content, SocialPlatform } from '@/types/content';
import { generateTitleFromPrompt } from '@/utils/supabaseClient';

import { StepTabs } from './StepTabs';
import { PublishStep } from './steps/PublishStep';
import { CustomizeStep } from './steps/CustomizeStep';
import { GenerateStep } from './steps/GenerateStep';
import { ScheduleDialog } from './ScheduleDialog';
import SavedContentSidebar from '../SavedContentSidebar';

export const GenerateContentPage: React.FC = () => {
  const { toast } = useToast();
  const { createContent, updateContent, deleteContent } = useContent();
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [activeTab, setActiveTab] = useState('generate');
  const [publishing, setPublishing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const initializeContent = async () => {
      setIsLoading(true);
      try {
        // Create new content if none exists
        if (!currentContent) {
          const content = await createContent({
            title: '',
            generatedText: '',
            editedText: '',
            selectedTemplateId: null,
            imageUrl: null,
            platforms: []
          });
          setCurrentContent(content);
        }
      } catch (error) {
        console.error("Error initializing content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeContent();
  }, []);
  
  const handleContentGenerated = async (text: string, prompt: string) => {
    try {
      setIsLoading(true);
      
      // Generate a title based on the prompt
      const title = generateTitleFromPrompt(prompt);
      
      // Create new content if we don't have one yet, or update existing one
      if (!currentContent) {
        const content = await createContent({
          title: title,
          generatedText: text,
          editedText: text,
          selectedTemplateId: null,
          imageUrl: null,
          platforms: []
        });
        setCurrentContent(content);
      } else {
        // Update existing content with new title and text
        await updateContent(currentContent.id, { 
          title: title,
          generatedText: text,
          editedText: text
        });
        
        setCurrentContent(prev => {
          if (!prev) return null;
          return { 
            ...prev, 
            title: title,
            generatedText: text,
            editedText: text
          };
        });
      }
      
      setActiveTab('customize');
    } catch (error) {
      console.error("Error saving generated content:", error);
      toast({
        title: 'Error',
        description: 'Failed to save the generated content',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTemplateSelected = async (templateId: string) => {
    if (!currentContent) return;
    
    try {
      setIsLoading(true);
      setCurrentContent(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          selectedTemplateId: templateId
        };
      });
      
      await updateContent(currentContent.id, { 
        selectedTemplateId: templateId
      });
    } catch (error) {
      console.error("Error saving selected template:", error);
      toast({
        title: 'Error',
        description: 'Failed to save the selected template',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTitleChange = async (title: string) => {
    if (!currentContent) return;
    
    setCurrentContent(prev => {
      if (!prev) return null;
      return { ...prev, title };
    });
    
    try {
      await updateContent(currentContent.id, { title });
    } catch (error) {
      console.error("Error saving title:", error);
    }
  };
  
  const handleTextChange = async (editedText: string) => {
    if (!currentContent) return;
    
    setCurrentContent(prev => {
      if (!prev) return null;
      return { ...prev, editedText };
    });
    
    try {
      await updateContent(currentContent.id, { editedText });
    } catch (error) {
      console.error("Error saving edited text:", error);
    }
  };
  
  const handlePlatformToggle = async (platform: SocialPlatform, isSelected: boolean) => {
    if (!currentContent) return;
    
    const platforms = isSelected
      ? [...currentContent.platforms, platform]
      : currentContent.platforms.filter(p => p !== platform);
    
    setCurrentContent(prev => {
      if (!prev) return null;
      return { ...prev, platforms };
    });
    
    try {
      await updateContent(currentContent.id, { platforms });
    } catch (error) {
      console.error("Error saving platforms:", error);
    }
  };
  
  const handleSchedule = async () => {
    if (!currentContent || !scheduleDate) return;
    
    try {
      setIsLoading(true);
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const scheduledDate = new Date(scheduleDate);
      scheduledDate.setHours(hours, minutes);
      
      // Update content status
      setCurrentContent(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          scheduledFor: scheduledDate,
          status: 'scheduled'
        };
      });
      
      await updateContent(currentContent.id, { 
        scheduledFor: scheduledDate,
        status: 'scheduled'
      });
      
      // Close dialog
      setScheduleDialogOpen(false);
      
      // Show success message
      toast({
        title: "Post Scheduled",
        description: `Your post has been scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      });
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast({
        title: 'Error',
        description: 'Failed to schedule the post',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectContent = async (content: Content) => {
    setCurrentContent(content);
    
    // Determine which tab to activate based on content state
    if (content.selectedTemplateId && content.editedText) {
      setActiveTab('publish');
    } else if (content.generatedText) {
      setActiveTab('customize');
    } else {
      setActiveTab('generate');
    }
  };
  
  const handleDeleteContent = async (id: string) => {
    try {
      await deleteContent(id);
      
      // If the deleted content was the current one, create a new one
      if (currentContent && currentContent.id === id) {
        const content = await createContent({
          title: '',
          generatedText: '',
          editedText: '',
          selectedTemplateId: null,
          imageUrl: null,
          platforms: []
        });
        setCurrentContent(content);
        setActiveTab('generate');
      }
      
      toast({
        title: 'Content Deleted',
        description: 'The content has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete the content. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const isValid = () => {
    if (!currentContent) return false;
    
    return (
      currentContent.title &&
      (currentContent.editedText || currentContent.generatedText) &&
      currentContent.selectedTemplateId &&
      currentContent.platforms.length > 0
    );
  };

  if (isLoading && !currentContent) {
    return (
      <div className="ml-64 p-8 max-w-6xl flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create Content</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex gap-6">
        {showSidebar && (
          <div className="w-64 border rounded-md p-4">
            <h2 className="font-semibold mb-3">Saved Drafts</h2>
            <SavedContentSidebar 
              onSelectContent={handleSelectContent} 
              activeContentId={currentContent?.id} 
            />
          </div>
        )}
        
        <div className={`flex-1 ${showSidebar ? 'max-w-[calc(100%-280px)]' : 'w-full'}`}>
          <StepTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasGeneratedContent={!!currentContent?.generatedText}
            hasCustomizedContent={!!currentContent?.editedText && !!currentContent?.selectedTemplateId}
          >
            <GenerateStep
              onContentGenerated={handleContentGenerated}
              active={activeTab === 'generate'}
            />
            
            <CustomizeStep
              content={currentContent}
              onTitleChange={handleTitleChange}
              onTextChange={handleTextChange}
              onTemplateSelected={handleTemplateSelected}
              onContinue={() => setActiveTab('publish')}
              active={activeTab === 'customize'}
            />
            
            <PublishStep
              content={currentContent}
              onPlatformToggle={handlePlatformToggle}
              onSchedule={() => setScheduleDialogOpen(true)}
              publishing={publishing}
              setPublishing={setPublishing}
              isValid={isValid}
              onBack={() => setActiveTab('customize')}
              active={activeTab === 'publish'}
            />
          </StepTabs>
          
          <ScheduleDialog
            open={scheduleDialogOpen}
            onOpenChange={setScheduleDialogOpen}
            date={scheduleDate}
            onDateChange={setScheduleDate}
            time={scheduleTime}
            onTimeChange={setScheduleTime}
            onSchedule={handleSchedule}
          />
        </div>
      </div>
    </div>
  );
};
