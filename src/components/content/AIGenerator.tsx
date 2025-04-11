import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, Copy, Settings, Save, RefreshCcw } from 'lucide-react';
import { generateContent, GenerationOptions, getAvailableModels, AIModel, getApiKey } from '@/utils/aiService';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIGeneratorProps {
  onContentGenerated: (text: string, prompt: string) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onContentGenerated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>('gemini');
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [autoSave, setAutoSave] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: '',
    topic: '',
    tone: 'professional',
    length: 'medium',
    includeHashtags: true,
    provider: 'gemini',
    model: 'models/gemini-2.0-flash'
  });

  useEffect(() => {
    const models = getAvailableModels(provider);
    setAvailableModels(models);
    
    if (models.length > 0) {
      if (provider === 'gemini') {
        const flash = models.find(m => m.id === 'models/gemini-2.0-flash');
        setOptions(prev => ({ ...prev, provider, model: flash ? flash.id : models[0].id }));
      } else {
        setOptions(prev => ({ ...prev, provider, model: models[0].id }));
      }
    } else {
      setOptions(prev => ({ ...prev, provider, model: 'default' }));
    }
    
    if (provider !== 'mock') {
      const apiKey = getApiKey(provider);
      if (!apiKey) {
        toast({
          title: `No ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key`,
          description: `Please add your API key in Settings to use ${provider === 'openai' ? 'OpenAI' : 'Gemini'} models.`,
          variant: "destructive"
        });
      }
    }
  }, [provider, toast]);

  const handleGenerate = async () => {
    if (!options.prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate content.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setShowLoadingAnimation(true);
    try {
      const text = await generateContent(options);
      setGeneratedText(text);
      
      if (autoSave) {
        onContentGenerated(text, options.prompt);
        toast({
          title: "Content Auto-Saved",
          description: "Generated content has been automatically saved."
        });
      } else {
        toast({
          title: "Content Generated",
          description: "AI has successfully generated content. Click Save to use it."
        });
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred while generating content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowLoadingAnimation(false);
    }
  };
  
  const handleIterate = async () => {
    if (!options.prompt.trim()) {
      toast({
        title: "No Previous Prompt",
        description: "Please generate content first before iterating.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setShowLoadingAnimation(true);
    try {
      const iterateOptions = {
        ...options,
        prompt: options.prompt + " (Alternative version)"
      };
      const text = await generateContent(iterateOptions);
      setGeneratedText(text);
      
      if (autoSave) {
        onContentGenerated(text, iterateOptions.prompt);
        toast({
          title: "Iteration Auto-Saved",
          description: "New version has been automatically saved."
        });
      } else {
        toast({
          title: "New Version Generated",
          description: "A new version of your content has been created."
        });
      }
    } catch (error: any) {
      console.error('Error iterating content:', error);
      toast({
        title: "Iteration Failed",
        description: error.message || "An error occurred while creating a new version. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowLoadingAnimation(false);
    }
  };

  const handleSave = () => {
    if (!generatedText) {
      toast({
        title: "No Content",
        description: "Please generate content first before saving.",
        variant: "destructive"
      });
      return;
    }
    
    onContentGenerated(generatedText, options.prompt);
    toast({
      title: "Content Saved",
      description: "Generated content has been saved and moved to the customize step."
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const toggleAutoSave = (checked: boolean) => {
    setAutoSave(checked);
    toast({
      title: checked ? "Auto-Save Enabled" : "Auto-Save Disabled",
      description: checked 
        ? "Generated content will be automatically saved" 
        : "You'll need to manually save generated content"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600" />
            AI Content Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={toggleAutoSave}
              />
              <Label htmlFor="auto-save" className="text-sm cursor-pointer">
                Auto-Save
              </Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings size={16} className="mr-2" />
                  AI Provider
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setProvider('openai')} className={provider === 'openai' ? 'bg-accent' : ''}>
                  OpenAI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProvider('gemini')} className={provider === 'gemini' ? 'bg-accent' : ''}>
                  Gemini
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProvider('mock')} className={provider === 'mock' ? 'bg-accent' : ''}>
                  Demo Mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription>
          Generate engaging social media content with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea 
            id="prompt"
            placeholder="E.g., 'Write a post about our new product launch'"
            value={options.prompt}
            onChange={(e) => setOptions({...options, prompt: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input 
              id="topic"
              placeholder="E.g., travel, food, tech"
              value={options.topic}
              onChange={(e) => setOptions({...options, topic: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select 
              value={options.tone} 
              onValueChange={(value) => setOptions({...options, tone: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length">Content Length</Label>
            <Select 
              value={options.length} 
              onValueChange={(value: 'short' | 'medium' | 'long') => 
                setOptions({...options, length: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select 
              value={options.model} 
              onValueChange={(value) => setOptions({...options, model: value})}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="default">Default Model</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="hashtags">Include Hashtags</Label>
          <Switch 
            id="hashtags"
            checked={options.includeHashtags}
            onCheckedChange={(checked) => 
              setOptions({...options, includeHashtags: checked})
            }
          />
        </div>
        
        {showLoadingAnimation && loading && (
          <div className="my-4 relative overflow-hidden h-2 rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md flex items-center gap-2 text-xs">
              <Loader2 size={12} className="animate-spin text-primary" />
              <span>Generating...</span>
            </div>
          </div>
        )}
        
        {generatedText && !loading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Content</Label>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy size={14} className="mr-2" />
                Copy
              </Button>
            </div>
            <div className="p-6 bg-muted rounded-md whitespace-pre-wrap text-lg text-gray-800 font-serif leading-relaxed">
              {generatedText}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleGenerate} 
          disabled={loading} 
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Generate Content
            </>
          )}
        </Button>
        
        {generatedText && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleIterate}
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCcw size={16} className="mr-2" />
              Iterate
            </Button>
            
            {!autoSave && (
              <Button 
                onClick={handleSave} 
                className="w-full sm:w-auto"
                variant="outline"
              >
                <Save size={16} className="mr-2" />
                Save Content
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIGenerator;
