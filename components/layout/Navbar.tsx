'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';

const navLinks = [
  { href: '/events',                    label: 'Explore Events' },
  { href: '/create-event',              label: 'Host an Event' },
  { href: '/newsletter',                label: 'Newsletter' },
  { href: '/events?category=Networking',label: 'Community' },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDesktop,    setIsDesktop]    = useState(false);
  const supabase = createClient();

  // Track viewport width to toggle desktop/mobile layout
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    router.push('/');
    setUserMenuOpen(false);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href.split('?')[0] + '/');

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: '68px',
      background: 'rgba(2,7,16,0.9)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Inner container */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px',
      }}>

        {/* ── Logo ── */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.4)',
          }}>
            <Zap style={{ width: '16px', height: '16px', color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#F1F5F9' }}>TechPulse</span>{' '}
            <span className="gradient-text">Chicago</span>
          </span>
        </Link>

        {/* ── Desktop nav links (shown when isDesktop) ── */}
        {isDesktop && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: active ? 600 : 500,
                    textDecoration: 'none',
                    transition: 'all 0.18s ease',
                    color: active ? '#60A5FA' : '#CBD5E1',
                    background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

          {/* User menu or Sign In */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#fff',
                  border: '2px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer', transition: 'opacity 0.2s',
                }}
              >
                {initials}
              </button>

              {userMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: '200px', zIndex: 50,
                    background: '#080F22',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile?.full_name ?? user.email}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', textTransform: 'capitalize' }}>
                        {profile?.role ?? 'member'}
                      </p>
                    </div>
                    {[
                      { href: '/dashboard', label: 'Dashboard' },
                      { href: `/profile/${profile?.username ?? ''}`, label: 'My Profile' },
                      ...(profile?.role === 'admin' ? [{ href: '/admin', label: 'Admin Panel' }] : []),
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'block', padding: '10px 16px',
                          fontSize: '13px', color: '#CBD5E1', textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13px', color: '#F87171',
                        background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              style={{
                padding: '8px 20px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600, color: '#fff',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                textDecoration: 'none',
                boxShadow: '0 0 16px rgba(59,130,246,0.3)',
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Sign In
            </Link>
          )}

          {/* Hamburger — only on mobile */}
          {!isDesktop && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: '36px', height: '36px', borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8', cursor: 'pointer',
              }}
            >
              {mobileOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {!isDesktop && mobileOpen && (
        <div style={{
          background: 'rgba(2,7,16,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '12px 16px 20px',
        }}>
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  color: active ? '#60A5FA' : '#CBD5E1',
                  background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
          {!user && (
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block', marginTop: '8px',
                padding: '12px 16px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600,
                color: '#fff', textAlign: 'center',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
