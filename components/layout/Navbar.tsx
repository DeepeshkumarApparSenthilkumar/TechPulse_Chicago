'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Bell, Search, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';

const navLinks = [
  { href: '/events', label: 'Explore Events' },
  { href: '/create-event', label: 'Host an Event' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/events?category=Networking', label: 'Community' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    router.push('/');
    setUserMenuOpen(false);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="text-white">TechPulse</span>{' '}
              <span className="gradient-text">Chicago</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === link.href || pathname.startsWith(link.href.split('?')[0] + '/')
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Search className="w-4 h-4" />
            </button>

            {user ? (
              <>
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
                  <Bell className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all hover:opacity-80"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                  >
                    {initials}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden shadow-xl z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{profile?.full_name ?? user.email}</p>
                        <p className="text-xs text-slate-400 capitalize">{profile?.role ?? 'member'}</p>
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                      <Link href={`/profile/${profile?.username ?? ''}`} className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                      {profile?.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5" onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>
                      )}
                      <div className="border-t border-white/10" />
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  pathname === link.href ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
