import React from 'react';

const tagStyles = {
    Assignment: { bg: 'rgba(99,102,241,0.2)', color: '#818cf8', emoji: '📝' },
    Exam: { bg: 'rgba(239,68,68,0.2)', color: '#f87171', emoji: '📋' },
    Lab: { bg: 'rgba(34,211,238,0.2)', color: '#22d3ee', emoji: '🔬' },
    Project: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', emoji: '🚀' },
    Lecture: { bg: 'rgba(52,211,153,0.2)', color: '#34d399', emoji: '📚' },
};

const styleEmoji = {
    Motivational: '💪',
    Strict: '🎯',
    Friendly: '😊',
    Funny: '😄',
};

function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function RecentReminders({ reminders }) {
    if (!reminders || reminders.length === 0) return null;

    return (
        <section className="w-full max-w-2xl mx-auto mt-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: 'rgba(99,102,241,0.15)' }}>
                    🕒
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'rgba(240,240,255,0.85)' }}>
                    Recent Reminders
                </h2>
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                    {reminders.length} saved
                </span>
            </div>

            <div className="grid gap-3">
                {reminders.map((r, i) => {
                    const tag = tagStyles[r.taskType] || tagStyles['Assignment'];
                    const emoji = styleEmoji[r.style] || '💬';
                    return (
                        <div
                            key={r.id || i}
                            className="glass-card p-4 hover:scale-[1.015] transition-all duration-200 animate-slide-up"
                            style={{
                                animationDelay: `${i * 0.06}s`,
                                borderColor: `rgba(${tag.color.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',')}, 0.2)`,
                            }}
                        >
                            <div className="flex items-start gap-3">
                                {/* Left: task type badge */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                    style={{ background: tag.bg }}>
                                    {tag.emoji}
                                </div>

                                {/* Center: info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm" style={{ color: 'rgba(240,240,255,0.9)' }}>
                                            {r.name}
                                        </span>
                                        <span className="task-tag text-xs"
                                            style={{ background: tag.bg, color: tag.color }}>
                                            {tag.emoji} {r.taskType}
                                        </span>
                                        <span className="task-tag text-xs"
                                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,255,0.5)' }}>
                                            {emoji} {r.style}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-0.5 font-medium truncate" style={{ color: tag.color }}>
                                        {r.task}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs" style={{ color: 'rgba(240,240,255,0.4)' }}>
                                            📅 {r.date} · {r.time}
                                        </span>
                                        <span className="text-xs" style={{ color: 'rgba(240,240,255,0.35)' }}>
                                            📱 {r.phone}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: time ago */}
                                <span className="flex-shrink-0 text-xs font-medium"
                                    style={{ color: 'rgba(240,240,255,0.3)' }}>
                                    {timeAgo(r.submittedAt)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
