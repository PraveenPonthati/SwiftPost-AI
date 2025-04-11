
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  MessageSquare, 
  Calendar as CalendarIcon,
  BarChart4,
  Clock,
  ArrowRight,
  Pencil,
  Loader2
} from 'lucide-react';
import { Content } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { Link } from 'react-router-dom';

const Index = () => {
  const { content, scheduledPosts, setActiveContent, loadContent } = useContent();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadContent();
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [loadContent]);
  
  // Stats for dashboard
  const stats = {
    drafts: content.filter(item => item.status === 'draft').length,
    scheduled: content.filter(item => item.status === 'scheduled').length,
    published: content.filter(item => item.status === 'published').length,
    upcomingPosts: scheduledPosts.filter(post => new Date(post.scheduledFor) > new Date()).length
  };
  
  // Recent content
  const recentContent = [...content].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);
  
  // Next scheduled posts
  const nextScheduled = [...scheduledPosts]
    .filter(post => new Date(post.scheduledFor) > new Date())
    .sort((a, b) => 
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    )
    .slice(0, 3);

  // Handle selecting content to edit
  const handleEditContent = (item: Content) => {
    setActiveContent(item);
    navigate('/generate');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="ml-64 p-8 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link to="/generate">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Content
            </Link>
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-3xl">{stats.drafts}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Scheduled</CardDescription>
              <CardTitle className="text-3xl">{stats.scheduled}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-3xl">{stats.published}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Upcoming Posts</CardDescription>
              <CardTitle className="text-3xl">{stats.upcomingPosts}</CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={18} />
                Recent Content
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/generate">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentContent.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No content yet. Create some content to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentContent.map((item) => (
                    <div key={item.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.title || "Untitled"}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditContent(item)}
                        >
                          <Pencil size={14} />
                          <span className="ml-1">Edit</span>
                        </Button>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Next Scheduled */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} />
                Next Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextScheduled.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No scheduled posts. Schedule some content to see it here.
                </p>
              ) : (
                <div className="space-y-4">
                  {nextScheduled.map((post) => {
                    const contentItem = content.find(c => c.id === post.contentId);
                    return (
                      <div key={post.id} className="border-b pb-3 last:border-0">
                        <h3 className="font-medium">
                          {contentItem?.title || "Untitled"}
                        </h3>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="capitalize text-brand-600">
                            {post.platform}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(post.scheduledFor).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto flex-col items-center justify-center py-6">
                <Link to="/generate">
                  <PlusCircle className="h-10 w-10 mb-2" />
                  <span>Create Content</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col items-center justify-center py-6">
                <Link to="/calendar">
                  <CalendarIcon className="h-10 w-10 mb-2" />
                  <span>View Calendar</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col items-center justify-center py-6">
                <Link to="/settings">
                  <BarChart4 className="h-10 w-10 mb-2" />
                  <span>Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
