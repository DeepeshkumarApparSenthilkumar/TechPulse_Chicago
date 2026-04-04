import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TechPulse Chicago — Discover. Connect. Build.',
  description: "Chicago's premier tech community hub for developers, founders, and students. Discover events, connect with the community, and receive AI-powered FinOps insights.",
  keywords: ['Chicago tech events', 'developer community', 'FinOps', 'meetups', 'tech networking'],
  openGraph: {
    title: 'TechPulse Chicago',
    description: "Chicago's Tech Community Hub",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen" style={{ background: '#020710', color: '#F8FAFC' }}>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: '68px' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
