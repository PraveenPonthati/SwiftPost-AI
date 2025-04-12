
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Content, Template } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2 } from 'lucide-react';

const TEMPLATE_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
];

interface PostPreviewProps {
  content: Content;
  onSchedule?: () => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({ content, onSchedule }) => {
  const { templates } = useContent();
  const template = templates.find(t => t.id === content.selectedTemplateId);
  const [selectedColor, setSelectedColor] = useState<string>(TEMPLATE_COLORS[0].value);
  
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
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-3">Template Color</h3>
          <RadioGroup 
            value={selectedColor}
            onValueChange={setSelectedColor}
            className="flex gap-3 mb-4"
          >
            {TEMPLATE_COLORS.map(color => (
              <div key={color.value} className="flex items-center">
                <RadioGroupItem 
                  value={color.value} 
                  id={`preview-color-${color.name}`} 
                  className="peer sr-only" 
                />
                <label
                  htmlFor={`preview-color-${color.name}`}
                  className="flex items-center justify-center rounded-full w-8 h-8 cursor-pointer ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-brand-600"
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-center mb-6">
          <div 
            className="relative border rounded-md overflow-hidden"
            style={{
              width: `${Math.min(300, template.dimensions.width / 4)}px`,
              height: `${Math.min(500, template.dimensions.height / 4)}px`,
              backgroundColor: selectedColor
            }}
          >
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
