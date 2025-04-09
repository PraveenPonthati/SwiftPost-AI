
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Content, Template } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';

interface PostPreviewProps {
  content: Content;
  onSchedule?: () => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({ content, onSchedule }) => {
  const { templates } = useContent();
  const template = templates.find(t => t.id === content.selectedTemplateId);
  
  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Select a template to preview your content
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div 
            className="relative border rounded-md overflow-hidden"
            style={{
              width: `${Math.min(300, template.dimensions.width / 4)}px`,
              height: `${Math.min(500, template.dimensions.height / 4)}px`
            }}
          >
            <img
              src={template.previewImage}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 p-4 flex flex-col">
              <div 
                className="bg-black bg-opacity-50 text-white p-3 rounded-md text-sm"
                style={{ maxHeight: '80%', overflow: 'auto' }}
              >
                {content.editedText || content.generatedText}
              </div>
            </div>
          </div>
        </div>
        
        {content.scheduledFor ? (
          <div className="bg-muted p-3 rounded-md text-sm flex items-center gap-2">
            <Calendar size={16} />
            <span>
              Scheduled for {content.scheduledFor.toLocaleDateString()} at{' '}
              {content.scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : onSchedule ? (
          <Button onClick={onSchedule} className="w-full">
            <Clock size={16} className="mr-2" />
            Schedule Post
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default PostPreview;
