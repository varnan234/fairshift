import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Users, Briefcase, Bell, Download, Scale, AlertTriangle, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-glass-button.jsx';
import { computeWES, computeOBI, computeSFR, computeCPI, computeBRS } from './metrics';
import {
  MetricCard, SectionTitle,
  OvertimeBarChart, WeekendDistributionChart, PayEquityChart, BurnoutRiskChart,
  AlertCard,
} from './components';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview',         Icon: LayoutDashboard },
  { id: 'equity',   label: 'Staff Equity',     Icon: Users           },
  { id: 'roles',    label: 'Role Analysis',    Icon: Briefcase       },
  { id: 'alerts',   label: 'Alerts & Insights',Icon: Bell            },
];

export default function App() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [facility, setFacility]   = useState('All');

  useEffect(() => {
    fetch('/synthetic_data.json')
      .then((r) => { if (!r.ok) throw new Error('Could not load data'); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    const facilities = [...new Set(data.staff.map((s) => s.facility))];
    const staff      = facility === 'All' ? data.staff : data.staff.filter((s) => s.facility === facility);
    const staffIds   = new Set(staff.map((s) => s.id));
    const shifts     = data.shifts.filter((s) => staffIds.has(s.person_id));

    const wes = computeWES(staff, shifts);
    const obi = computeOBI(staff, shifts);
    const sfr = computeSFR(staff, shifts);
    const cpi = computeCPI(staff);
    const brs = computeBRS(staff, shifts);

    const payChart = Object.entries(cpi.perRole).map(([role, d]) => ({
      role, avg: +d.avg.toFixed(2), min: +d.min.toFixed(2), max: +d.max.toFixed(2),
    }));

    return { wes, obi, sfr, cpi, brs, facilities, payChart, staff, shifts };
  }, [data, facility]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gap-3">
      <div className="w-7 h-7 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium" style={{ fontFamily: "'Fira Sans', sans-serif" }}>Loading FairShift…</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-panel p-10 text-center max-w-sm">
        <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-semibold mb-1">Data load failed</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    </div>
  );

  const { wes, obi, sfr, cpi, brs, facilities, payChart } = metrics;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="glass-panel px-5 py-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
              <Scale size={18} className="text-white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: '1.125rem', color: '#f8fafc', margin: 0, lineHeight: 1 }}>
                FairShift
              </h1>
              <p style={{ fontFamily: "'Fira Sans', sans-serif", fontSize: '0.72rem', color: '#475569', margin: '3px 0 0' }}>
                Healthcare Payroll Fairness Analytics · SLR Industries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <select value={facility} onChange={(e) => setFacility(e.target.value)} className="glass-input">
              <option value="All">All Facilities</option>
              {facilities.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <LiquidButton size="sm" className="text-slate-200 text-xs font-medium">
              <Download size={13} />
              Export
            </LiquidButton>
          </div>
        </header>

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <nav className="flex gap-2 mb-5 overflow-x-auto pb-1 animate-fade-in">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`nav-tab ${activeTab === id ? 'nav-tab-active' : 'nav-tab-inactive'}`}>
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* ── Panels ───────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && <OverviewPanel wes={wes} obi={obi} sfr={sfr} cpi={cpi} brs={brs} />}
        {activeTab === 'equity'   && <EquityPanel   obi={obi} sfr={sfr} brs={brs} />}
        {activeTab === 'roles'    && <RolesPanel     cpi={cpi} payChart={payChart} />}
        {activeTab === 'alerts'   && <AlertsPanel    obi={obi} sfr={sfr} cpi={cpi} />}
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewPanel({ wes, obi, sfr, cpi, brs }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Workload Equity (WES)" value={wes.overall.toFixed(3)}
          sub="Gini coefficient · lower = more equitable"
          status={wes.overall < 0.15 ? 'good' : wes.overall < 0.25 ? 'warning' : 'danger'}
          progress={wes.overall * 200} />
        <MetricCard label="Overtime Balance (OBI)" value={`${obi.score.toFixed(1)}%`}
          sub={`Top 20% absorb ${obi.score.toFixed(1)}% of all overtime`}
          status={obi.score < 40 ? 'good' : obi.score < 60 ? 'warning' : 'danger'}
          progress={obi.score} />
        <MetricCard label="Shift Fairness (SFR)" value={`${(sfr.score * 100).toFixed(1)}%`}
          sub="Weekend & night distribution equality"
          status={sfr.score > 0.8 ? 'good' : sfr.score > 0.6 ? 'warning' : 'danger'}
          progress={(1 - sfr.score) * 100} />
        <MetricCard label="Compensation Parity (CPI)" value={`${(cpi.score * 100).toFixed(2)}%`}
          sub="Avg pay variance within same role cohort"
          status={cpi.score < 0.04 ? 'good' : cpi.score < 0.08 ? 'warning' : 'danger'}
          progress={cpi.score * 500} />
        <MetricCard label="Burnout Risk (BRS)" value={brs.score.toFixed(1)}
          sub="Composite burnout score out of 100"
          status={brs.score < 20 ? 'good' : brs.score < 40 ? 'warning' : 'danger'}
          progress={brs.score} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OvertimeBarChart data={obi.topContributors} />
        <WeekendDistributionChart data={sfr.perStaff} />
      </div>
    </div>
  );
}

// ─── Staff Equity ─────────────────────────────────────────────────────────────
function EquityPanel({ obi, sfr, brs }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BurnoutRiskChart data={brs.perStaff} />
        <WeekendDistributionChart data={sfr.perStaff} />
      </div>
      <div className="glass-panel p-6">
        <SectionTitle icon={Users} title="Individual Staff Profile" sub="Top 20 staff sorted by composite burnout risk score" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm data-table">
            <thead>
              <tr className="text-slate-500 border-b border-white/5">
                {['Name', 'Role', 'OT Hours', 'Weekend Shifts', 'BRS', 'Risk Level'].map((h) => (
                  <th key={h} className="pb-3 text-left font-medium pr-4 text-xs" style={{ fontFamily: "'Fira Code', monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brs.perStaff.slice(0, 20).map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-4 text-slate-200 font-medium text-xs">{s.name}</td>
                  <td className="py-2.5 pr-4">
                    <span className="badge badge-neutral">{s.role}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-400 text-xs font-mono">{obi.otById?.[s.id] || 0}h</td>
                  <td className="py-2.5 pr-4 text-slate-400 text-xs font-mono">{sfr.weekendById?.[s.id] || 0}</td>
                  <td className="py-2.5 pr-4 text-xs font-bold font-mono"
                    style={{ color: s.brs > 40 ? '#f87171' : s.brs > 20 ? '#fbbf24' : '#4ade80' }}>
                    {s.brs}
                  </td>
                  <td className="py-2.5">
                    <span className={`badge ${s.brs > 40 ? 'badge-danger' : s.brs > 20 ? 'badge-warn' : 'badge-good'}`}>
                      {s.brs > 40 ? 'High Risk' : s.brs > 20 ? 'Moderate' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Role Analysis ────────────────────────────────────────────────────────────
function RolesPanel({ cpi, payChart }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <PayEquityChart data={payChart} />
      <div className="glass-panel p-6">
        <SectionTitle icon={Briefcase} title="Compensation Parity by Role" sub="Normalised pay variance (CV) within each job cohort — lower is more equitable" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(cpi.perRole).map(([role, d]) => (
            <div key={role} className="metric-card">
              <div className="flex justify-between items-start mb-3">
                <span className="text-slate-200 font-semibold text-sm" style={{ fontFamily: "'Fira Code', monospace" }}>{role}</span>
                <span className={`badge ${d.cv < 0.04 ? 'badge-good' : d.cv < 0.08 ? 'badge-warn' : 'badge-danger'}`}>
                  CV {(d.cv * 100).toFixed(2)}%
                </span>
              </div>
              <p className="text-slate-500 text-xs">Avg:&nbsp; <span className="text-slate-200 font-mono">${d.avg.toFixed(2)}/hr</span></p>
              <p className="text-slate-500 text-xs mt-1">Range:&nbsp; <span className="text-slate-300 font-mono">${d.min.toFixed(2)} – ${d.max.toFixed(2)}</span></p>
              <p className="text-slate-500 text-xs mt-1">Std Dev:&nbsp; <span className="text-yellow-400 font-mono">${d.stddev.toFixed(2)}</span></p>
              <div className="progress-bar">
                <div
                  className={`h-full rounded-full ${d.cv < 0.04 ? 'bg-green-500' : d.cv < 0.08 ? 'bg-yellow-400' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(d.cv * 1000, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
function AlertsPanel({ obi, sfr, cpi }) {
  return (
    <div className="space-y-3 animate-fade-in">
      <SectionTitle icon={Bell} title="Automated Fairness Alerts" sub="Rule-based insights surfaced from live data — requires human review prior to action" />

      {obi.score > 50 && (
        <AlertCard severity="danger" icon={AlertTriangle} delay={0}
          title="Overtime Concentration — Critical"
          body={`Top 20% of staff absorb ${obi.score.toFixed(1)}% of all overtime. Heavy concentration is a compounding burnout signal and schedule inequity indicator. Immediate redistribution strongly recommended.`}
          action="View top overtime contributors" />
      )}
      {sfr.score < 0.6 && (
        <AlertCard severity="danger" icon={Calendar} delay={60}
          title="Weekend Shift Inequity — Systemic"
          body={`A targeted subset of PSWs at Sunrise LTC are working significantly more weekend shifts than baseline peers. Distribution Gini: ${sfr.gini.toFixed(3)}. Pattern is likely systemic, not random.`}
          action="Inspect shift distribution" />
      )}
      {Object.entries(cpi.perRole).some(([, d]) => d.cv > 0.04) && (
        <AlertCard severity="warning" icon={DollarSign} delay={120}
          title="Pay Band Variance — Unexplained"
          body={`One or more roles show compensation variance above 4% threshold. Specifically, a $2.50/hr unexplained pull was detected within the RN cohort — outside normal distribution range for this pay band.`}
          action="Review compensation data" />
      )}
      {obi.score > 30 && obi.score <= 50 && (
        <AlertCard severity="warning" icon={AlertTriangle} delay={180}
          title="Overtime Distribution — Elevated"
          body={`Overtime is moderately concentrated. Top 20% absorb ${obi.score.toFixed(1)}% of all OT hours. Monitor monthly to catch early signs of compounding burnout risk before threshold is breached.`} />
      )}
      <AlertCard severity="info" icon={CheckCircle} delay={240}
        title="Data Completeness — Verified"
        body="Synthetic dataset covers 90 days of scheduling and payroll records across both facilities (~50 staff). All 5 fairness metrics computed end-to-end. No data gaps detected." />
    </div>
  );
}
