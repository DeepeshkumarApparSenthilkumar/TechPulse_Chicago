'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Building2 } from 'lucide-react';

interface HeroSectionProps {
  stats?: { events: number; members: number; organizers: number };
}

function displayStat(val: number | undefined, fallback: string): string {
  if (!val || val === 0) return fallback;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K+`;
  return `${val}`;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  // Mouse parallax on aurora orbs — throttled to avoid layout thrashing
  useEffect(() => {
    let rafId = 0;
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      const x = mx / window.innerWidth - 0.5;
      const y = my / window.innerHeight - 0.5;
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${x * 50}px, ${y * 35}px)`;
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${-x * 40}px, ${-y * 30}px)`;
      if (orb3Ref.current) orb3Ref.current.style.transform = `translate(${x * 25}px, ${-y * 45}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('mousemove', onMove); };
  }, []);

  // Canvas particle network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    // Flat RGB values for connections (no gradient objects per frame)
    const COLORS_RGB = [
      [59, 130, 246],   // blue
      [139, 92, 246],   // purple
      [6, 182, 212],    // cyan
      [16, 185, 129],   // emerald
    ];

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      radius: number; baseRadius: number;
      rgb: number[]; opacity: number;
      isHub: boolean; phase: number;
    }

    const particles: Particle[] = [];

    // Hub nodes
    for (let i = 0; i < 6; i++) {
      const r = 2.5 + Math.random() * 1.5;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: r, baseRadius: r,
        rgb: COLORS_RGB[Math.floor(Math.random() * COLORS_RGB.length)],
        opacity: 0.9, isHub: true,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Regular particles — reduced from 130 → 55
    for (let i = 0; i < 55; i++) {
      const r = 0.8 + Math.random() * 1.2;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: r, baseRadius: r,
        rgb: COLORS_RGB[Math.floor(Math.random() * COLORS_RGB.length)],
        opacity: 0.15 + Math.random() * 0.3,
        isHub: false,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;
    let t = 0;
    let frame = 0;
    const MAX_DIST = 150;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;

    const draw = () => {
      animId = requestAnimationFrame(draw);
      frame++;
      // Throttle to ~30fps
      if (frame % 2 !== 0) return;
      t += 0.024;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scan line
      const scanY = ((t * 22) % (canvas.height + 80)) - 40;
      ctx.fillStyle = 'rgba(59,130,246,0.04)';
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      // Update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.022;
        if (p.x < -20) p.x = canvas.width + 20;
        else if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        else if (p.y > canvas.height + 20) p.y = -20;
        if (p.isHub) p.radius = p.baseRadius + Math.sin(p.phase) * 1.0;
      }

      // Connections — use flat rgba instead of createLinearGradient
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MAX_DIST_SQ) {
            const fade = 1 - Math.sqrt(distSq) / MAX_DIST;
            const alpha = fade * fade * (pi.isHub || pj.isHub ? 0.25 : 0.1);
            const [r, g, b] = pi.rgb;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const [r, g, b] = p.rgb;
        if (p.isHub) {
          // Simple radial glow — reuse the same gradient coords
          const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 7);
          g2.addColorStop(0, `rgba(${r},${g},${b},0.25)`);
          g2.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 7, 0, Math.PI * 2);
          ctx.fillStyle = g2;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const alpha = p.isHub ? p.opacity * (0.75 + Math.sin(p.phase) * 0.25) : p.opacity;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.fill();
      }
    };

    draw();
    window.addEventListener('resize', setSize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', setSize); };
  }, []);

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 20% 30%, #0B1628 0%, #050A14 50%, #020710 100%)',
    }}>
      {/* Aurora orbs */}
      <div ref={orb1Ref} className="aurora-orb aurora-orb-1" />
      <div ref={orb2Ref} className="aurora-orb aurora-orb-2" />
      <div ref={orb3Ref} className="aurora-orb aurora-orb-3" />
      <div className="aurora-orb aurora-orb-4" />

      {/* Animated grid */}
      <div className="hero-grid" />

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(2,7,16,0.7) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        maxWidth: '880px',
        margin: '0 auto',
        padding: '80px 28px 60px',
      }}>
        {/* Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 20px', borderRadius: '100px',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.35)',
          fontSize: '13px', color: '#60A5FA', fontWeight: 500,
          marginBottom: '36px',
          backdropFilter: 'blur(12px)',
        }}>
          <span className="hero-live-dot" />
          Chicago&apos;s #1 Tech Community Platform
          <span style={{ background: 'rgba(59,130,246,0.2)', padding: '1px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>LIVE</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          marginBottom: '28px',
        }}>
          <span style={{ color: '#F1F5F9' }}>Chicago&apos;s</span>
          <br />
          <span className="hero-gradient-text">Tech Community</span>
          <br />
          <span style={{ color: '#F1F5F9' }}>Hub</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
          color: '#94A3B8', lineHeight: 1.8,
          maxWidth: '580px', margin: '0 auto 52px',
        }}>
          Discover and host tech events, connect with Chicago&apos;s developer community, and stay ahead with AI-powered FinOps insights.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '80px' }}>
          <Link href="/events" className="hero-btn-primary">
            Explore Events <ArrowRight style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          </Link>
          <Link href="/create-event" className="hero-btn-secondary">
            Host an Event
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '440px', margin: '0 auto' }}>
          {[
            { icon: Calendar, color: '#3B82F6', val: displayStat(stats?.events, '50+'), label: 'Events' },
            { icon: Users,    color: '#8B5CF6', val: displayStat(stats?.members, '2K+'), label: 'Members' },
            { icon: Building2,color: '#06B6D4', val: displayStat(stats?.organizers, '100+'), label: 'Organizers' },
          ].map(({ icon: Icon, color, val, label }) => (
            <div key={label} className="hero-stat-card">
              <Icon style={{ width: '18px', height: '18px', color, display: 'block', margin: '0 auto 10px' }} />
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
          <div style={{ fontSize: '11px', color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</div>
          <div className="scroll-chevron" />
        </div>
      </div>
    </section>
  );
}
