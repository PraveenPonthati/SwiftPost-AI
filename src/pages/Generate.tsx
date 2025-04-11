import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  ArrowRight, 
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  X,
  PanelLeft,
  PanelLeftClose,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useContent } from '@/contexts/ContentContext';
import AIGenerator from '@/components/content/AIGenerator';
import TemplateSelector from '@/components/content/TemplateSelector';
import PostPreview from '@/components/content/PostPreview';
import SavedContentSidebar from '@/components/content/SavedContentSidebar';
import { Content, SocialPlatform, Template } from '@/types/content';
import { useToast } from '@/hooks/use-toast';
import { publishContent, getConnectedAccounts } from '@/utils/socialService';

const Generate = () => {
  const { toast } = useToast();
  const { createContent, updateContent, templates, deleteContent, loadContent } = useContent();
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [activeTab, setActiveTab] = useState('generate');
  const [publishing, setPublishing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const connectedAccounts = getConnectedAccounts().filter(a => a.connected);

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
  
  const handleContentGenerated = async (text: string) => {
    if (!currentContent) return;
    
    try {
      setIsLoading(true);
      setCurrentContent(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          generatedText: text,
          editedText: text
        };
      });
      
      await updateContent(currentContent.id, { 
        generatedText: text,
        editedText: text
      });
      
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
  
  const handleTemplateSelected = async (template: Template) => {
    if (!currentContent) return;
    
    try {
      setIsLoading(true);
      setCurrentContent(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          selectedTemplateId: template.id
        };
      });
      
      await updateContent(currentContent.id, { 
        selectedTemplateId: template.id
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
  
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentContent) return;
    
    const title = e.target.value;
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
  
  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentContent) return;
    
    const editedText = e.target.value;
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
  
  const togglePlatform = async (platform: SocialPlatform) => {
    if (!currentContent) return;
    
    const platforms = currentContent.platforms.includes(platform)
      ? currentContent.platforms.filter(p => p !== platform)
      : [...currentContent.platforms, platform];
    
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
        description: `Your post has been scheduled for ${format(scheduledDate, 'PPP')} at ${format(scheduledDate, 'p')}.`
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
  
  const handlePublishNow = async () => {
    if (!currentContent) return;
    
    if (currentContent.platforms.length === 0) {
      toast({
        title: "No Platform Selected",
        description: "Please select at least one platform to publish to.",
        variant: "destructive"
      });
      return;
    }
    
    setPublishing(true);
    try {
      const results = await Promise.all(
        currentContent.platforms.map(platform => 
          publishContent({
            platform,
            content: currentContent.editedText || currentContent.generatedText,
            mediaUrl: currentContent.imageUrl || undefined
          })
        )
      );
      
      const allSucceeded = results.every(r => r.success);
      
      if (allSucceeded) {
        // Update content status
        setCurrentContent(prev => {
          if (!prev) return null;
          return { ...prev, status: 'published' };
        });
        
        await updateContent(currentContent.id, { status: 'published' });
        
        toast({
          title: "Post Published",
          description: `Your post has been published to ${currentContent.platforms.length} platform(s).`
        });
      } else {
        const failedPlatforms = results
          .filter(r => !r.success)
          .map((_, i) => currentContent.platforms[i]);
        
        toast({
          title: "Some Platforms Failed",
          description: `Failed to publish to: ${failedPlatforms.join(', ')}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publication Error",
        description: "An error occurred while publishing your content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
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
      
      {currentContent && (
        <div className="flex gap-6">
          {showSidebar && (
            <div className="w-64 border rounded-md p-4">
              <h2 className="font-semibold mb-3">Saved Drafts</h2>
              <SavedContentSidebar 
                onSelectContent={handleSelectContent} 
                activeContentId={currentContent.id} 
              />
            </div>
          )}
          
          <div className={`flex-1 ${showSidebar ? 'max-w-[calc(100%-280px)]' : 'w-full'}`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="generate">1. Generate</TabsTrigger>
                <TabsTrigger value="customize" disabled={!currentContent.generatedText}>
                  2. Customize
                </TabsTrigger>
                <TabsTrigger 
                  value="publish" 
                  disabled={!currentContent.editedText || !currentContent.selectedTemplateId}
                >
                  3. Publish
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate">
                <AIGenerator onContentGenerated={handleContentGenerated} />
              </TabsContent>
              
              <TabsContent value="customize">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-3 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Customize Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title (for internal use)</Label>
                          <Input
                            id="title"
                            value={currentContent.title}
                            onChange={handleTitleChange}
                            placeholder="Give your post a title"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={currentContent.editedText}
                            onChange={handleTextChange}
                            placeholder="Edit your generated content"
                            rows={8}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <TemplateSelector
                      selectedTemplateId={currentContent.selectedTemplateId}
                      onSelectTemplate={handleTemplateSelected}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <PostPreview content={currentContent} />
                    
                    <Card className="mt-6">
                      <CardFooter className="pt-6">
                        <Button 
                          onClick={() => setActiveTab('publish')} 
                          className="w-full"
                          disabled={!currentContent.editedText || !currentContent.selectedTemplateId}
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="publish">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-3 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Publishing Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Select platforms</h3>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant={currentContent.platforms.includes('instagram') ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePlatform('instagram')}
                              className={currentContent.platforms.includes('instagram') ? "bg-brand-600" : ""}
                              disabled={!connectedAccounts.some(a => a.platform === 'instagram')}
                            >
                              <Instagram className="mr-1 h-4 w-4" />
                              Instagram
                            </Button>
                            <Button
                              variant={currentContent.platforms.includes('facebook') ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePlatform('facebook')}
                              className={currentContent.platforms.includes('facebook') ? "bg-brand-600" : ""}
                              disabled={!connectedAccounts.some(a => a.platform === 'facebook')}
                            >
                              <Facebook className="mr-1 h-4 w-4" />
                              Facebook
                            </Button>
                            <Button
                              variant={currentContent.platforms.includes('twitter') ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePlatform('twitter')}
                              className={currentContent.platforms.includes('twitter') ? "bg-brand-600" : ""}
                              disabled={!connectedAccounts.some(a => a.platform === 'twitter')}
                            >
                              <Twitter className="mr-1 h-4 w-4" />
                              Twitter
                            </Button>
                            <Button
                              variant={currentContent.platforms.includes('linkedin') ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePlatform('linkedin')}
                              className={currentContent.platforms.includes('linkedin') ? "bg-brand-600" : ""}
                              disabled={!connectedAccounts.some(a => a.platform === 'linkedin')}
                            >
                              <Linkedin className="mr-1 h-4 w-4" />
                              LinkedIn
                            </Button>
                          </div>
                          
                          {connectedAccounts.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              No social media accounts connected. Connect accounts in Settings.
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('customize')}
                        >
                          Back
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setScheduleDialogOpen(true)}
                            disabled={!isValid()}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                          <Button
                            onClick={handlePublishNow}
                            disabled={!isValid() || publishing}
                          >
                            {publishing ? "Publishing..." : "Publish Now"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  <div className="md:col-span-2">
                    <PostPreview 
                      content={currentContent} 
                      onSchedule={() => setScheduleDialogOpen(true)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Post</DialogTitle>
                  <DialogDescription>
                    Choose when to publish your content
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Date</Label>
                    <div className="mt-2">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSchedule}>
                    Schedule Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generate;
