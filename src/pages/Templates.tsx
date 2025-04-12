import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContent } from '@/contexts/ContentContext';
import { SocialPlatform, Content } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Linkedin, Twitter, X, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CanvaIntegration from '@/components/templates/CanvaIntegration';
import { useToast } from '@/hooks/use-toast';
import { publishContent } from '@/utils/socialService';
import ContentDraftsList from '@/components/templates/ContentDraftsList';

const Templates = () => {
  const { templates, content } = useContent();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [showDrafts, setShowDrafts] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [draggedContent, setDraggedContent] = useState<Content | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState<boolean>(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [publishing, setPublishing] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Filter templates based on selected filters
  const filteredTemplates = templates.filter(template => {
    if (categoryFilter !== 'all' && template.category !== categoryFilter) {
      return false;
    }
    
    if (platformFilter !== 'all' && !template.platforms.includes(platformFilter)) {
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
    // Keep the publish dialog closed until user explicitly requests to publish
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow drop
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
      setSelectedPlatforms([]);
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
          <CanvaIntegration />
        </div>
      </div>
      
      <div className="flex gap-6">
        {showDrafts && (
          <div className="w-72">
            <ContentDraftsList onDragStart={handleDragStart} />
          </div>
        )}

        <div className={`flex-1 ${showDrafts ? "max-w-[calc(100%-300px)]" : ""}`}>
          <div className="mb-6 flex gap-4">
            <Tabs defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="post">Posts</TabsTrigger>
                <TabsTrigger value="story">Stories</TabsTrigger>
                <TabsTrigger value="carousel">Carousels</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="all" value={platformFilter} onValueChange={(value) => setPlatformFilter(value as SocialPlatform | 'all')}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                <TabsTrigger value="facebook">Facebook</TabsTrigger>
                <TabsTrigger value="twitter">Twitter</TabsTrigger>
                <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              </TabsList>
            </Tabs>
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
                    <img 
                      src={template.previewImage} 
                      alt={template.name} 
                      className="w-full h-full object-cover"
                    />
                    {draggedContent && selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                        <p className="text-sm font-medium mb-2 text-center truncate max-w-full">
                          {draggedContent.title}
                        </p>
                        <p className="text-xs text-center line-clamp-3">
                          {(draggedContent.editedText || draggedContent.generatedText).substring(0, 100)}...
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-4"
                          onClick={openPublishDialog}
                        >
                          Publish
                        </Button>
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
      
      {/* Publish Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish to Social Media</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-sm font-medium mb-3">Select platforms</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPlatforms.includes('instagram') ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform('instagram')}
                className={selectedPlatforms.includes('instagram') ? "bg-brand-600" : ""}
              >
                <Instagram className="mr-1 h-4 w-4" />
                Instagram
              </Button>
              <Button
                variant={selectedPlatforms.includes('facebook') ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform('facebook')}
                className={selectedPlatforms.includes('facebook') ? "bg-brand-600" : ""}
              >
                <Facebook className="mr-1 h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant={selectedPlatforms.includes('twitter') ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform('twitter')}
                className={selectedPlatforms.includes('twitter') ? "bg-brand-600" : ""}
              >
                <Twitter className="mr-1 h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant={selectedPlatforms.includes('linkedin') ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform('linkedin')}
                className={selectedPlatforms.includes('linkedin') ? "bg-brand-600" : ""}
              >
                <Linkedin className="mr-1 h-4 w-4" />
                LinkedIn
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
