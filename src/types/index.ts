
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null; // Changed to string to support ISO 8601 format
  tags: string[];
  boardId: string;
  userId: string;
};

export type Board = {
  id: string;
  name: string;
  userId: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  avatar: string;
}
