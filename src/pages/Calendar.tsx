
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ContentCalendar from '@/components/content/ContentCalendar';

const Calendar = () => {
  return (
    <div className="ml-64 p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
      </div>
      
      <ContentCalendar />
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Tips</CardTitle>
            <CardDescription>
              Best practices for scheduling your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-medium">Consistency is key</span> - Post regularly to keep your audience engaged
              </li>
              <li>
                <span className="font-medium">Find your optimal times</span> - Analyze when your audience is most active
              </li>
              <li>
                <span className="font-medium">Plan ahead</span> - Create a content calendar for at least a week in advance
              </li>
              <li>
                <span className="font-medium">Mix content types</span> - Alternate between different formats and topics
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
