import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
} from "lucide-react";

import API from "../utils/api";

const COLORS = [
  "#4F8EF7",
  "#34D399",
  "#F87171",
  "#F59E0B",
  "#A78BFA",
  "#38BDF8",
  "#F472B6",
];

// Custom pie tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#16181D] border border-[#2A2D35] rounded-xl px-4 py-2 text-sm">
        <p className="text-[#64748B]">{payload[0]?.name}</p>

        <p className="text-[#E2E8F0] font-medium">
          ₹{payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export default function AIReportPage() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch AI report
  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get(
        `/ai/monthly-report?month=${month}&year=${year}`,
      );

      setReport(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate report",
      );
    } finally {
      setLoading(false);
    }
  };

  // Pie chart data
  const pieData = report
    ? Object.entries(report.stats?.byCategory || {}).map(
        ([name, value]) => ({
          name,
          value,
        }),
      )
    : [];

  // Current month name
  const monthName = new Date(
    year,
    month - 1,
  ).toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-semibold text-[#E2E8F0] flex items-center gap-2">
          <Sparkles size={20} className="text-[#4F8EF7]" />
          AI Monthly Report
        </h1>

        <p className="text-[#64748B] text-xs lg:text-sm mt-1">
          Get an AI-powered summary of your finances
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div>
            <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
              Month
            </label>

            <select
              className="input-field w-full sm:w-40"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
              Year
            </label>

            <select
              className="input-field w-full sm:w-32"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Generate report */}
          <button
            onClick={fetchReport}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}

            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {report && (
        <>
          {/* Report summary */}
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-[#4F8EF7]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-[#4F8EF7]" />
              </div>

              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">
                  {monthName} {year} — AI Summary
                </p>

                <h2 className="font-display text-base lg:text-xl font-semibold text-[#E2E8F0] leading-snug">
                  {report.summary?.headline}
                </h2>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Total Income",
                value: `₹${report.stats?.totalIncome?.toLocaleString()}`,
                icon: TrendingUp,
                color: "text-emerald-400",
              },
              {
                label: "Total Expenses",
                value: `₹${report.stats?.totalExpense?.toLocaleString()}`,
                icon: TrendingDown,
                color: "text-rose-400",
              },
              {
                label: "Savings",
                value: `₹${report.stats?.savings?.toLocaleString()}`,
                icon: Wallet,
                color: "text-[#4F8EF7]",
              },
              {
                label: "Savings Rate",
                value: `${report.stats?.savingsPct}%`,
                icon: Sparkles,
                color: "text-[#64748B]",
              },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#64748B] text-xs uppercase tracking-wider">
                    {s.label}
                  </span>

                  <s.icon size={13} className={s.color} />
                </div>

                <p
                  className={`font-display text-lg lg:text-xl font-semibold ${s.color}`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Highlights and chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Highlights */}
            <div className="card p-5">
              <h3 className="font-display text-sm lg:text-base font-semibold text-[#E2E8F0] mb-4">
                Key Highlights
              </h3>

              <div className="space-y-3">
                {(report.summary?.highlights || []).map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-[#16181D] rounded-xl p-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#4F8EF7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-[#4F8EF7] font-semibold">
                        {i + 1}
                      </span>
                    </div>

                    <p className="text-sm text-[#E2E8F0] leading-relaxed">
                      {h}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI tip */}
              <div className="mt-4 bg-[#16181D] border border-[#2A2D35] rounded-xl p-4">
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">
                  💡 AI Tip
                </p>

                <p className="text-sm text-[#E2E8F0] leading-relaxed">
                  {report.summary?.tip}
                </p>
              </div>
            </div>

            {/* Spending chart */}
            <div className="card p-5">
              <h3 className="font-display text-sm lg:text-base font-semibold text-[#E2E8F0] mb-4">
                Spending Breakdown
              </h3>

              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="40%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: "11px",
                        color: "#94A3B8",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-[#64748B] text-sm">
                  No category data
                </div>
              )}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card p-5">
            <h3 className="font-display text-sm lg:text-base font-semibold text-[#E2E8F0] mb-4">
              Category Breakdown
            </h3>

            <div className="space-y-3">
              {Object.entries(report.stats?.byCategory || {})
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt], i) => {
                  // Expense percentage
                  const pct =
                    report.stats?.totalExpense > 0
                      ? Math.round(
                          (amt / report.stats.totalExpense) * 100,
                        )
                      : 0;

                  const color = COLORS[i % COLORS.length];

                  return (
                    <div
                      key={cat}
                      className="flex items-center gap-2 lg:gap-3"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />

                      <span className="text-xs lg:text-sm text-[#E2E8F0] w-28 lg:w-40 truncate">
                        {cat}
                      </span>

                      <div className="flex-1 bg-[#16181D] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: color,
                          }}
                        />
                      </div>

                      <span className="text-xs text-[#64748B] w-8 text-right">
                        {pct}%
                      </span>

                      <span className="text-xs lg:text-sm text-[#E2E8F0] font-medium w-20 text-right">
                        ₹{amt.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!report && !loading && (
        <div className="card p-12 lg:p-16 text-center">
          <div className="text-5xl mb-4 opacity-30">✨</div>

          <p className="text-[#E2E8F0] font-display text-lg mb-2">
            No report generated yet
          </p>

          <p className="text-[#64748B] text-sm">
            Select a month and year, then click Generate Report
          </p>
        </div>
      )}
    </div>
  );
}