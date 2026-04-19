import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { AlertTriangle, TrendingUp, Calendar, DollarSign, Users, Activity, BarChart2, Download, ChevronRight } from 'lucide-react';

// ─── Shared Recharts tooltip ──────────────────────────────────────────────────
const TooltipStyle = {
  backgroundColor: 'rgba(15,23,42,0.97)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  color: '#f1f5f9',
  fontFamily: "'Fira Sans', sans-serif",
  fontSize: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

// ─── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, status, progress }) {
  const badgeClass = {
    good:    'badge badge-good',
    warning: 'badge badge-warn',
    danger:  'badge badge-danger',
  }[status] || 'badge badge-neutral';

  const badgeLabel = { good: '✓ Good', warning: '⚠ Warning', danger: '✗ High' }[status] || status;

  const barColor = {
    good:    'bg-green-500',
    warning: 'bg-yellow-400',
    danger:  'bg-red-500',
  }[status] || 'bg-slate-500';

  return (
    <div className="metric-card">
      <div className="flex justify-between items-start mb-3">
        <p className="text-slate-400 text-xs font-medium leading-snug max-w-[70%]" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{label}</p>
        {status && <span className={badgeClass}>{badgeLabel}</span>}
      </div>
      <div className="gradient-text text-3xl font-bold leading-none mb-2">{value}</div>
      {sub && <p className="text-slate-500 text-xs leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{sub}</p>}
      {progress !== undefined && (
        <div className="progress-bar">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${Math.max(2, Math.min(progress, 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ icon: Icon, title, sub }) {
  return (
    <div className="section-header">
      <h3>
        {Icon && <Icon size={15} className="text-green-400" />}
        {title}
      </h3>
      {sub && <p>{sub}</p>}
    </div>
  );
}

// ─── OvertimeBarChart ─────────────────────────────────────────────────────────
export function OvertimeBarChart({ data }) {
  return (
    <div className="glass-panel p-6 animate-fade-in">
      <SectionTitle icon={BarChart2} title="Top Overtime Contributors" sub="Staff with highest accumulated overtime hours" />
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="otGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name" stroke="#475569" fontSize={10}
              tickLine={false} axisLine={false} tick={{ fill: '#64748b' }}
              interval={0} angle={-25} textAnchor="end" height={48}
            />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#475569' }} />
            <Tooltip contentStyle={TooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`${v}h`, 'Overtime']} />
            <Bar dataKey="hours" fill="url(#otGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Weekend Distribution ─────────────────────────────────────────────────────
export function WeekendDistributionChart({ data }) {
  return (
    <div className="glass-panel p-6 animate-fade-in">
      <SectionTitle icon={Calendar} title="Weekend Shift Distribution" sub="Most frequently assigned — flags scheduling inequity" />
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 12)} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="wkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#475569' }} />
            <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} width={88} />
            <Tooltip contentStyle={TooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [v, 'Weekend Shifts']} />
            <Bar dataKey="weekends" fill="url(#wkGrad)" radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Pay Equity Chart ─────────────────────────────────────────────────────────
export function PayEquityChart({ data }) {
  return (
    <div className="glass-panel p-6 animate-fade-in">
      <SectionTitle icon={DollarSign} title="Pay Band by Role" sub="Average, minimum and maximum hourly rate per cohort" />
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="role" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#475569' }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={TooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v, n) => [`$${v.toFixed(2)}/hr`, n === 'avg' ? 'Average' : n === 'min' ? 'Min' : 'Max']} />
            <Bar dataKey="avg" name="avg" fill="rgba(34,197,94,0.75)"  radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="min" name="min" fill="rgba(59,130,246,0.65)" radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="max" name="max" fill="rgba(245,158,11,0.65)" radius={[4,4,0,0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Burnout Risk Area Chart ──────────────────────────────────────────────────
export function BurnoutRiskChart({ data }) {
  const chartData = data.slice(0, 15).map((s) => ({ name: s.name.split(' ')[0], brs: s.brs }));
  return (
    <div className="glass-panel p-6 animate-fade-in">
      <SectionTitle icon={Activity} title="Burnout Risk Score (BRS)" sub="Top 15 staff by composite burnout risk — 0 to 100" />
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="brsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#475569' }} domain={[0, 100]} />
            <Tooltip contentStyle={TooltipStyle} cursor={{ stroke: 'rgba(239,68,68,0.4)', strokeWidth: 1, strokeDasharray: '4 2' }} formatter={(v) => [v, 'BRS Score']} />
            <Area type="monotone" dataKey="brs" stroke="#ef4444" strokeWidth={2} fill="url(#brsGrad)" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#ef4444', stroke: 'rgba(239,68,68,0.3)', strokeWidth: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── AlertCard ────────────────────────────────────────────────────────────────
export function AlertCard({ severity, icon: Icon, title, body, action, delay = 0 }) {
  const leftBorder = { danger: 'border-l-red-500/70', warning: 'border-l-yellow-500/70', info: 'border-l-blue-500/70' }[severity] || 'border-l-slate-600';
  const iconBg = { danger: 'bg-red-500/10 text-red-400', warning: 'bg-yellow-500/10 text-yellow-400', info: 'bg-blue-500/10 text-blue-400' }[severity] || 'bg-slate-700 text-slate-400';
  const titleColor = { danger: 'text-red-400', warning: 'text-yellow-400', info: 'text-blue-400' }[severity] || 'text-slate-300';

  return (
    <div className={`alert-card border-l-4 ${leftBorder} animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`rounded-xl p-3 flex-shrink-0 flex items-center justify-center w-11 h-11 ${iconBg}`}>
        {Icon && <Icon size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-sm mb-1 ${titleColor}`} style={{ fontFamily: "'Fira Code', monospace" }}>{title}</h4>
        <p className="text-slate-400 text-xs leading-relaxed">{body}</p>
        {action && (
          <button className="mt-2.5 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150 cursor-pointer">
            {action} <ChevronRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
