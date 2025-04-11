
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { format } from 'date-fns';
import { Content } from '@/types/content';

interface SavedContentSidebarProps {
  onSelectContent: (content: Content) => void;
  activeContentId?: string;
}

const SavedContentSidebar: React.FC<SavedContentSidebarProps> = ({
  onSelectContent,
  activeContentId,
}) => {
  const { content, deleteContent } = useContent();
  
  // Sort content by creation date (newest first)
  const sortedContent = [...content].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="h-12 w-12 mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No content drafts yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-180px)] pr-4">
      <div className="space-y-2">
        {sortedContent.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer group transition-colors ${
              activeContentId === item.id
                ? 'bg-primary/10 border-primary/20'
                : 'hover:bg-accent'
            }`}
            onClick={() => onSelectContent(item)}
          >
            <div className="truncate">
              <p className="font-medium truncate">{item.title || 'Untitled Content'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {format(new Date(item.createdAt), 'PPP')} · {item.status}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                deleteContent(item.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SavedContentSidebar;
