
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContent } from '@/contexts/ContentContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SocialPlatform } from '@/types/content';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin 
} from 'lucide-react';

const ContentCalendar: React.FC = () => {
  const { scheduledPosts, content } = useContent();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={16} />;
      case 'facebook':
        return <Facebook size={16} />;
      case 'twitter':
        return <Twitter size={16} />;
      case 'linkedin':
        return <Linkedin size={16} />;
    }
  };

  // Filter posts based on selected platform
  const filteredPosts = platformFilter === 'all' 
    ? scheduledPosts 
    : scheduledPosts.filter(post => post.platform === platformFilter);
  
  // Group posts by date for the calendar
  const postsByDate = filteredPosts.reduce<Record<string, typeof scheduledPosts>>((acc, post) => {
    const dateStr = post.scheduledFor.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(post);
    return acc;
  }, {});
  
  // Function to render post counts on calendar
  const renderPostCount = (date: Date) => {
    const dateStr = date.toDateString();
    const posts = postsByDate[dateStr];
    
    if (!posts || posts.length === 0) return null;
    
    return (
      <div className="flex justify-center">
        <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center">
          {posts.length}
        </Badge>
      </div>
    );
  };
  
  // Find posts for the selected date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const postsForSelectedDate = selectedDate
    ? scheduledPosts.filter(post => 
        post.scheduledFor.toDateString() === selectedDate.toDateString() &&
        (platformFilter === 'all' || post.platform === platformFilter)
      )
    : [];
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Content Calendar</CardTitle>
            <Select 
              value={platformFilter} 
              onValueChange={setPlatformFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            className="rounded-md border w-full"
            components={{
              DayContent: ({ date }) => (
                <div className="w-full flex flex-col items-center">
                  <span>{date.getDate()}</span>
                  {renderPostCount(date)}
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? (
              <>Posts on {selectedDate.toLocaleDateString()}</>
            ) : (
              <>Select a Date</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {postsForSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {postsForSelectedDate.map(post => {
                const contentItem = content.find(c => c.id === post.contentId);
                return (
                  <div key={post.id} className="border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getPlatformIcon(post.platform)}
                      <span className="font-medium capitalize">{post.platform}</span>
                      <Badge variant={post.status === 'pending' ? 'outline' : post.status === 'published' ? 'default' : 'destructive'}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm truncate">{contentItem?.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentCalendar;
