
"use client"
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { User } from '@/types';

interface ProfileContextType {
  profile: User;
  setProfile: (profile: User) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children, user }: { children: ReactNode, user: User }) => {
  const [profile, setProfile] = useState<User>(user);
  const value = useMemo(() => ({ profile, setProfile }), [profile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
