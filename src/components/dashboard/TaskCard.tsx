
'use client';
import { formatDistanceToNow, isPast, differenceInHours, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/types';
import { CalendarIcon, MoreVertical, Pencil, Tag, Trash2 } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';


interface TaskCardProps {
  task: Task;
  index: number;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, index, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'done';

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const dueDateInWords = dueDateObj && !Number.isNaN(dueDateObj.getTime())
    ? formatDistanceToNow(dueDateObj, { addSuffix: true })
    : null;
  
  const isDueSoon = task.dueDate 
    ? !isCompleted && differenceInHours(new Date(task.dueDate), new Date()) <= 24 && differenceInHours(new Date(task.dueDate), new Date()) >= 0
    : false;
    
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isCompleted;

  const statusColors = {
    todo: 'border-blue-500',
    'in-progress': 'border-yellow-500',
    done: 'border-green-500',
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card 
            onDoubleClick={() => onEdit(task)}
            className={cn(
              "mb-4 border-l-4 cursor-pointer", 
              isOverdue || isDueSoon ? "border-red-500" : statusColors[task.status],
              snapshot.isDragging && "shadow-lg ring-2 ring-primary"
            )}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={isCompleted}
                  onCheckedChange={() => onToggleComplete(task.id)}
                  aria-label={`Mark task "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
                />
                <CardTitle
                  className={cn(
                    "text-base font-medium leading-tight",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {task.description && (
                <div className={cn("text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert", isCompleted && "text-muted-foreground/70")}>
                  <ReactMarkdown
                      components={{
                        code({node, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <pre className="font-code bg-muted p-2 rounded-md my-2 text-foreground overflow-x-auto">
                              <code className={cn("font-code", className)} {...props}>
                                  {children}
                              </code>
                            </pre>
                          ) : (
                            <code className={cn("font-code bg-muted rounded-sm px-1 py-0.5", className)} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {task.description}
                  </ReactMarkdown>
                </div>
              )}
              <div className="flex items-end justify-between mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1 font-normal">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {task.createdAt && !Number.isNaN(new Date(task.createdAt).getTime()) && (
                    <Badge variant="outline" className="font-normal whitespace-nowrap">
                      <span className="text-xs text-muted-foreground">Created {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                    </Badge>
                  )}
                  {dueDateInWords && (
                  <Badge variant={isOverdue || isDueSoon ? 'destructive' : 'outline'} className="flex items-center gap-1 font-normal whitespace-nowrap">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{dueDateInWords}</span>
                  </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
