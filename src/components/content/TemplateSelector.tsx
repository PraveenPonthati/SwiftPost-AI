
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Template } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { CheckCircle2 } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  filter?: {
    category?: string;
    platform?: string;
  };
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  selectedTemplateId, 
  onSelectTemplate,
  filter = {}
}) => {
  const { templates } = useContent();
  
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
              <img 
                src={template.previewImage} 
                alt={template.name}
                className="w-full h-auto aspect-square object-cover"
              />
              
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
