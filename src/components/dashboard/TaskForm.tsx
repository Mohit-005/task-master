
'use client';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, Sparkles, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

import { suggestTaskTagsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import { Badge } from '../ui/badge';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  dueDate: z.date().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  boardId: string;
  task?: Task;
  status?: TaskStatus;
  onSuccess: (boardId: string, task: Omit<Task, 'id' | 'userId' | 'boardId'> & { id?: string, status: TaskStatus }) => void;
  setOpen: (open: boolean) => void;
}

export function TaskForm({ boardId, task, status, onSuccess, setOpen }: TaskFormProps) {
  const { toast } = useToast();
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      tags: task?.tags || [],
    },
  });
  
  const watchDescription = form.watch('description');

  const handleSuggestTags = async () => {
    if (!watchDescription) {
      toast({
        title: 'Description needed',
        description: 'Please enter a task description to get AI suggestions.',
        variant: 'destructive',
      });
      return;
    }

    startSuggestionTransition(async () => {
      const tags = await suggestTaskTagsAction(watchDescription);
      setSuggestedTags(tags);
    });
  };

  const addSuggestedTag = (tag: string) => {
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(tag)) {
      form.setValue('tags', [...currentTags, tag]);
    }
  };

  function onSubmit(data: TaskFormValues) {
    const taskData = {
      id: task?.id,
      title: data.title,
      description: data.description || '',
      status: task?.status || status || 'todo',
      dueDate: data.dueDate,
      tags: data.tags || [],
    };
    onSuccess(boardId, taskData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Finalize Q3 report" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about the task..."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                        )}
                        >
                        {field.value ? (
                            format(field.value, 'PPP')
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add tags, comma separated"
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value ? e.target.value.split(',').map(tag => tag.trim()) : [];
                        field.onChange(tags);
                      }}
                    />
                  </FormControl>
                   <div className="flex items-start gap-2 pt-2">
                      <Tag className="h-3 w-3 mt-1 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-xs text-muted-foreground">Current tags:</span>
                        {(form.getValues('tags')?.length || 0) > 0 ? form.getValues('tags')?.map(t => <Badge key={t} variant="secondary">{t}</Badge>) : <span className="text-xs text-muted-foreground">None</span>}
                      </div>
                    </div>
                </FormItem>
              )}
            />
        </div>
        
        <div>
          <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggesting}>
            {isSuggesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Suggest Tags with AI
          </Button>
          {suggestedTags.length > 0 && (
            <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">Click to add a suggested tag:</p>
                <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                    <Button key={tag} type="button" size="sm" variant="secondary" onClick={() => addSuggestedTag(tag)}>
                    {tag}
                    </Button>
                ))}
                </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
