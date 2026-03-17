import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LoadingState, SuccessState } from './components/States';
import RecentReminders from './components/RecentReminders';

// ── constants ──────────────────────────────────────────────────
const TASK_TYPES = ['Assignment', 'Exam', 'Lab', 'Project', 'Lecture'];
const STYLE_OPTS = ['Motivational', 'Strict', 'Friendly', 'Funny'];
const LS_KEY = 'campusflow_reminders';
const RENDER_API = 'https://camplusflow-cmrit-1.onrender.com';
const RAW_API_BASE = import.meta.env.VITE_API_BASE || RENDER_API;
// Safety: never ship a production build that points to localhost.
const API_BASE = ((import.meta.env.PROD && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(RAW_API_BASE))
    ? RENDER_API
    : RAW_API_BASE
).replace(/\/$/, '');
const TODAY = new Date().toISOString().split('T')[0];

const INITIAL_FORM = {
    name: '', task: '', taskType: 'Assignment',
    date: '', time: '', phone: '', email: '', style: 'Motivational',
};

function loadReminders() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
}

function saveReminder(entry) {
    const all = loadReminders();
    const updated = [{ ...entry, id: Date.now(), submittedAt: new Date().toISOString() }, ...all].slice(0, 5);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    return updated;
}

const FEATURES = [
    { icon: '🤖', label: 'Groq AI (LLaMA3)' },
    { icon: '📱', label: 'WhatsApp Alerts' },
    { icon: '📆', label: 'Google Calendar' },
    { icon: '⚡', label: 'n8n Automation' },
];

// ══════════════════════════════════════════════════════════════════
export default function App() {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [status, setStatus] = useState('idle');
    const [lastData, setLastData] = useState(null);
    const [reminders, setReminders] = useState(loadReminders);
    const [errors, setErrors] = useState({});

    useEffect(() => { setReminders(loadReminders()); }, []);

    function validate() {
        const e = {};
        if (!formData.name.trim()) e.name = 'Student name is required';
        if (!formData.task.trim()) e.task = 'Task name is required';
        if (!formData.date) e.date = 'Date is required';
        if (!formData.time) e.time = 'Time is required';
        if (!formData.phone.trim()) e.phone = 'WhatsApp number is required';
        else if (!/^\+\d{7,15}$/.test(formData.phone.trim()))
            e.phone = 'Use format +91XXXXXXXXXX (with country code)';
        if (!formData.email?.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
            e.email = 'Enter a valid email address (e.g. your@gmail.com)';
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const vErrors = validate();
        if (Object.keys(vErrors).length) {
            setErrors(vErrors);
            toast.error('Please fix the highlighted fields.');
            return;
        }
        setErrors({});
        setStatus('loading');

        try {
            const { data } = await axios.post(
                `${API_BASE}/api/schedule`,
                { ...formData }, // include email in POST body
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (!data?.success) throw new Error(data?.message || 'Server error');
            const updated = saveReminder(formData);
            setReminders(updated);
            setLastData({ ...formData });
            setStatus('success');
            toast.success('Reminder scheduled successfully! 🎉');
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to schedule. Check your backend.';
            toast.error(msg);
            setStatus('idle');
        }
    }

    function handleReset() {
        setFormData(INITIAL_FORM);
        setLastData(null);
        setStatus('idle');
        setErrors({});
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }

    return (
        <div className="particles-bg relative min-h-screen" style={{ background: 'var(--bg-primary)' }}>

            {/* ══ Institutional Header ══════════════════════════════════ */}
            <header className="inst-header">
                {/* Gold top strip */}
                <div className="inst-top-strip">
                    ★ CMR Institute of Technology, Bengaluru · Accredited A++ by NAAC · Celebrating 25 Years of Excellence ★
                </div>

                {/* Nav row with logo */}
                <div className="inst-nav">
                    <div className="inst-logo-section">
                        <img
                            src="/cmrit-logo.png"
                            alt="CMRIT Logo"
                            className="inst-logo"
                        />
                        <div className="inst-title-group">
                            <h1 className="inst-college-name">
                                <span>CMRIT</span> CampusFlow
                            </h1>
                            <p className="inst-college-sub">Smart Reminder Automation Portal</p>
                        </div>
                    </div>

                    {/* Right badge */}
                    <div className="inst-badge" style={{ display: 'flex' }}>
                        <span>🏆</span>
                        <span>A++ NAAC Grade</span>
                    </div>
                </div>

                {/* Hero section */}
                <div className="hero-banner">
                    <h2 className="hero-title">
                        AI-Powered <span className="highlight">Student Reminder</span> System
                    </h2>
                    <p className="hero-subtitle">
                        Schedule personalized reminders · Delivered via WhatsApp · Synced to Google Calendar
                    </p>
                    <div className="feature-pills">
                        {FEATURES.map(f => (
                            <span key={f.label} className="feature-pill">
                                {f.icon} {f.label}
                            </span>
                        ))}
                    </div>
                </div>
            </header>

            {/* ══ Main content ════════════════════════════════════════════ */}
            <main className="relative z-10 flex flex-col items-center px-4 py-12 pb-24">

                {/* ═══ FORM CARD ═══════════════════════════════════════════ */}
                <div className="w-full max-w-2xl animate-slide-up">
                    <div className="form-card">
                        <div className="form-card-accent" />

                        <div className="p-6 sm:p-9">

                            {/* Card title */}
                            {status === 'idle' && (
                                <div className="mb-7 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                        style={{ background: 'rgba(46,125,50,0.2)', border: '1px solid rgba(46,125,50,0.3)' }}>
                                        📋
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold" style={{ color: 'rgba(220,230,255,0.95)' }}>
                                            Schedule a Student Reminder
                                        </h2>
                                        <p className="text-xs mt-0.5" style={{ color: 'rgba(220,230,255,0.45)' }}>
                                            Fill in the details — AI crafts and delivers the message
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Loading state */}
                            {status === 'loading' && <LoadingState />}

                            {/* Success state */}
                            {status === 'success' && <SuccessState data={lastData} onReset={handleReset} />}

                            {/* Form */}
                            {status === 'idle' && (
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                        {/* Student Name */}
                                        <FormField label="Student Name" error={errors.name} icon="👤">
                                            <input id="studentName" type="text" className="cf-input"
                                                name="name"
                                                placeholder="e.g. Arjun Sharma"
                                                value={formData.name}
                                                onChange={handleChange} />
                                        </FormField>

                                        {/* Subject / Task */}
                                        <FormField label="Subject / Task Name" error={errors.task} icon="📖">
                                            <input id="taskName" type="text" className="cf-input"
                                                name="task"
                                                placeholder="e.g. Data Structures Assignment"
                                                value={formData.task}
                                                onChange={handleChange} />
                                        </FormField>

                                        {/* Task Type */}
                                        <FormField label="Task Type" icon="🏷️">
                                            <select id="taskType" className="cf-input"
                                                name="taskType"
                                                value={formData.taskType}
                                                onChange={handleChange}>
                                                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </FormField>

                                        {/* AI Style */}
                                        <FormField label="AI Reminder Style" icon="🎨">
                                            <select id="reminderStyle" className="cf-input"
                                                name="style"
                                                value={formData.style}
                                                onChange={handleChange}>
                                                {STYLE_OPTS.map(s => (
                                                    <option key={s} value={s}>
                                                        {s === 'Motivational' ? '💪 Motivational' :
                                                            s === 'Strict' ? '🎯 Strict' :
                                                                s === 'Friendly' ? '😊 Friendly' : '😄 Funny'}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>

                                        {/* Date */}
                                        <FormField label="Date" error={errors.date} icon="📅">
                                            <input id="taskDate" type="date" className="cf-input"
                                                name="date"
                                                min={TODAY}
                                                value={formData.date}
                                                onChange={handleChange} />
                                        </FormField>

                                        {/* Time */}
                                        <FormField label="Time" error={errors.time} icon="⏰">
                                            <input id="taskTime" type="time" className="cf-input"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange} />
                                        </FormField>

                                        {/* WhatsApp — full width */}
                                        <div className="sm:col-span-2">
                                            <FormField label="WhatsApp Number" error={errors.phone} icon="📱">
                                                <input id="whatsappNumber" type="tel" className="cf-input"
                                                    name="phone"
                                                    placeholder="+91XXXXXXXXXX"
                                                    value={formData.phone}
                                                    onChange={handleChange} />
                                            </FormField>
                                        </div>

                                        {/* Email — full width */}
                                        <div className="sm:col-span-2">
                                            <FormField label="Email" error={errors.email} icon="✉️">
                                                <input id="studentEmail" type="email" className="cf-input"
                                                    name="email"
                                                    placeholder="your@gmail.com"
                                                    value={formData.email}
                                                    onChange={handleChange} />
                                            </FormField>
                                        </div>

                                    </div>

                                    {/* Info strip */}
                                    <div className="info-strip mt-5">
                                        <span className="text-base mt-0.5">🏫</span>
                                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(220,230,255,0.5)' }}>
                                            Your reminder will be crafted by <strong style={{ color: '#a5d6a7' }}>Groq AI (LLaMA3)</strong>,
                                            sent via <strong style={{ color: '#81c784' }}>WhatsApp</strong>, and added to{' '}
                                            <strong style={{ color: '#fff176' }}>Google Calendar</strong> — powered by CMRIT's smart campus system.
                                        </p>
                                    </div>

                                    {/* Submit */}
                                    <button type="submit" id="submitBtn" className="cf-btn mt-6">
                                        <span>🚀 &nbsp; Schedule Reminder</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ RECENT REMINDERS ════════════════════════════════════ */}
                <RecentReminders reminders={reminders} />

            </main>

            {/* ══ Institutional Footer ═══════════════════════════════════ */}
            <footer className="inst-footer">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <img src="/cmrit-logo.png" alt="CMRIT" style={{ height: 36, opacity: 0.7 }} />
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'rgba(220,230,255,0.7)' }}>
                            CMR Institute of Technology
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(220,230,255,0.35)' }}>
                            Bengaluru · NAAC A++ · Autonomous Institute
                        </p>
                    </div>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(220,230,255,0.2)' }}>
                    CampusFlow · AI × WhatsApp × Google Calendar · Built for CMRIT Students
                </p>
            </footer>
        </div>
    );
}

// ── Reusable form field ────────────────────────────────────────────
function FormField({ label, error, icon, children }) {
    return (
        <div>
            <label className="cf-label">
                {icon && <span className="mr-1">{icon}</span>}
                {label}
            </label>
            {children}
            {error && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ef9a9a' }}>
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
}
