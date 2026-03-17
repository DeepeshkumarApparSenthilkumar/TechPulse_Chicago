'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { slugify } from '@/lib/utils';
import { Upload, Globe, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please add a description'),
  category: z.string().min(1, 'Select a category'),
  tags: z.string().optional(),
  is_online: z.boolean(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  online_link: z.string().url().optional().or(z.literal('')),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  capacity: z.string().optional(),
  is_free: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const categories = ['AI/ML', 'Web Dev', 'DevOps', 'FinOps', 'Startup', 'Networking'];
const steps = ['Details', 'Location', 'Timing', 'Preview'];

export default function CreateEventPage() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_online: false, is_free: true },
  });

  const values = watch();

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-3">Sign in to host an event</h2>
          <p className="text-slate-400 mb-6">Create a free account to start hosting events in Chicago.</p>
          <a href="/auth/login" className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData, status: 'published' | 'draft' = 'published') => {
    setLoading(true);
    setError('');
    try {
      const slug = slugify(data.title);
      const { error: err } = await supabase.from('events').insert({
        title: data.title,
        slug,
        description: data.description,
        category: data.category,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        is_online: data.is_online,
        venue_name: data.is_online ? null : data.venue_name,
        venue_address: data.is_online ? null : data.venue_address,
        online_link: data.is_online ? data.online_link : null,
        start_time: data.start_time,
        end_time: data.end_time,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        is_free: data.is_free,
        organizer_id: user.id,
        status,
      });
      if (err) throw err;

      // Upgrade role to organizer if member
      if (profile?.role === 'member') {
        await supabase.from('profiles').update({ role: 'organizer' }).eq('id', user.id);
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 page-transition">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Host an <span className="gradient-text">Event</span>
          </h1>
          <p className="text-slate-400 mt-2">Share your knowledge with Chicago's tech community</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'text-white' : 'bg-white/10 text-slate-400'
              }`} style={i === step ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? 'text-white font-medium' : 'text-slate-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit((d) => onSubmit(d))}>
          <div className="glass rounded-2xl p-6 space-y-5">
            {/* Step 0: Details */}
            {step === 0 && (
              <>
                <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Event Details</h2>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Event Title *</label>
                  <input {...register('title')} className="input-dark w-full px-4 py-3 rounded-xl" placeholder="e.g. Chicago AI/ML Hackathon 2026" />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Description *</label>
                  <textarea {...register('description')} rows={5} className="input-dark w-full px-4 py-3 rounded-xl resize-none" placeholder="Tell attendees what your event is about..." />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Category *</label>
                  <select {...register('category')} className="input-dark w-full px-4 py-3 rounded-xl">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tags (comma separated)</label>
                  <input {...register('tags')} className="input-dark w-full px-4 py-3 rounded-xl" placeholder="react, typescript, open-source" />
                </div>
              </>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Location</h2>
                <div className="flex gap-3">
                  <button type="button" onClick={() => {}} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${!values.is_online ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-white/10 text-slate-400 hover:border-blue-500/30'}`}>
                    <MapPin className="w-4 h-4" /> In-Person
                  </button>
                  <button type="button" className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${values.is_online ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-white/10 text-slate-400 hover:border-purple-500/30'}`}>
                    <Globe className="w-4 h-4" /> Online
                  </button>
                </div>
                {!values.is_online ? (
                  <>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Venue Name</label>
                      <input {...register('venue_name')} className="input-dark w-full px-4 py-3 rounded-xl" placeholder="1871 Chicago, Merchandise Mart..." />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Street Address</label>
                      <input {...register('venue_address')} className="input-dark w-full px-4 py-3 rounded-xl" placeholder="222 W Merchandise Mart Plaza, Chicago, IL" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Meeting Link</label>
                    <input {...register('online_link')} className="input-dark w-full px-4 py-3 rounded-xl" placeholder="https://zoom.us/..." />
                    {errors.online_link && <p className="text-red-400 text-xs mt-1">{errors.online_link.message}</p>}
                  </div>
                )}
              </>
            )}

            {/* Step 2: Timing */}
            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Date & Time</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Start Date & Time *</label>
                    <input {...register('start_time')} type="datetime-local" className="input-dark w-full px-4 py-3 rounded-xl" />
                    {errors.start_time && <p className="text-red-400 text-xs mt-1">{errors.start_time.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">End Date & Time *</label>
                    <input {...register('end_time')} type="datetime-local" className="input-dark w-full px-4 py-3 rounded-xl" />
                    {errors.end_time && <p className="text-red-400 text-xs mt-1">{errors.end_time.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Capacity (leave blank for unlimited)</label>
                  <input {...register('capacity')} type="number" min="1" className="input-dark w-full px-4 py-3 rounded-xl" placeholder="e.g. 100" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input {...register('is_free')} type="checkbox" className="w-4 h-4 rounded border-white/20" defaultChecked />
                  <span className="text-sm text-slate-300">This is a free event</span>
                </label>
              </>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Review Your Event</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3"><span className="text-slate-400 w-24 flex-shrink-0">Title</span><span className="text-white">{values.title}</span></div>
                  <div className="flex gap-3"><span className="text-slate-400 w-24 flex-shrink-0">Category</span><span className="text-white">{values.category}</span></div>
                  <div className="flex gap-3"><span className="text-slate-400 w-24 flex-shrink-0">Format</span><span className="text-white">{values.is_online ? 'Online' : 'In-Person'}</span></div>
                  <div className="flex gap-3"><span className="text-slate-400 w-24 flex-shrink-0">Start</span><span className="text-white">{values.start_time}</span></div>
                  <div className="flex gap-3"><span className="text-slate-400 w-24 flex-shrink-0">Free</span><span className="text-white">{values.is_free ? 'Yes' : 'No'}</span></div>
                  <div className="flex gap-3"><span className="text-slate-400 w-24 flex-shrink-0">Description</span><span className="text-white line-clamp-3">{values.description}</span></div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm text-slate-400 border border-white/10 hover:border-blue-500/30 hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmit((d) => onSubmit(d, 'draft'))}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl text-sm text-slate-400 border border-white/10 hover:border-blue-500/30 hover:text-white transition-all disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                >
                  {loading ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
