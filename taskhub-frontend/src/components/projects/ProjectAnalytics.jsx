import { useState, useEffect, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { taskApi } from '../../services/api';
import { useOrg } from '../../context/OrgContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BarChart2, Loader2, ListChecks, TrendingUp, CheckCircle2,
  AlertCircle, Clock, Target, Zap
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar
} from 'recharts';

/* ─── Color Palettes ────────────────────────────────────────────────── */

const STATUS_PALETTE = {
  TODO:        { label: 'To Do',        light: '#94a3b8', dark: '#64748b' },
  IN_PROGRESS: { label: 'In Progress',  light: '#3b82f6', dark: '#60a5fa' },
  DONE:        { label: 'Done',         light: '#22c55e', dark: '#4ade80' },
};

const PRIORITY_PALETTE = {
  LOW:      { label: 'Low',      light: '#94a3b8', dark: '#94a3b8' },
  MEDIUM:   { label: 'Medium',   light: '#eab308', dark: '#facc15' },
  HIGH:     { label: 'High',     light: '#f97316', dark: '#fb923c' },
  CRITICAL: { label: 'Critical', light: '#ef4444', dark: '#f87171' },
};

const TYPE_PALETTE = {
  TASK:        { label: 'Task',        light: '#64748b', dark: '#94a3b8' },
  FEATURE:     { label: 'Feature',     light: '#6366f1', dark: '#818cf8' },
  IMPROVEMENT: { label: 'Improvement', light: '#10b981', dark: '#34d399' },
  BUG:         { label: 'Bug',         light: '#f43f5e', dark: '#fb7185' },
};

/* ─── Custom Tooltip ────────────────────────────────────────────────── */

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  return (
    <div className={`px-3 py-2 rounded-lg shadow-xl border text-xs font-semibold ${
      isDark
        ? 'bg-gray-900 border-gray-800 text-gray-100'
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <span className="mr-1.5" style={{ color: payload[0].payload.fill || payload[0].color }}>●</span>
      {name}: <span className="font-bold">{value}</span>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, accent, subtext }) {
  return (
    <div className="bg-white dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 flex items-start gap-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
        {subtext && <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1.5">{subtext}</p>}
      </div>
    </div>
  );
}

/* ─── Chart Card Wrapper ────────────────────────────────────────────── */

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* ─── Custom Legend ─────────────────────────────────────────────────── */

function CustomLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Render Custom Pie Label ───────────────────────────────────────── */

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      className="text-[11px] font-bold fill-white drop-shadow-sm">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════ */

export default function ProjectAnalytics() {
  const { projectId } = useParams();
  const { project } = useOutletContext();
  const { currentOrg } = useOrg();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const orgId = currentOrg?.id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId || !projectId) return;
    setLoading(true);
    taskApi.getByProject(orgId, projectId)
      .then(res => setTasks(res.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [orgId, projectId]);

  /* ── Computed Analytics ──────────────────────────────────────────── */

  const analytics = useMemo(() => {
    const total = tasks.length;
    const byStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const byType = { TASK: 0, FEATURE: 0, IMPROVEMENT: 0, BUG: 0 };
    let overdue = 0;
    const assigneeCounts = {};

    tasks.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      byType[t.type] = (byType[t.type] || 0) + 1;

      if (t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date()) {
        overdue++;
      }

      const assigneeName = t.assignee?.name || 'Unassigned';
      assigneeCounts[assigneeName] = (assigneeCounts[assigneeName] || 0) + 1;
    });

    const completionRate = total > 0 ? Math.round((byStatus.DONE / total) * 100) : 0;

    // Format for charts
    const statusData = Object.entries(byStatus)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: STATUS_PALETTE[key].label,
        value,
        fill: isDark ? STATUS_PALETTE[key].dark : STATUS_PALETTE[key].light,
      }));

    const priorityData = Object.entries(byPriority)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: PRIORITY_PALETTE[key].label,
        value,
        fill: isDark ? PRIORITY_PALETTE[key].dark : PRIORITY_PALETTE[key].light,
      }));

    const typeData = Object.entries(byType)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: TYPE_PALETTE[key].label,
        value,
        fill: isDark ? TYPE_PALETTE[key].dark : TYPE_PALETTE[key].light,
      }));

    const assigneeData = Object.entries(assigneeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Radial progress
    const progressData = [
      { name: 'Completed', value: completionRate, fill: isDark ? '#4ade80' : '#22c55e' },
    ];

    return {
      total,
      byStatus,
      overdue,
      completionRate,
      statusData,
      priorityData,
      typeData,
      assigneeData,
      progressData,
    };
  }, [tasks, isDark]);

  /* ── Chart Shared Config ─────────────────────────────────────────── */

  const axisTickStyle = {
    fontSize: 11,
    fontWeight: 600,
    fill: isDark ? '#9ca3af' : '#6b7280',
  };

  const gridStroke = isDark ? '#1f2937' : '#f3f4f6';

  /* ── Loading / Empty ─────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <BarChart2 className="h-7 w-7 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">No Tasks Yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Create some tasks in the Tasks tab to see analytics and progress charts here.
        </p>
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Stat Cards Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={ListChecks}
          label="Total Tasks"
          value={analytics.total}
          accent="bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
          subtext={`${analytics.byStatus.IN_PROGRESS} in progress`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={analytics.byStatus.DONE}
          accent="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          subtext={`${analytics.completionRate}% completion rate`}
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue"
          value={analytics.overdue}
          accent={analytics.overdue > 0
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}
          subtext={analytics.overdue > 0 ? 'Need attention' : 'All on track!'}
        />
        <StatCard
          icon={Target}
          label="Completion"
          value={`${analytics.completionRate}%`}
          accent="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"
          subtext={`${analytics.byStatus.TODO} remaining in backlog`}
        />
      </div>

      {/* ── Charts Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Completion Radial Gauge */}
        <ChartCard title="Overall Progress" subtitle="Percentage of tasks completed">
          <div className="relative h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadialBarChart
                innerRadius="60%"
                outerRadius="90%"
                data={analytics.progressData}
                startAngle={90}
                endAngle={-270}
                barSize={18}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={12}
                  background={{ fill: isDark ? '#1f2937' : '#f3f4f6' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                {analytics.completionRate}%
              </span>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">Complete</span>
            </div>
          </div>
        </ChartCard>

        {/* Tasks by Status — Donut */}
        <ChartCard title="Tasks by Status" subtitle="Distribution across workflow stages">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {analytics.statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Tasks by Priority — Donut */}
        <ChartCard title="Tasks by Priority" subtitle="Severity breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={analytics.priorityData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  animationBegin={100}
                  animationDuration={800}
                >
                  {analytics.priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Tasks by Type — Bar */}
        <ChartCard title="Tasks by Type" subtitle="Category distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={analytics.typeData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={axisTickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                  {analytics.typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Workload by Assignee ────────────────────────────────────── */}
      {analytics.assigneeData.length > 0 && (
        <ChartCard title="Workload by Assignee" subtitle="Task distribution per team member" className="w-full">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={analytics.assigneeData} layout="vertical" barSize={24} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={axisTickStyle} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                <Bar
                  dataKey="value"
                  radius={[0, 8, 8, 0]}
                  fill={isDark ? '#60a5fa' : '#3b82f6'}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
