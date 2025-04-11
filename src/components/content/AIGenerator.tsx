
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, Copy, Settings } from 'lucide-react';
import { generateContent, GenerationOptions, getAvailableModels, AIModel, getApiKey } from '@/utils/aiService';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIGeneratorProps {
  onContentGenerated: (text: string) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onContentGenerated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>('openai');
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: '',
    topic: '',
    tone: 'professional',
    length: 'medium',
    includeHashtags: true,
    provider: 'openai',
    model: 'gpt-4o-mini'
  });

  useEffect(() => {
    // Update available models when provider changes
    const models = getAvailableModels(provider);
    setAvailableModels(models);
    
    // Set default model for the selected provider
    if (models.length > 0) {
      setOptions(prev => ({ ...prev, provider, model: models[0].id }));
    }
    
    // Check if API key exists
    const apiKey = getApiKey(provider);
    if (!apiKey && provider !== 'mock') {
      toast({
        title: `No ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key`,
        description: `Please add your API key in Settings to use ${provider === 'openai' ? 'OpenAI' : 'Gemini'} models.`,
        variant: "destructive"
      });
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
    try {
      const text = await generateContent(options);
      setGeneratedText(text);
      onContentGenerated(text);
      toast({
        title: "Content Generated",
        description: "AI has successfully generated content based on your prompt."
      });
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred while generating content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
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
        
        {generatedText && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Content</Label>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy size={14} className="mr-2" />
                Copy
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
              {generatedText}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
};

export default AIGenerator;
