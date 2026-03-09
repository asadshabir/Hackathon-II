'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface DeveloperInfo {
  name: string;
  role: string;
  email: string;
  github: string;
  linkedin: string;
  website: string;
  bio: string;
  skills: string[];
  experience: string;
  contactMethod: string;
}

interface DeveloperContextType {
  developerInfo: DeveloperInfo;
}

const developerInfo: DeveloperInfo = {
  name: "Asad Shabir",
  role: "Full Stack Developer & AI Engineer",
  email: "asadshabir110@gmail.com",
  github: "https://github.com/asadshabir",
  linkedin: "https://linkedin.com/in/asadshabir",
  website: "https://asadshabir.vercel.app",
  bio: "Software engineer specializing in building full-stack applications with modern technologies. Expertise in Python, JavaScript, AI/ML, and cloud technologies.",
  skills: [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "FastAPI",
    "PostgreSQL", "AI/ML", "Docker", "Kubernetes", "Cloud Architecture"
  ],
  experience: "5+ years of experience building scalable web applications and AI-powered systems",
  contactMethod: "Email is the best way to reach me for professional inquiries. I'm also active on GitHub and LinkedIn."
};

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined);

export function DeveloperProvider({ children }: { children: ReactNode }) {
  return (
    <DeveloperContext.Provider value={{ developerInfo }}>
      {children}
    </DeveloperContext.Provider>
  );
}

export function useDeveloper() {
  const context = useContext(DeveloperContext);
  if (context === undefined) {
    throw new Error('useDeveloper must be used within a DeveloperProvider');
  }
  return context;
}