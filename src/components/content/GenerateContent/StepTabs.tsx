
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StepTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasGeneratedContent: boolean;
  hasCustomizedContent: boolean;
  children: React.ReactNode;
}

export const StepTabs: React.FC<StepTabsProps> = ({
  activeTab,
  setActiveTab,
  hasGeneratedContent,
  hasCustomizedContent,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="generate">1. Generate</TabsTrigger>
        <TabsTrigger 
          value="customize" 
          disabled={!hasGeneratedContent}
        >
          2. Customize
        </TabsTrigger>
        <TabsTrigger 
          value="publish" 
          disabled={!hasCustomizedContent}
        >
          3. Publish
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};
