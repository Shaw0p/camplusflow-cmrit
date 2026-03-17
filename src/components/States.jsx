import React from 'react';

export function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center gap-5 py-10 animate-fade-in">
            {/* Spinner */}
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-transparent"
                    style={{ borderTopColor: '#43a047', borderRightColor: '#f4c430' }}
                    id="spinner-ring" />
                <div className="absolute inset-2 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(46,125,50,0.2), transparent)' }} />
                <div className="absolute inset-4 flex items-center justify-center text-2xl">🤖</div>
                <style>{`#spinner-ring { animation: spin 0.9s linear infinite; } @keyframes spin { to { transform: rotate(360deg); }}`}</style>
            </div>

            <div className="text-center">
                <p className="font-semibold text-base" style={{ color: 'rgba(220,230,255,0.9)' }}>
                    AI is generating your reminder...
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(220,230,255,0.4)' }}>
                    Powered by Groq LLaMA3 ✨
                </p>
            </div>

            {/* Pipeline steps */}
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'rgba(220,230,255,0.4)' }}>
                {['Groq AI', 'WhatsApp', 'Calendar'].map((step, i) => (
                    <React.Fragment key={step}>
                        <span className="px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(46,125,50,0.15)', border: '1px solid rgba(46,125,50,0.25)', color: '#a5d6a7' }}>
                            {step}
                        </span>
                        {i < 2 && <span style={{ color: 'rgba(244,196,48,0.5)' }}>→</span>}
                    </React.Fragment>
                ))}
            </div>

            {/* Dots */}
            <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full"
                        style={{
                            background: i === 0 ? '#43a047' : i === 1 ? '#f4c430' : '#43a047',
                            animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                        }} />
                ))}
                <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }`}</style>
            </div>
        </div>
    );
}

export function SuccessState({ data, onReset }) {
    return (
        <div className="flex flex-col items-center gap-6 py-6 animate-slide-up">
            {/* Success icon */}
            <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl success-pulse"
                    style={{ background: 'rgba(46,125,50,0.15)', border: '2px solid rgba(46,125,50,0.45)' }}>
                    ✅
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#43a047', color: '#fff' }}>
                    ✓
                </div>
            </div>

            {/* CMRIT badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.3)', color: '#f4c430' }}>
                🏫 CMRIT CampusFlow
            </div>

            {/* Message */}
            <div className="text-center">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#81c784' }}>
                    Reminder Scheduled!
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(220,230,255,0.6)' }}>
                    WhatsApp message delivered & Google Calendar event created.
                </p>
            </div>

            {/* Details grid */}
            {data && (
                <div className="w-full grid grid-cols-2 gap-2.5">
                    {[
                        { icon: '👤', label: 'Student', value: data.name },
                        { icon: '📖', label: 'Task', value: data.task },
                        { icon: '📅', label: 'Date', value: data.date },
                        { icon: '⏰', label: 'Time', value: data.time },
                        { icon: '📱', label: 'WhatsApp', value: data.phone },
                        { icon: '✉️', label: 'Email', value: data.email },
                        { icon: '🎨', label: 'Style', value: data.style },
                    ].map(item => (
                        <div key={item.label} className="rounded-xl p-3"
                            style={{ background: 'rgba(46,125,50,0.08)', border: '1px solid rgba(46,125,50,0.2)' }}>
                            <p className="text-xs mb-0.5" style={{ color: 'rgba(165,214,167,0.7)' }}>
                                {item.icon} {item.label}
                            </p>
                            <p className="text-sm font-semibold truncate" style={{ color: 'rgba(220,230,255,0.85)' }}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Pipeline visual */}
            <div className="w-full flex items-center justify-between gap-2 px-2">
                {[
                    { icon: '📝', label: 'Form' },
                    { icon: '🤖', label: 'Groq AI' },
                    { icon: '📱', label: 'WhatsApp' },
                    { icon: '✉️', label: 'Email' },
                    { icon: '📆', label: 'Calendar' },
                ].map((step, i, arr) => (
                    <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                                style={{ background: 'rgba(46,125,50,0.18)', border: '1px solid rgba(46,125,50,0.4)' }}>
                                {step.icon}
                            </div>
                            <span className="text-xs font-semibold" style={{ color: 'rgba(165,214,167,0.75)' }}>
                                {step.label}
                            </span>
                        </div>
                        {i < arr.length - 1 && (
                            <div className="flex-1 h-0.5 rounded-full"
                                style={{ background: 'linear-gradient(90deg, rgba(46,125,50,0.5), rgba(244,196,48,0.3))' }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Reset button */}
            <button
                onClick={onReset}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                    background: 'rgba(46,125,50,0.15)',
                    border: '1px solid rgba(46,125,50,0.35)',
                    color: '#a5d6a7',
                }}
            >
                ➕ Schedule Another Reminder
            </button>
        </div>
    );
}
