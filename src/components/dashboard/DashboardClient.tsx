
'use client';
import { useState, useEffect } from 'react';
import {
  CheckSquare,
  LayoutDashboard,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import type { DropResult } from '@hello-pangea/dnd';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import type { Board, Task, TaskStatus, User } from '@/types';
import { BoardView } from './BoardView';
import { Header } from './Header';
import { ListView } from './ListView';
import { TaskForm } from './TaskForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AddBoardForm } from './AddBoardForm';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { EditBoardForm } from './EditBoardForm';

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const { toast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  
  const [isTaskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus | undefined>(undefined);

  const [isAddBoardFormOpen, setAddBoardFormOpen] = useState(false);
  const [isEditBoardFormOpen, setEditBoardFormOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | undefined>(undefined);

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [boardsRes, tasksRes] = await Promise.all([
          fetch('/api/boards'),
          fetch('/api/tasks')
        ]);
        
        if (!boardsRes.ok || !tasksRes.ok) {
            throw new Error("Failed to fetch data")
        }
        
        const boardsData = await boardsRes.json();
        const tasksData = await tasksRes.json();

        setBoards(boardsData.boards);
        setTasks(tasksData.tasks);

        if (boardsData.boards.length > 0) {
          setActiveBoardId(boardsData.boards[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);


  const activeBoard = boards.find(b => b.id === activeBoardId);
  const activeTasks = tasks.filter(t => t.boardId === activeBoardId);

  const handleTaskSave = async (boardId: string, taskData: Omit<Task, 'id' | 'userId'> & { id?: string }) => {
    const isEditing = !!taskData.id;
    const url = isEditing ? `/api/tasks/${taskData.id}` : '/api/tasks';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
        ...taskData,
        boardId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save task.');
      }

      const savedTask = await response.json();

      setTasks(prevTasks => {
        if (isEditing) {
          return prevTasks.map(t => (t.id === savedTask.id ? savedTask : t));
        }
        return [...prevTasks, savedTask];
      });

      setTaskFormOpen(false);
      toast({
        title: isEditing ? 'Task updated!' : 'Task created!',
        description: `The task "${savedTask.title}" has been saved.`,
      });
    } catch (error) {
       toast({
        title: 'Error saving task',
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: 'destructive',
      });
    }
  };
  
  const handleAddBoard = async (boardData: { name: string }) => {
     try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create board.');
      }
      
      const newBoard = await response.json();
      setBoards(prevBoards => [...prevBoards, newBoard]);
      setActiveBoardId(newBoard.id);
      setAddBoardFormOpen(false);
      toast({
        title: 'Board created!',
        description: `The board "${newBoard.name}" has been created.`,
      });

    } catch (error) {
       toast({
        title: 'Error creating board',
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: 'destructive',
      });
    }
  }
  
  const handleEditBoard = async (boardId: string, boardData: { name: string }) => {
    try {
        const response = await fetch(`/api/boards/${boardId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(boardData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to rename board.');
        }

        const updatedBoard = await response.json();
        setBoards(prev => prev.map(b => (b.id === boardId ? updatedBoard : b)));
        setEditBoardFormOpen(false);
        toast({
            title: 'Board renamed!',
            description: `The board is now named "${updatedBoard.name}".`,
        });

    } catch (error) {
        toast({
            title: 'Error renaming board',
            description: error instanceof Error ? error.message : "An unknown error occurred",
            variant: 'destructive',
        });
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete board.');
      }

      const boardName = boards.find(b => b.id === boardId)?.name || 'Board';
      
      const remainingBoards = boards.filter(b => b.id !== boardId);
      setBoards(remainingBoards);
      setTasks(prev => prev.filter(t => t.boardId !== boardId));

      if (activeBoardId === boardId) {
          setActiveBoardId(remainingBoards.length > 0 ? remainingBoards[0].id : '');
      }

      toast({
          title: "Board deleted!",
          description: `The board "${boardName}" and all its tasks have been deleted.`
      });

    } catch (error) {
      toast({
        title: 'Error deleting board',
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteBoard = () => {
    if (boardToDelete) {
      handleDeleteBoard(boardToDelete);
    }
    setDeleteDialogOpen(false);
    setBoardToDelete(null);
  };
  
  const openDeleteDialog = (boardId: string) => {
    setBoardToDelete(boardId);
    setDeleteDialogOpen(true);
  };

  const openEditBoardForm = (board: Board) => {
    setEditingBoard(board);
    setEditBoardFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
       const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task.');
      }
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      toast({
        title: "Task deleted!",
        description: "The task has been successfully deleted."
      })
    } catch(error) {
       toast({
        title: 'Error deleting task',
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: 'destructive',
      });
    }
  }


  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updatedTask = { ...task, status: newStatus };

    handleTaskSave(task.boardId, updatedTask);
  };
  
  const openTaskForm = (task?: Task, status?: TaskStatus) => {
    setEditingTask(task);
    setDefaultStatus(status);
    setTaskFormOpen(true);
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task || task.status === (destination.droppableId as TaskStatus)) return;
    
    const updatedTask = { ...task, status: destination.droppableId as TaskStatus };

    // Optimistic UI update
    setTasks(prevTasks => prevTasks.map(t => t.id === draggableId ? updatedTask : t));

    // Update backend
    handleTaskSave(task.boardId, updatedTask);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            <span className="text-xl font-headline font-semibold">TaskMaster</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Your Boards</SidebarGroupLabel>
                <SidebarGroupAction asChild><Button variant="ghost" size="icon" onClick={() => setAddBoardFormOpen(true)}><Plus /></Button></SidebarGroupAction>
                <SidebarMenu>
                    {boards.map(board => (
                    <SidebarMenuItem key={board.id}>
                        <SidebarMenuButton
                        onClick={() => setActiveBoardId(board.id)}
                        isActive={activeBoardId === board.id}
                        tooltip={board.name}
                        >
                        <LayoutDashboard />
                        <span>{board.name}</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                            onClick={(e) => { e.stopPropagation(); openEditBoardForm(board); }}
                            aria-label="Rename board"
                            showOnHover
                        >
                            <Edit />
                        </SidebarMenuAction>
                        <SidebarMenuAction
                          onClick={(e) => { e.stopPropagation(); openDeleteDialog(board.id); }}
                          aria-label="Delete board"
                          showOnHover
                          className="right-8"
                        >
                          <Trash2 />
                        </SidebarMenuAction>
                    </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header
          boards={boards}
          activeBoard={activeBoard}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddTask={() => openTaskForm(undefined, 'todo')}
        />
        <main className="flex-1 overflow-y-auto">
          { isLoading ? (
            <div className="flex items-center justify-center h-full">
                <p>Loading your dashboard...</p>
            </div>
          ) : boards.length > 0 ? (
              viewMode === 'board' ? (
                <BoardView 
                  tasks={activeTasks} 
                  onAddTask={(status) => openTaskForm(undefined, status)}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={(task) => openTaskForm(task)}
                  onDeleteTask={handleDeleteTask}
                  onDragEnd={onDragEnd}
                />
              ) : (
                <ListView 
                  tasks={activeTasks}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={(task) => openTaskForm(task)}
                  onDeleteTask={handleDeleteTask}
                  onDragEnd={onDragEnd}
                />
              )
          ) : (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <h2 className="text-2xl font-headline">No boards yet!</h2>
                <p className="text-muted-foreground">Create your first board to start organizing your tasks.</p>
                <Button onClick={() => setAddBoardFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create a Board
                </Button>
            </div>
          )}
        </main>
      </SidebarInset>

      <Dialog open={isTaskFormOpen} onOpenChange={setTaskFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
             <DialogDescription>
              {editingTask ? 'Update the details of your task.' : 'Fill in the form to create a new task.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            boardId={activeBoardId}
            task={editingTask}
            status={defaultStatus}
            onSuccess={handleTaskSave}
            setOpen={setTaskFormOpen}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddBoardFormOpen} onOpenChange={setAddBoardFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Create New Board</DialogTitle>
             <DialogDescription>
              Give your new board a name to get started.
            </DialogDescription>
          </DialogHeader>
          <AddBoardForm 
            onSuccess={handleAddBoard}
            setOpen={setAddBoardFormOpen}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditBoardFormOpen} onOpenChange={setEditBoardFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Rename Board</DialogTitle>
             <DialogDescription>
              Choose a new name for your board.
            </DialogDescription>
          </DialogHeader>
          <EditBoardForm
            board={editingBoard}
            onSuccess={handleEditBoard}
            setOpen={setEditBoardFormOpen}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board
              "{boards.find(b => b.id === boardToDelete)?.name}"
              and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBoardToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBoard} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
