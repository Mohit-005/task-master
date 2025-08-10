'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '@/types';
import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  columnId: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: () => void;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskColumn({ columnId, title, tasks, onAddTask, onToggleComplete, onEditTask, onDeleteTask }: TaskColumnProps) {
  return (
    <div className="flex flex-col rounded-lg bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-headline font-semibold flex items-center">
          {title}
          <span className="ml-2 text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h2>
        <Button variant="ghost" size="sm" onClick={onAddTask} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "p-4 bg-muted/20 rounded-b-lg flex-grow min-h-[200px] transition-colors",
              snapshot.isDraggingOver && "bg-primary/10"
            )}
          >
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">No tasks here.</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
