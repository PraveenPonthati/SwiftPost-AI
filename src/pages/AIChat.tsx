
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateContent, getApiKey } from '@/utils/aiService';
import { SendHorizonal, Settings, Sparkles, User, Bot, Copy, Trash } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const AIChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I am your AI assistant. How can I help you create content today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>('mock');
  const [tone, setTone] = useState('professional');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if API keys are set
  const openaiKeyExists = !!getApiKey('openai');
  const geminiKeyExists = !!getApiKey('gemini');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      // Check if API key is set for selected provider
      if (provider === 'openai' && !openaiKeyExists) {
        toast({
          title: 'API Key Missing',
          description: 'Please add your OpenAI API key in the settings tab.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      if (provider === 'gemini' && !geminiKeyExists) {
        toast({
          title: 'API Key Missing',
          description: 'Please add your Gemini API key in the settings tab.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Generate content
      const response = await generateContent({
        prompt: userMessage.content,
        provider,
        tone,
      });

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I am your AI assistant. How can I help you create content today?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="ml-64 p-8 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">AI Chat</h1>
        </div>

        <Tabs defaultValue="chat">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-600" />
                  AI Chat Assistant
                </CardTitle>
                <CardDescription>
                  Chat with our AI assistant to generate content for your social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Label>Provider:</Label>
                    <Select value={provider} onValueChange={(val) => setProvider(val as 'openai' | 'gemini' | 'mock')}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mock">Demo (Mock)</SelectItem>
                        <SelectItem value="openai" disabled={!openaiKeyExists}>
                          OpenAI {!openaiKeyExists && '(API Key Missing)'}
                        </SelectItem>
                        <SelectItem value="gemini" disabled={!geminiKeyExists}>
                          Gemini {!geminiKeyExists && '(API Key Missing)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label>Tone:</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline" size="icon" onClick={clearChat}>
                    <Trash size={16} />
                  </Button>
                </div>
                
                <Card className="border border-input">
                  <ScrollArea className="h-[500px] p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`flex max-w-[80%] rounded-lg p-4 ${
                              message.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="mr-2 mt-0.5">
                              {message.sender === 'user' ? (
                                <User size={16} />
                              ) : (
                                <Bot size={16} />
                              )}
                            </div>
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <div className="flex items-center justify-between text-xs opacity-50">
                                <span>
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {message.sender === 'ai' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopy(message.content)}
                                  >
                                    <Copy size={12} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </Card>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="flex-grow"
                  />
                  <Button type="submit" disabled={loading || !prompt.trim()}>
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <SendHorizonal size={16} className="mr-2" />
                        Send
                      </span>
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={18} />
                  API Settings
                </CardTitle>
                <CardDescription>
                  Configure your AI provider API keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      defaultValue={getApiKey('openai')}
                      onChange={(e) => {
                        const { value } = e.target;
                        if (value) {
                          localStorage.setItem('openai_api_key', value);
                          toast({
                            title: 'API Key Saved',
                            description: 'Your OpenAI API key has been saved.'
                          });
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get your API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      OpenAI's website
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemini-key">Gemini API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="gemini-key"
                      type="password"
                      placeholder="AI..."
                      defaultValue={getApiKey('gemini')}
                      onChange={(e) => {
                        const { value } = e.target;
                        if (value) {
                          localStorage.setItem('gemini_api_key', value);
                          toast({
                            title: 'API Key Saved',
                            description: 'Your Gemini API key has been saved.'
                          });
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get your API key from{' '}
                    <a
                      href="https://ai.google.dev/tutorials/setup"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIChat;
