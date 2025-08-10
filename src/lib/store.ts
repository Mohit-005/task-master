import fs from 'fs';
import path from 'path';
import os from 'os';
import { put as blobPut, list as blobList } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import type { Board, Task, User } from '@/types';

export type Db = {
  users: (User & { password?: string })[];
  boards: Board[];
  tasks: Task[];
};

// On serverless platforms like Vercel, the deployment filesystem is read-only.
// Use OS temp dir (e.g., /tmp) there; use CWD locally. Allow override via DATA_DIR.
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? os.tmpdir() : process.cwd());
const DATA_FILE = path.join(DATA_DIR, 'data.json');

function createInitialDb(): Db {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  const initialTasksWithBoardId: Task[] = [
    {
      id: 'task-1',
      boardId: 'board-1',
      title: 'Design landing page mockups',
      description:
        'Create high-fidelity mockups for the new landing page in Figma. Focus on a clean and modern design.',
      status: 'in-progress',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      tags: ['design', 'ui', 'figma'],
      userId: 'user-1',
    },
    {
      id: 'task-2',
      boardId: 'board-1',
      title: 'Develop API for user authentication',
      description:
        'Implement JWT-based authentication endpoints. Includes login, registration, and password reset.',
      status: 'todo',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
      tags: ['development', 'backend', 'security'],
      userId: 'user-1',
    },
    {
      id: 'task-3',
      boardId: 'board-1',
      title: 'Q3 Financial Report',
      description: 'Finalize and submit the financial report for the third quarter.',
      status: 'done',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      tags: ['finance', 'reporting'],
      userId: 'user-1',
    },
    {
      id: 'task-4',
      boardId: 'board-2',
      title: 'Schedule dentist appointment',
      description: 'Call the clinic to schedule a routine check-up.',
      status: 'todo',
      dueDate: null,
      tags: ['health', 'personal'],
      userId: 'user-1',
    },
    {
      id: 'task-5',
      boardId: 'board-2',
      title: 'Buy groceries',
      description: 'Milk, bread, eggs, and vegetables.',
      status: 'todo',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      tags: ['shopping', 'home'],
      userId: 'user-1',
    },
    {
      id: 'task-6',
      boardId: 'board-3',
      title: 'Setup project repository',
      description:
        'Initialize Git repo on GitHub and set up main branches and CI/CD pipeline.',
      status: 'done',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
      tags: ['setup', 'devops'],
      userId: 'user-1',
    },
    {
      id: 'task-7',
      boardId: 'board-3',
      title: 'Define MVP features',
      description:
        `Brainstorm and document the core features for the Minimum Viable Product.`,
      status: 'in-progress',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
      tags: ['planning', 'product'],
      userId: 'user-1',
    },
    {
      id: 'task-8',
      boardId: 'board-1',
      title: 'Review pull requests',
      description: 'Go through open PRs on GitHub and provide feedback.',
      status: 'todo',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
      tags: ['development', 'code-review'],
      userId: 'user-1',
    },
  ];

  return {
    users: [
      {
        id: 'user-1',
        email: 'user@example.com',
        username: 'Test User',
        password: defaultPasswordHash,
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      },
    ],
    boards: [
      { id: 'board-1', name: 'Work', userId: 'user-1' },
      { id: 'board-2', name: 'Personal', userId: 'user-1' },
      { id: 'board-3', name: 'Project Phoenix', userId: 'user-1' },
    ],
    tasks: initialTasksWithBoardId,
  };
}

const BLOB_KEY = 'taskmaster-data.json';

export async function loadDb(): Promise<Db> {
  // Prefer Blob in serverless to store a single JSON file
  if (process.env.VERCEL) {
    const { blobs } = await blobList({ prefix: BLOB_KEY }).catch(() => ({ blobs: [] as any[] }));
    const existing = blobs?.find((b: any) => b.pathname === BLOB_KEY);
    if (existing?.url) {
      const text = await fetch(existing.url).then(r => r.text());
      return JSON.parse(text) as Db;
    }
    const initial = createInitialDb();
    await blobPut(BLOB_KEY, JSON.stringify(initial), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    });
    return initial;
  }
  try {
    // Ensure data directory exists when using a custom dir
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch {}

    if (!fs.existsSync(DATA_FILE)) {
      const initial = createInitialDb();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Db;
  } catch (err) {
    // If file is corrupt, reset with initial
    const initial = createInitialDb();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

export async function saveDb(db: Db): Promise<void> {
  if (process.env.VERCEL) {
    await blobPut(BLOB_KEY, JSON.stringify(db), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    });
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}


