
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Template } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  filter?: {
    category?: string;
    platform?: string;
  };
}

const TEMPLATE_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  selectedTemplateId, 
  onSelectTemplate,
  filter = {}
}) => {
  const { templates } = useContent();
  const [selectedColor, setSelectedColor] = useState<string>(TEMPLATE_COLORS[0].value);
  
  // Filter templates based on provided filters
  const filteredTemplates = templates.filter(template => {
    if (filter.category && template.category !== filter.category) {
      return false;
    }
    if (filter.platform && !template.platforms.includes(filter.platform as any)) {
      return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Template</CardTitle>
        <CardDescription>
          Select a template for your content
        </CardDescription>
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
                  id={`template-color-${color.name}`} 
                  className="peer sr-only" 
                />
                <label
                  htmlFor={`template-color-${color.name}`}
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`
                relative cursor-pointer rounded-md overflow-hidden border-2 transition-all
                ${selectedTemplateId === template.id ? 'border-brand-600 ring-2 ring-brand-200' : 'border-border hover:border-brand-200'}
              `}
            >
              <div 
                className="w-full aspect-square"
                style={{ backgroundColor: selectedColor }}
              ></div>
              
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 bg-brand-600 text-white rounded-full p-1">
                  <CheckCircle2 size={16} />
                </div>
              )}
              
              <div className="p-2 text-xs">
                <p className="font-medium">{template.name}</p>
                <p className="text-muted-foreground">
                  {template.dimensions.width} x {template.dimensions.height}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
