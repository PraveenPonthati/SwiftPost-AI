
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import SocialConnector from '@/components/content/SocialConnector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  return (
    <div className="ml-64 p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="social">
        <TabsList className="mb-6">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="social">
          <SocialConnector />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Meta Graph API Configuration</CardTitle>
              <CardDescription>
                Instructions for setting up your Meta Graph API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">1. Create a Developer Account</h3>
                  <p className="text-muted-foreground text-sm">
                    Register as a developer at the Meta Developer Portal to get access to the Graph API.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">2. Create an App</h3>
                  <p className="text-muted-foreground text-sm">
                    Create a new app in the Developer Portal and configure it for Instagram API access.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">3. Configure Permissions</h3>
                  <p className="text-muted-foreground text-sm">
                    Request the necessary permissions: instagram_basic, instagram_content_publish, and pages_read_engagement.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">4. Generate Access Tokens</h3>
                  <p className="text-muted-foreground text-sm">
                    Generate the necessary access tokens and add them to your .env file as shown in the example.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider Settings</CardTitle>
              <CardDescription>
                Configure your AI provider and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                AI settings configuration will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Account settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
