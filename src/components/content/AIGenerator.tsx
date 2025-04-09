
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, Copy } from 'lucide-react';
import { generateContent, GenerationOptions } from '@/utils/aiService';
import { useToast } from '@/components/ui/use-toast';

interface AIGeneratorProps {
  onContentGenerated: (text: string) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onContentGenerated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: '',
    topic: '',
    tone: 'professional',
    length: 'medium',
    includeHashtags: true
  });

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
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating content. Please try again.",
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
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-600" />
          AI Content Generator
        </CardTitle>
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
          
          <div className="flex items-center justify-between pt-8">
            <Label htmlFor="hashtags">Include Hashtags</Label>
            <Switch 
              id="hashtags"
              checked={options.includeHashtags}
              onCheckedChange={(checked) => 
                setOptions({...options, includeHashtags: checked})
              }
            />
          </div>
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
