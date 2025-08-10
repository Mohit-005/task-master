
import type { Board, Task, User } from '@/types';
import bcrypt from 'bcryptjs';

// In-memory database for demonstration purposes.
// In a real application, you would use a proper database like PostgreSQL or MongoDB.

interface Db {
  users: (User & { password?: string })[];
  boards: Board[];
  tasks: Task[];
}

// Hash the password for the default user
const salt = bcrypt.genSaltSync(10);
const defaultPasswordHash = bcrypt.hashSync('password123', salt);

const initialTasksWithBoardId = [
  {
    id: 'task-1',
    boardId: 'board-1',
    title: 'Design landing page mockups',
    description: 'Create high-fidelity mockups for the new landing page in Figma. Focus on a clean and modern design.',
    status: 'in-progress' as const,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    tags: ['design', 'ui', 'figma'],
    userId: 'user-1'
  },
  {
    id: 'task-2',
    boardId: 'board-1',
    title: 'Develop API for user authentication',
    description: 'Implement JWT-based authentication endpoints. Includes login, registration, and password reset.',
    status: 'todo' as const,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    tags: ['development', 'backend', 'security'],
    userId: 'user-1'
  },
  {
    id: 'task-3',
    boardId: 'board-1',
    title: 'Q3 Financial Report',
    description: 'Finalize and submit the financial report for the third quarter.',
    status: 'done' as const,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    tags: ['finance', 'reporting'],
    userId: 'user-1'
  },
  {
    id: 'task-4',
    boardId: 'board-2',
    title: 'Schedule dentist appointment',
    description: 'Call the clinic to schedule a routine check-up.',
    status: 'todo' as const,
    dueDate: null,
    tags: ['health', 'personal'],
    userId: 'user-1'
  },
  {
    id: 'task-5',
    boardId: 'board-2',
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, and vegetables.',
    status: 'todo' as const,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    tags: ['shopping', 'home'],
    userId: 'user-1'
  },
  {
    id: 'task-6',
    boardId: 'board-3',
    title: 'Setup project repository',
    description: 'Initialize Git repo on GitHub and set up main branches and CI/CD pipeline.',
    status: 'done' as const,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    tags: ['setup', 'devops'],
    userId: 'user-1'
  },
  {
    id: 'task-7',
    boardId: 'board-3',
    title: 'Define MVP features',
    description: `Brainstorm and document the core features for the Minimum Viable Product.
Here is a code block example:
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\``,
    status: 'in-progress' as const,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    tags: ['planning', 'product'],
    userId: 'user-1'
  },
    {
    id: 'task-8',
    boardId: 'board-1',
    title: 'Review pull requests',
    description: 'Go through open PRs on GitHub and provide feedback.',
    status: 'todo' as const,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    tags: ['development', 'code-review'],
    userId: 'user-1'
  },
];

export const db: Db = {
  users: [
    { 
      id: 'user-1', 
      email: 'user@example.com', 
      username: 'Test User',
      password: defaultPasswordHash,
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
  ],
  boards: [
    { id: 'board-1', name: 'Work', userId: 'user-1' },
    { id: 'board-2', name: 'Personal', userId: 'user-1' },
    { id: 'board-3', name: 'Project Phoenix', userId: 'user-1' },
  ],
  tasks: initialTasksWithBoardId,
};
