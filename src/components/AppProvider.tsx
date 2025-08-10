"use client"
import React from 'react';
import { ProfileProvider } from '@/context/ProfileContext';
import type { User } from '@/types';

interface AppProviderProps {
    children: React.ReactNode;
    session: { user: User } | null;
}

export default function AppProvider({ children, session }: AppProviderProps) {
    if (!session) {
        return <>{children}</>;
    }

    return (
        <ProfileProvider user={session.user}>
            {children}
        </ProfileProvider>
    );
}
