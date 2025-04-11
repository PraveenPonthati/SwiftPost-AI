
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import AIGenerator from '@/components/content/AIGenerator';

interface GenerateStepProps {
  onContentGenerated: (text: string, prompt: string) => void;
  active: boolean;
}

export const GenerateStep: React.FC<GenerateStepProps> = ({ 
  onContentGenerated,
  active
}) => {
  return (
    <TabsContent value="generate" forceMount hidden={!active}>
      <AIGenerator onContentGenerated={onContentGenerated} />
    </TabsContent>
  );
};
