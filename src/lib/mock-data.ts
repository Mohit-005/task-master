
import type { Board, Task } from '@/types';

// This file is kept for potential reference but is no longer the primary source of data.
// The in-memory database is now initialized in `src/lib/db.ts`.

export const initialBoards: Board[] = [
  { id: 'board-1', name: 'Work', userId: 'user-1' },
  { id: 'board-2', name: 'Personal', userId: 'user-1' },
  { id: 'board-3', name: 'Project Phoenix', userId: 'user-1' },
];

export const initialTasks: Omit<Task, 'userId'>[] = [
  {
    id: 'task-1',
    boardId: 'board-1',
    title: 'Design landing page mockups',
    description: 'Create high-fidelity mockups for the new landing page in Figma. Focus on a clean and modern design.',
    status: 'in-progress',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    tags: ['design', 'ui', 'figma'],
  },
  {
    id: 'task-2',
    boardId: 'board-1',
    title: 'Develop API for user authentication',
    description: 'Implement JWT-based authentication endpoints. Includes login, registration, and password reset.',
    status: 'todo',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    tags: ['development', 'backend', 'security'],
  },
  {
    id: 'task-3',
    boardId: 'board-1',
    title: 'Q3 Financial Report',
    description: 'Finalize and submit the financial report for the third quarter.',
    status: 'done',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    tags: ['finance', 'reporting'],
  },
  {
    id: 'task-4',
    boardId: 'board-2',
    title: 'Schedule dentist appointment',
    description: 'Call the clinic to schedule a routine check-up.',
    status: 'todo',
    dueDate: null,
    tags: ['health', 'personal'],
  },
  {
    id: 'task-5',
    boardId: 'board-2',
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, and vegetables.',
    status: 'todo',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    tags: ['shopping', 'home'],
  },
  {
    id: 'task-6',
    boardId: 'board-3',
    title: 'Setup project repository',
    description: 'Initialize Git repo on GitHub and set up main branches and CI/CD pipeline.',
    status: 'done',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    tags: ['setup', 'devops'],
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
    status: 'in-progress',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    tags: ['planning', 'product'],
  },
    {
    id: 'task-8',
    boardId: 'board-1',
    title: 'Review pull requests',
    description: 'Go through open PRs on GitHub and provide feedback.',
    status: 'todo',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    tags: ['development', 'code-review'],
  },
];
