'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { slugify } from '@/lib/utils';
import { Globe, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '14px',
  color: '#F8FAFC',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: '#94A3B8',
  marginBottom: '8px',
  fontWeight: 500,
};

export default function CreateEventPage() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_online: false, is_free: true },
  });

  const values = watch();

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px 32px', textAlign: 'center', maxWidth: '420px', backdropFilter: 'blur(16px)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>Sign in to host an event</h2>
          <p style={{ color: '#94A3B8', marginBottom: '24px', fontSize: '14px', lineHeight: 1.7 }}>Create a free account to start hosting events in Chicago.</p>
          <a href="/auth/login" style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', textDecoration: 'none' }}>
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
    <div style={{ minHeight: '100vh', padding: '48px 0 80px' }} className="page-transition">
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
            Host an <span className="gradient-text">Event</span>
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '8px', fontSize: '14px' }}>Share your knowledge with Chicago&apos;s tech community</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, flexShrink: 0,
                ...(i < step
                  ? { background: '#10B981', color: '#fff' }
                  : i === step
                  ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.1)', color: '#64748B' }),
              }}>
                {i < step ? <Check style={{ width: '14px', height: '14px' }} /> : i + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: i === step ? 600 : 400, color: i === step ? '#fff' : '#64748B' }}>{s}</span>
              {i < steps.length - 1 && <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.1)', marginLeft: '4px', marginRight: '4px' }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit((d) => onSubmit(d))}>
          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(16px)' }}>

            {/* Step 0: Details */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>Event Details</h2>
                <div>
                  <label style={labelStyle}>Event Title *</label>
                  <input {...register('title')} style={inputStyle} placeholder="e.g. Chicago AI/ML Hackathon 2026" />
                  {errors.title && <p style={{ fontSize: '12px', color: '#F87171', marginTop: '4px' }}>{errors.title.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea {...register('description')} rows={5} style={{ ...inputStyle, resize: 'none' }} placeholder="Tell attendees what your event is about..." />
                  {errors.description && <p style={{ fontSize: '12px', color: '#F87171', marginTop: '4px' }}>{errors.description.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select {...register('category')} style={inputStyle}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p style={{ fontSize: '12px', color: '#F87171', marginTop: '4px' }}>{errors.category.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Tags (comma separated)</label>
                  <input {...register('tags')} style={inputStyle} placeholder="react, typescript, open-source" />
                </div>
              </div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>Location</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setValue('is_online', false)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                      border: `1px solid ${!values.is_online ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                      background: !values.is_online ? 'rgba(59,130,246,0.1)' : 'transparent',
                      color: !values.is_online ? '#60A5FA' : '#94A3B8',
                    }}
                  >
                    <MapPin style={{ width: '16px', height: '16px' }} /> In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('is_online', true)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                      border: `1px solid ${values.is_online ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`,
                      background: values.is_online ? 'rgba(139,92,246,0.1)' : 'transparent',
                      color: values.is_online ? '#C084FC' : '#94A3B8',
                    }}
                  >
                    <Globe style={{ width: '16px', height: '16px' }} /> Online
                  </button>
                </div>
                {!values.is_online ? (
                  <>
                    <div>
                      <label style={labelStyle}>Venue Name</label>
                      <input {...register('venue_name')} style={inputStyle} placeholder="1871 Chicago, Merchandise Mart..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Street Address</label>
                      <input {...register('venue_address')} style={inputStyle} placeholder="222 W Merchandise Mart Plaza, Chicago, IL" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={labelStyle}>Meeting Link</label>
                    <input {...register('online_link')} style={inputStyle} placeholder="https://zoom.us/..." />
                    {errors.online_link && <p style={{ fontSize: '12px', color: '#F87171', marginTop: '4px' }}>{errors.online_link.message}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Timing */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>Date &amp; Time</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Start Date &amp; Time *</label>
                    <input {...register('start_time')} type="datetime-local" style={inputStyle} />
                    {errors.start_time && <p style={{ fontSize: '12px', color: '#F87171', marginTop: '4px' }}>{errors.start_time.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>End Date &amp; Time *</label>
                    <input {...register('end_time')} type="datetime-local" style={inputStyle} />
                    {errors.end_time && <p style={{ fontSize: '12px', color: '#F87171', marginTop: '4px' }}>{errors.end_time.message}</p>}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Capacity (leave blank for unlimited)</label>
                  <input {...register('capacity')} type="number" min="1" style={inputStyle} placeholder="e.g. 100" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input {...register('is_free')} type="checkbox" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '14px', color: '#CBD5E1' }}>This is a free event</span>
                </label>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>Review Your Event</h2>
                {[
                  { label: 'Title', value: values.title },
                  { label: 'Category', value: values.category },
                  { label: 'Format', value: values.is_online ? 'Online' : 'In-Person' },
                  { label: 'Start', value: values.start_time },
                  { label: 'Free', value: values.is_free ? 'Yes' : 'No' },
                  { label: 'Description', value: values.description },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                    <span style={{ color: '#64748B', width: '90px', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: row.label === 'Description' ? 'normal' : 'nowrap' }}>{row.value}</span>
                  </div>
                ))}
                {error && <p style={{ fontSize: '13px', color: '#F87171', marginTop: '8px' }}>{error}</p>}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', borderRadius: '12px', fontSize: '14px',
                color: '#94A3B8', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', cursor: step === 0 ? 'not-allowed' : 'pointer',
                opacity: step === 0 ? 0.3 : 1,
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
            </button>

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                  color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Next <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleSubmit((d) => onSubmit(d, 'draft'))}
                  disabled={loading}
                  style={{
                    padding: '12px 20px', borderRadius: '12px', fontSize: '14px',
                    color: '#94A3B8', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
                    color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
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
