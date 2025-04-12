
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { Content } from '@/types/content';

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
            <CardFooter>
              <Button 
                onClick={onContinue} 
                className="w-full"
                disabled={!content.editedText}
              >
                Continue to Publish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-6 rounded-md whitespace-pre-wrap">
                {content.editedText || content.generatedText}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};
