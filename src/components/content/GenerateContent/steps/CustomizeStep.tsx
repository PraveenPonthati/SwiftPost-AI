
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { Content } from '@/types/content';
import TemplateSelector from '@/components/content/TemplateSelector';
import PostPreview from '@/components/content/PostPreview';

interface CustomizeStepProps {
  content: Content | null;
  onTitleChange: (title: string) => void;
  onTextChange: (text: string) => void;
  onTemplateSelected: (templateId: string) => void;
  onContinue: () => void;
  active: boolean;
}

export const CustomizeStep: React.FC<CustomizeStepProps> = ({
  content,
  onTitleChange,
  onTextChange,
  onTemplateSelected,
  onContinue,
  active
}) => {
  if (!content) return null;

  const handleTemplateSelected = (templateId: string) => {
    onTemplateSelected(templateId);
  };

  return (
    <TabsContent value="customize" forceMount hidden={!active}>
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
                  value={content.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Give your post a title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content.editedText}
                  onChange={(e) => onTextChange(e.target.value)}
                  placeholder="Edit your generated content"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
          
          <TemplateSelector
            selectedTemplateId={content.selectedTemplateId}
            onSelectTemplate={handleTemplateSelected}
          />
        </div>
        
        <div className="md:col-span-2">
          <PostPreview content={content} />
          
          <Card className="mt-6">
            <CardFooter className="pt-6">
              <Button 
                onClick={onContinue} 
                className="w-full"
                disabled={!content.editedText || !content.selectedTemplateId}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};
