'use client';
import { TaskColumn } from './TaskColumn';
import type { Task, TaskStatus } from '@/types';
import { useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

interface BoardViewProps {
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
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

export function BoardView({ tasks, onAddTask, onToggleComplete, onEditTask, onDeleteTask, onDragEnd }: BoardViewProps) {
  const columns = useMemo(() => {
    return (Object.keys(statusMap) as TaskStatus[]).map(status => ({
      id: status,
      title: statusMap[status],
      tasks: tasks.filter(task => task.status === status),
    }));
  }, [tasks]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 lg:p-6">
        {columns.map(column => (
          <TaskColumn
            key={column.id}
            columnId={column.id}
            title={column.title}
            tasks={column.tasks}
            onAddTask={() => onAddTask(column.id)}
            onToggleComplete={onToggleComplete}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
