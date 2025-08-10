'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ListViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragEnd: (result: DropResult) => void;
}

const statusMap: { [key in TaskStatus]: string } = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export function ListView({ tasks, onToggleComplete, onEditTask, onDeleteTask, onDragEnd }: ListViewProps) {
  const columns = useMemo(() => {
    return (Object.keys(statusMap) as TaskStatus[]).map(status => ({
      id: status,
      title: statusMap[status],
      tasks: tasks.filter(task => task.status === status),
    }));
  }, [tasks]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-4 lg:p-6 space-y-6">
        {columns.map(column => (
          <Card key={column.id}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-headline">
                {column.title}
                <span className="ml-2 text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {column.tasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <Droppable droppableId={column.id} type="task">
                  {(provided, snapshot) => (
                    <TableBody 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={cn(
                        "transition-colors",
                        snapshot.isDraggingOver && "bg-primary/10"
                      )}
                    >
                      {column.tasks.length > 0 ? column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onDoubleClick={() => onEditTask(task)}
                              className={cn(
                                "cursor-pointer",
                                task.status === 'done' ? 'bg-muted/50' : '',
                                snapshot.isDragging && 'shadow-lg ring-2 ring-primary'
                              )}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={task.status === 'done'}
                                  onCheckedChange={() => onToggleComplete(task.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{task.title}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditTask(task); }}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No tasks in this section.
                          </TableCell>
                        </TableRow>
                      )}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
}
