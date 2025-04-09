
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContent } from '@/contexts/ContentContext';
import { SocialPlatform } from '@/types/content';

const Templates = () => {
  const { templates } = useContent();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  
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

  return (
    <div className="ml-64 p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Templates</h1>
      </div>
      
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
          <Card key={template.id} className="overflow-hidden card-hover">
            <div className="aspect-square overflow-hidden">
              <img 
                src={template.previewImage} 
                alt={template.name} 
                className="w-full h-full object-cover"
              />
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
  );
};

export default Templates;
