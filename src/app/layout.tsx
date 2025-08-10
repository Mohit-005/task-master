import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { getSession } from '@/lib/auth';
import { loadDb } from '@/lib/store';
import AppProvider from '@/components/AppProvider';

export const metadata: Metadata = {
  title: 'TaskMaster',
  description: 'A modern, AI-powered task management application.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider session={await (async () => {
            if (!session?.user) return null as any;
            const db = await loadDb();
            const user = db.users.find(u => u.id === session.user.id);
            if (!user) return null as any;
            const { password: _omit, ...userToReturn } = user as any;
            return { user: userToReturn } as any;
          })()}>
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
