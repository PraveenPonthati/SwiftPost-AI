
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import SocialConnector from '@/components/content/SocialConnector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiKey, saveApiKey } from '@/utils/aiService';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    // Load API keys from localStorage when component mounts
    setOpenaiKey(getApiKey('openai') || '');
    setGeminiKey(getApiKey('gemini') || '');
  }, []);

  const handleSaveOpenAI = () => {
    saveApiKey('openai', openaiKey.trim());
    toast({
      title: "OpenAI API Key Saved",
      description: "Your OpenAI API key has been saved successfully.",
    });
  };

  const handleSaveGemini = () => {
    saveApiKey('gemini', geminiKey.trim());
    toast({
      title: "Gemini API Key Saved",
      description: "Your Gemini API key has been saved successfully.",
    });
  };

  return (
    <div className="ml-64 p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="ai">
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
                Configure your AI provider API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
                <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
                <AlertDescription className="text-blue-800">
                  Your API keys are stored securely in your browser's local storage and are never sent to our servers.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">OpenAI</h3>
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="openai-key" 
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..." 
                      className="flex-1"
                    />
                    <Button onClick={handleSaveOpenAI}>Save</Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Get your API key from the <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">OpenAI dashboard</a>. Recommended models: GPT-4o Mini, GPT-4o.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Google Gemini</h3>
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">Gemini API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="gemini-key" 
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIza..." 
                      className="flex-1"
                    />
                    <Button onClick={handleSaveGemini}>Save</Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Get your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>. Recommended models: Gemini Pro, Gemini 1.5 Pro.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Chat History</CardTitle>
              <CardDescription>
                Configure your chat history storage settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Your AI chat history will be stored in your Supabase database.</p>
              <Button variant="outline">Connect to Supabase</Button>
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
