import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContent } from '@/contexts/ContentContext';
import { SocialPlatform, Content } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Twitter, CheckCircle2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { publishContent } from '@/utils/socialService';
import ContentDraftsList from '@/components/templates/ContentDraftsList';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const TEMPLATE_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
];

const Templates = () => {
  const { templates, content } = useContent();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [showDrafts, setShowDrafts] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [draggedContent, setDraggedContent] = useState<Content | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState<boolean>(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>(TEMPLATE_COLORS[0].value);
  const { toast } = useToast();
  
  const filteredTemplates = templates.filter(template => {
    if (categoryFilter !== 'all' && template.category !== categoryFilter) {
      return false;
    }
    
    if (platformFilter !== 'all' && platformFilter !== 'twitter' && !template.platforms.includes(platformFilter)) {
      return false;
    }
    
    return true;
  });

  const handleDragStart = (contentItem: Content) => {
    setDraggedContent(contentItem);
  };

  const handleDrop = (templateId: string) => {
    if (!draggedContent) return;
    setSelectedTemplate(templateId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearSelectedTemplate = () => {
    setSelectedTemplate(null);
    setDraggedContent(null);
  };

  const handlePublish = async () => {
    if (!draggedContent || selectedPlatforms.length === 0) {
      toast({
        title: "Cannot publish",
        description: "Please select at least one platform to publish to.",
        variant: "destructive"
      });
      return;
    }

    setPublishing(true);
    try {
      const results = await Promise.all(
        selectedPlatforms.map(platform => 
          publishContent({
            platform,
            content: draggedContent.editedText || draggedContent.generatedText,
            mediaUrl: draggedContent.imageUrl || undefined
          })
        )
      );
      
      const allSucceeded = results.every(r => r.success);
      
      if (allSucceeded) {
        toast({
          title: "Post Published",
          description: `Your post has been published to ${selectedPlatforms.length} platform(s).`
        });
        setIsPublishDialogOpen(false);
        clearSelectedTemplate();
      } else {
        const failedPlatforms = results
          .filter(r => !r.success)
          .map((_, i) => selectedPlatforms[i]);
        
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

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const openPublishDialog = () => {
    if (draggedContent && selectedTemplate) {
      setSelectedPlatforms(['twitter']);
      setIsPublishDialogOpen(true);
    } else {
      toast({
        title: "Cannot publish",
        description: "Please drag a content draft onto a template first.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="ml-64 p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Templates</h1>
        <div className="flex gap-4">
          <Button 
            variant={showDrafts ? "default" : "outline"} 
            onClick={() => setShowDrafts(!showDrafts)}
          >
            {showDrafts ? "Hide Drafts" : "Show Drafts"}
          </Button>
          
          {draggedContent && selectedTemplate && (
            <Button onClick={openPublishDialog}>
              Publish Content
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex gap-6">
        {showDrafts && (
          <div className="w-72">
            <ContentDraftsList onDragStart={handleDragStart} />
          </div>
        )}

        <div className={`flex-1 ${showDrafts ? "max-w-[calc(100%-300px)]" : ""}`}>
          <div className="mb-6 flex flex-wrap gap-4">
            <Tabs defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="post">Posts</TabsTrigger>
                <TabsTrigger value="story">Stories</TabsTrigger>
                <TabsTrigger value="carousel">Carousels</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="all" value={platformFilter} onValueChange={(value) => setPlatformFilter(value as SocialPlatform | 'all')}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="twitter">Twitter/X</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Template Color</h2>
            <RadioGroup 
              value={selectedColor}
              onValueChange={setSelectedColor}
              className="flex gap-3"
            >
              {TEMPLATE_COLORS.map(color => (
                <div key={color.value} className="flex items-center">
                  <RadioGroupItem 
                    value={color.value} 
                    id={`color-${color.name}`} 
                    className="peer sr-only" 
                  />
                  <label
                    htmlFor={`color-${color.name}`}
                    className="flex items-center justify-center rounded-full w-10 h-10 cursor-pointer ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-brand-600"
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor === color.value && (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    )}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map(template => (
              <div 
                key={template.id} 
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(template.id)}
              >
                <Card 
                  className={`overflow-hidden card-hover ${selectedTemplate === template.id ? "ring-2 ring-brand-600" : ""}`}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <div 
                      className="w-full h-full"
                      style={{ backgroundColor: selectedColor }}
                    >
                      {template.platforms.filter(p => p === 'twitter').map((platform) => (
                        <div 
                          key={platform}
                          className="absolute text-white text-opacity-20"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '4rem',
                            fontWeight: 'bold'
                          }}
                        >
                          <Twitter className="w-16 h-16 opacity-25" />
                        </div>
                      ))}
                    </div>
                    
                    {draggedContent && selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                        <p className="text-sm font-medium mb-2 text-center truncate max-w-full">
                          {draggedContent.title}
                        </p>
                        <p className="text-xs text-center line-clamp-3">
                          {(draggedContent.editedText || draggedContent.generatedText).substring(0, 100)}...
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-transparent text-white border-white hover:bg-white/20 hover:text-white"
                            onClick={clearSelectedTemplate}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.dimensions.width} x {template.dimensions.height}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.platforms.map(platform => (
                        <div 
                          key={platform}
                          className="text-xs px-2 py-0.5 bg-muted rounded-full"
                        >
                          {platform}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium">No templates found</h2>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters to see more templates.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish to Social Media</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-sm font-medium mb-3">Select platforms</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPlatforms.includes('twitter') ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform('twitter')}
                className={selectedPlatforms.includes('twitter') ? "bg-brand-600" : ""}
              >
                <Twitter className="mr-1 h-4 w-4" />
                Twitter/X
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPublishDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing || selectedPlatforms.length === 0}
            >
              {publishing ? "Publishing..." : "Publish Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
