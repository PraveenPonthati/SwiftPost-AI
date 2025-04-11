
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, RefreshCw } from 'lucide-react';
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
  const { content, loadContent } = useContent();
  
  // Refresh content when needed
  const handleRefresh = async () => {
    await loadContent();
  };
  
  // Sort content by creation date (newest first)
  const sortedContent = [...content].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (sortedContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="h-12 w-12 mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No content drafts yet</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
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
                  {item.updatedAt ? format(new Date(item.updatedAt), 'PPP') : 'Unknown date'} · {item.status}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  // The deleteContent function is handled by the parent component
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SavedContentSidebar;
