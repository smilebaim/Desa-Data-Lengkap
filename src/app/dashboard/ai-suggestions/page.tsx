'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAiSuggestions } from './actions';
import { villages } from '@/lib/data';
import { Lightbulb, Wand2 } from 'lucide-react';

const formSchema = z.object({
  villageName: z.string().min(1, 'Please select a village.'),
  recentNews: z.string().min(10, 'Please provide some recent news (min. 10 characters).'),
  currentTrends: z.string().min(10, 'Please describe current trends (min.10 characters).'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiSuggestionsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      villageName: '',
      recentNews: '',
      currentTrends: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setSuggestions([]);
    const response = await getAiSuggestions(values);

    if (response.success && response.data) {
      setSuggestions(response.data.suggestions);
      toast({
        title: 'Suggestions Generated!',
        description: 'Here are some new content ideas for you.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Generating Suggestions',
        description: response.error || 'An unexpected error occurred.',
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Content Suggestion Tool</CardTitle>
          <CardDescription>
            Generate content ideas for your village based on the latest news and trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="villageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a village" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {villages.map(v => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recentNews"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recent News</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'New bridge construction completed', 'Local market expanded...'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentTrends"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Trends</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'Increased tourism interest', 'Youth returning to village...'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Suggestions
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Generated Suggestions</CardTitle>
          <CardDescription>
            Here are the AI-powered content ideas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
             <div className="space-y-4">
                <div className="flex items-start space-x-3"><Lightbulb className="h-5 w-5 flex-shrink-0 text-primary animate-pulse" /><div className="h-4 w-3/4 rounded bg-muted"></div></div>
                <div className="flex items-start space-x-3"><Lightbulb className="h-5 w-5 flex-shrink-0 text-primary animate-pulse" /><div className="h-4 w-full rounded bg-muted"></div></div>
                <div className="flex items-start space-x-3"><Lightbulb className="h-5 w-5 flex-shrink-0 text-primary animate-pulse" /><div className="h-4 w-1/2 rounded bg-muted"></div></div>
             </div>
          )}
          {!isLoading && suggestions.length === 0 && (
            <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
              <p>Your suggestions will appear here.</p>
            </div>
          )}
          {suggestions.length > 0 && (
            <ul className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 flex-shrink-0 text-primary" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
