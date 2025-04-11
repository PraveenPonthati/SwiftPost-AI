
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { format } from 'date-fns';
import { Content } from '@/types/content';

interface SavedContentSidebarProps {
  onSelectContent: (content: Content) => void;
  activeContentId?: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const SavedContentSidebar: React.FC<SavedContentSidebarProps> = ({
  onSelectContent,
  activeContentId,
  isVisible,
  onToggleVisibility,
}) => {
  const { content, loadContent, deleteContent } = useContent();
  
  // Refresh content when needed
  const handleRefresh = async () => {
    await loadContent();
  };
  
  // Sort content by creation date (newest first)
  const sortedContent = [...content].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (!isVisible) {
    return (
      <div className="w-10 border rounded-md p-2 flex flex-col items-center">
        <div className="font-semibold mb-3 rotate-90 whitespace-nowrap transform origin-center my-20">
          Saved Drafts
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleVisibility}
          className="mt-auto"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (sortedContent.length === 0) {
    return (
      <div className="w-64 border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Saved Drafts</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleVisibility}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
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
      </div>
    );
  }

  return (
    <div className="w-64 border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Saved Drafts</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleVisibility}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-180px)] pr-4">
        <div className="space-y-2">
          {sortedContent.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border cursor-pointer group transition-colors ${
                activeContentId === item.id
                  ? 'bg-primary/10 border-primary/20'
                  : 'hover:bg-accent'
              }`}
              onClick={() => onSelectContent(item)}
            >
              <div className="flex items-center justify-between">
                <div className="max-w-[80%]">
                  <p className="font-medium truncate">{item.title || 'Untitled Content'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.updatedAt ? format(new Date(item.updatedAt), 'PPP') : 'Unknown date'} · {item.status}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-100 h-8 w-8 p-0 ml-1 min-w-[32px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteContent(item.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SavedContentSidebar;
