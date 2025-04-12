
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Content, SocialPlatform } from '@/types/content';
import { useToast } from '@/hooks/use-toast';
import { publishContent, getConnectedAccounts } from '@/utils/socialService';
import { Instagram } from 'lucide-react';
import PostPreview from '@/components/content/PostPreview';

interface PublishStepProps {
  content: Content | null;
  onPlatformToggle: (platform: SocialPlatform, isSelected: boolean) => void;
  onSchedule: () => void;
  publishing: boolean;
  setPublishing: (publishing: boolean) => void;
  isValid: () => boolean;
  onBack: () => void;
  active: boolean;
}

export const PublishStep: React.FC<PublishStepProps> = ({
  content,
  onPlatformToggle,
  onSchedule,
  publishing,
  setPublishing,
  isValid,
  onBack,
  active
}) => {
  const { toast } = useToast();
  const connectedAccounts = getConnectedAccounts().filter(a => a.connected);

  if (!content) return null;

  const handlePublishNow = async () => {
    if (!content) return;
    
    if (content.platforms.length === 0) {
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
        content.platforms.map(platform => 
          publishContent({
            platform,
            content: content.editedText || content.generatedText,
            mediaUrl: content.imageUrl || undefined
          })
        )
      );
      
      const allSucceeded = results.every(r => r.success);
      
      if (allSucceeded) {
        toast({
          title: "Post Published",
          description: `Your post has been published to ${content.platforms.length} platform(s).`
        });
      } else {
        const failedPlatforms = results
          .filter(r => !r.success)
          .map((_, i) => content.platforms[i]);
        
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
    onPlatformToggle(platform, !content.platforms.includes(platform));
  };

  return (
    <TabsContent value="publish" forceMount hidden={!active}>
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
                    variant={content.platforms.includes('instagram') ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatform('instagram')}
                    className={content.platforms.includes('instagram') ? "bg-brand-600" : ""}
                    disabled={!connectedAccounts.some(a => a.platform === 'instagram')}
                  >
                    <Instagram className="mr-1 h-4 w-4" />
                    Instagram
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
                onClick={onBack}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onSchedule}
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
            content={content} 
            onSchedule={onSchedule}
          />
        </div>
      </div>
    </TabsContent>
  );
};
