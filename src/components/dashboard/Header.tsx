'use client';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { LayoutGrid, List, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Board } from '@/types';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  boards: Board[];
  activeBoard: Board | undefined;
  viewMode: 'board' | 'list';
  onViewModeChange: (mode: 'board' | 'list') => void;
  onAddTask: () => void;
}

export function Header({ boards, activeBoard, viewMode, onViewModeChange, onAddTask }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <h1 className="text-xl font-semibold font-headline md:text-2xl">
        {activeBoard?.name || 'Dashboard'}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={viewMode === 'board' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('board')}
            className={cn("rounded-md", viewMode === 'board' && 'shadow-sm')}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Board</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={cn("rounded-md", viewMode === 'list' && 'shadow-sm')}
          >
            <List className="h-4 w-4" />
             <span className="ml-2 hidden sm:inline">List</span>
          </Button>
        </div>
        <Button onClick={onAddTask} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
        <ThemeSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
