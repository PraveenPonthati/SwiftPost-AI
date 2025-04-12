
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Content } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { format } from 'date-fns';

interface ContentDraftsListProps {
  onDragStart: (content: Content) => void;
}

const ContentDraftsList: React.FC<ContentDraftsListProps> = ({ onDragStart }) => {
  const { content } = useContent();
  
  // Sort content by update date (newest first)
  const sortedContent = [...content].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (sortedContent.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground text-center">
            No content drafts yet. Create some content in the Create Content section.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100vh-180px)]">
      <CardContent className="p-4">
        <h2 className="font-medium mb-3">Saved Drafts</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Drag any draft onto a template to use it
        </p>
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-3">
            {sortedContent.map(item => (
              <Card 
                key={item.id} 
                className="p-3 cursor-grab hover:shadow-md transition-shadow border-border" 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                  onDragStart(item);
                }}
              >
                <h3 className="font-medium text-sm">
                  {item.title || 'Untitled Content'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.updatedAt), 'PP')}
                </p>
                <p className="text-xs line-clamp-2 mt-2 text-muted-foreground">
                  {(item.editedText || item.generatedText).substring(0, 100)}
                </p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ContentDraftsList;
