
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Content } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ContentDraftsListProps {
  onDragStart: (content: Content) => void;
}

const ContentDraftsList: React.FC<ContentDraftsListProps> = ({ onDragStart }) => {
  const { content } = useContent();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Sort content by update date (newest first) and filter by search term
  const filteredContent = React.useMemo(() => {
    return [...content]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          (item.title || '').toLowerCase().includes(searchLower) ||
          (item.editedText || item.generatedText).toLowerCase().includes(searchLower)
        );
      });
  }, [content, searchTerm]);

  if (content.length === 0) {
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
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search drafts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Drag any draft onto a template to use it
        </p>
        <ScrollArea className="h-[calc(100vh-270px)]">
          <div className="space-y-3">
            {filteredContent.length > 0 ? (
              filteredContent.map(item => (
                <Card 
                  key={item.id} 
                  className="p-3 cursor-grab hover:shadow-md transition-shadow border-border relative group" 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      id: item.id,
                      title: item.title,
                      text: item.editedText || item.generatedText
                    }));
                    e.dataTransfer.effectAllowed = 'copy';
                    onDragStart(item);
                  }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg"></div>
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
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No matching drafts found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ContentDraftsList;
