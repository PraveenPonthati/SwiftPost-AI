
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
import { InfoIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadApiKeysFromDatabase();
    } else {
      // If not logged in, fallback to localStorage
      setOpenaiKey(getApiKey('openai') || '');
      setGeminiKey(getApiKey('gemini') || '');
    }
  }, [user]);

  const loadApiKeysFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('provider, api_key')
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      if (data) {
        data.forEach(item => {
          if (item.provider === 'openai') {
            setOpenaiKey(item.api_key);
            // Also update localStorage for compatibility
            saveApiKey('openai', item.api_key);
          } else if (item.provider === 'gemini') {
            setGeminiKey(item.api_key);
            // Also update localStorage for compatibility
            saveApiKey('gemini', item.api_key);
          }
        });
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: "Failed to load API keys",
        description: "There was an error retrieving your saved API keys",
        variant: "destructive"
      });
    }
  };

  const saveApiKeyToDatabase = async (provider: string, apiKey: string) => {
    if (!user) return;

    setIsSaving(prev => ({ ...prev, [provider]: true }));
    
    try {
      // Save to localStorage for compatibility with existing code
      saveApiKey(provider, apiKey.trim());
      
      // Also save to database for persistence
      const { data, error } = await supabase
        .from('user_api_keys')
        .upsert(
          {
            user_id: user.id,
            provider,
            api_key: apiKey.trim()
          },
          {
            onConflict: 'user_id,provider'
          }
        );

      if (error) {
        throw error;
      }
      
      toast({
        title: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key Saved`,
        description: `Your ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key has been saved successfully.`,
      });
    } catch (error: any) {
      console.error(`Error saving ${provider} API key:`, error);
      toast({
        title: `Failed to Save API Key`,
        description: error.message || "An error occurred while saving your API key",
        variant: "destructive"
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSaveOpenAI = () => {
    saveApiKeyToDatabase('openai', openaiKey);
  };

  const handleSaveGemini = () => {
    saveApiKeyToDatabase('gemini', geminiKey);
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
                  {user 
                    ? "Your API keys are securely stored in your account and synchronized across devices." 
                    : "Your API keys are stored securely in your browser's local storage and are never sent to our servers."}
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
                    <Button 
                      onClick={handleSaveOpenAI}
                      disabled={isSaving.openai}
                    >
                      {isSaving.openai ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Save
                    </Button>
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
                    <Button 
                      onClick={handleSaveGemini}
                      disabled={isSaving.gemini}
                    >
                      {isSaving.gemini ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Save
                    </Button>
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
                Your chat history is stored in the Supabase database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Your AI chat history is automatically saved to the Supabase database.</p>
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
              {user ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="p-2 bg-muted rounded border">{user.email}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Account ID</Label>
                    <div className="p-2 bg-muted rounded border font-mono text-xs">{user.id}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Last Sign In</Label>
                    <div className="p-2 bg-muted rounded border">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Please sign in to view account details.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
