
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Board } from '@/types';

const boardFormSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(50),
});

type BoardFormValues = z.infer<typeof boardFormSchema>;

interface EditBoardFormProps {
  board?: Board;
  onSuccess: (boardId: string, data: BoardFormValues) => void;
  setOpen: (open: boolean) => void;
}

export function EditBoardForm({ board, onSuccess, setOpen }: EditBoardFormProps) {
  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: {
      name: board?.name || '',
    },
  });

  useEffect(() => {
    if (board) {
      form.reset({ name: board.name });
    }
  }, [board, form]);

  const { isSubmitting } = form.formState;

  function onSubmit(data: BoardFormValues) {
    if (board?.id) {
        onSuccess(board.id, data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Board Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Marketing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
