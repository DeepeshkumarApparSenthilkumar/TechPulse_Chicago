'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Building2 } from 'lucide-react';

interface HeroSectionProps {
  stats?: { events: number; members: number; organizers: number };
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      radius: number; color: string; opacity: number;
    }> = [];

    const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#EC4899'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas!.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.opacity;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = '#3B82F6';
            ctx!.globalAlpha = (1 - dist / 100) * 0.15;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
            ctx!.globalAlpha = 1;
          }
        }
      }
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-blue-400 mb-8 border border-blue-500/20">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Chicago's #1 Tech Community Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="text-white">Chicago's</span>
          <br />
          <span className="gradient-text">Tech Community</span>
          <br />
          <span className="text-white">Hub</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover and host tech events, connect with Chicago's developer community, and stay ahead with AI-powered FinOps insights.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/events"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            Explore Events <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/create-event"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white border border-white/20 glass-hover transition-all hover:border-blue-500/40"
          >
            Host an Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="glass rounded-2xl p-4 text-center">
            <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {stats?.events ?? '50+'}
            </div>
            <div className="text-xs text-slate-400">Events/Month</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {stats?.members ?? '2K+'}
            </div>
            <div className="text-xs text-slate-400">Members</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <Building2 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {stats?.organizers ?? '100+'}
            </div>
            <div className="text-xs text-slate-400">Organizers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
