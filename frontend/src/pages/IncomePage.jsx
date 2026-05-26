import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Plus,
  Trash2,
  Download,
  Search,
  Sparkles,
} from "lucide-react";

import API from "../utils/api";

const ICONS = [
  "💰",
  "💼",
  "🏦",
  "📈",
  "🎨",
  "🛒",
  "💻",
  "🏠",
  "🎯",
  "📦",
];

const TYPE_COLORS = {
  Salary: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
  },
  Freelance: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
  },
  Investment: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
  },
  Rental: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
  },
  Business: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
  },
  Other: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
  },
};

const TYPE_HEX = {
  Salary: "#34D399",
  Freelance: "#4F8EF7",
  Investment: "#F59E0B",
  Rental: "#A78BFA",
  Business: "#38BDF8",
  Other: "#94A3B8",
};

const INCOME_TYPES = [
  "Salary",
  "Freelance",
  "Investment",
  "Rental",
  "Business",
  "Other",
];

const FILTER_TABS = ["All sources", ...INCOME_TYPES];

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#16181D] border border-[#2A2D35] rounded-xl px-4 py-2 text-sm">
        <p className="text-[#64748B] mb-1">{label}</p>

        <p className="text-emerald-400 font-medium">
          ₹{payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

// Normalize income type
function normalizeType(type) {
  if (!type) return "Other";

  const t =
    type.charAt(0).toUpperCase() +
    type.slice(1).toLowerCase();

  return INCOME_TYPES.includes(t) ? t : "Other";
}

export default function IncomePage() {
  const [allIncomes, setAllIncomes] = useState([]);

  const [monthData, setMonthData] = useState({
    income: [],
    total: 0,
    byType: {},
  });

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All sources");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;
  });

  const [form, setForm] = useState({
    icon: "💰",
    source: "",
    amount: "",
    date: "",
  });

  const [detectedType, setDetectedType] = useState("Other");
  const [aiDetecting, setAiDetecting] = useState(false);

  // Fetch all incomes
  const fetchAllIncomes = () => {
    API.get("/income/get")
      .then((res) => setAllIncomes(res.data.income || []))
      .finally(() => setLoading(false));
  };

  // Fetch monthly income data
  const fetchMonthData = (monthStr) => {
    const [year, month] = monthStr.split("-");

    setMonthLoading(true);

    API.get(`/income/getbymonth?month=${month}&year=${year}`)
      .then((res) =>
        setMonthData({
          income: res.data.income || [],
          total: res.data.total || 0,
          byType: res.data.byType || {},
        }),
      )
      .finally(() => setMonthLoading(false));
  };

  // Load all incomes
  useEffect(() => {
    fetchAllIncomes();
  }, []);

  // Load selected month data
  useEffect(() => {
    fetchMonthData(selectedMonth);
  }, [selectedMonth]);

  // Detect income type
  useEffect(() => {
    if (!form.source || form.source.length < 3) {
      setDetectedType("Other");

      return;
    }

    const timer = setTimeout(async () => {
      setAiDetecting(true);

      try {
        const res = await API.post("/ai/suggestincometype", {
          source: form.source,
        });

        setDetectedType(res.data.type || "Other");
      } catch (_) {
        setDetectedType("Other");
      }

      setAiDetecting(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [form.source]);

  // Add income
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await API.post("/income/add", {
        ...form,
        type: detectedType,
        amount: Number(form.amount),
      });

      setShowModal(false);

      setForm({
        icon: "💰",
        source: "",
        amount: "",
        date: "",
      });

      setDetectedType("Other");

      fetchAllIncomes();
      fetchMonthData(selectedMonth);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding income");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete income
  const handleDelete = async (id) => {
    await API.delete(`/income/delete/${id}`);

    fetchAllIncomes();
    fetchMonthData(selectedMonth);
  };

  // Export income data
  const handleExport = async () => {
    try {
      const res = await API.get("/income/downloadexcel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const a = document.createElement("a");

      a.href = url;
      a.download = "income.xlsx";

      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download");
    }
  };

  // Month options
  const now = new Date();

  const monthOptions = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1,
    );

    const val = `${d.getFullYear()}-${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}`;

    const label = d.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    monthOptions.push({ val, label });
  }

  // Filter income records
  const filtered = monthData.income.filter((inc) => {
    const matchSearch = inc.source
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchTab =
      activeTab === "All sources" ||
      normalizeType(inc.type) === activeTab;

    return matchSearch && matchTab;
  });

  const totalFiltered = filtered.reduce(
    (s, i) => s + i.amount,
    0,
  );

  const sortedTypes = Object.entries(monthData.byType).sort(
    (a, b) => b[1] - a[1],
  );

  const primaryType = sortedTypes[0];

  const primaryPct =
    monthData.total > 0 && primaryType
      ? Math.round(
          (primaryType[1] / monthData.total) * 100,
        )
      : 0;

  const otherTotal =
    monthData.total - (primaryType?.[1] || 0);

  const otherCount = monthData.income.filter(
    (i) => normalizeType(i.type) !== primaryType?.[0],
  ).length;

  // Chart data
  const chartData = [...allIncomes]
    .reverse()
    .slice(-12)
    .map((i) => ({
      name: new Date(i.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      amount: i.amount,
      type: normalizeType(i.type),
    }));

  const selectedMonthLabel = monthOptions.find(
    (m) => m.val === selectedMonth,
  )?.label;

  const detectedStyle =
    TYPE_COLORS[detectedType] || TYPE_COLORS.Other;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-semibold text-[#E2E8F0]">
            Income
          </h1>

          <p className="text-[#64748B] text-xs lg:text-sm mt-0.5">
            {filtered.length} transactions ·{" "}
            {selectedMonthLabel}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-[#1C1F26] border border-[#2A2D35] hover:border-[#4F8EF7] text-[#E2E8F0] px-3 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <Download size={14} />

            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={15} />

            <span className="hidden sm:inline">
              Add Income
            </span>

            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 lg:p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-2">
            Total income
          </p>

          <p className="font-display text-xl lg:text-2xl font-semibold text-emerald-400">
            ₹{monthData.total.toLocaleString()}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            this month
          </p>
        </div>

        <div className="card p-4 lg:p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-2">
            Primary source
          </p>

          <p className="font-display text-xl lg:text-2xl font-semibold text-[#E2E8F0]">
            ₹{(primaryType?.[1] || 0).toLocaleString()}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            {primaryType?.[0] || "—"} · {primaryPct}%
          </p>
        </div>

        <div className="card p-4 lg:p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-2">
            Other sources
          </p>

          <p className="font-display text-xl lg:text-2xl font-semibold text-[#E2E8F0]">
            ₹{otherTotal.toLocaleString()}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            {otherCount} transactions
          </p>
        </div>

        <div className="card p-4 lg:p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-2">
            All time total
          </p>

          <p className="font-display text-xl lg:text-2xl font-semibold text-[#E2E8F0]">
            ₹
            {allIncomes
              .reduce((s, i) => s + i.amount, 0)
              .toLocaleString()}
          </p>

          <p className="text-xs text-[#64748B] mt-1">
            {allIncomes.length} transactions
          </p>
        </div>
      </div>

      {/* Income chart */}
      <div className="card p-4 lg:p-5">
        <h2 className="font-display text-sm lg:text-base font-semibold text-[#E2E8F0] mb-3">
          Income Overview
        </h2>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={18}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#64748B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(255,255,255,0.03)",
              }}
            />

            <Bar
              dataKey="amount"
              radius={[6, 6, 0, 0]}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    TYPE_HEX[entry.type] || "#94A3B8"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            />

            <input
              className="input-field pl-8 text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {/* Month filter */}
          <select
            className="input-field w-36 lg:w-44 text-sm"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
          >
            {monthOptions.map((m) => (
              <option key={m.val} value={m.val}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? "bg-[#4F8EF7] border-[#4F8EF7] text-white"
                  : "bg-transparent border-[#2A2D35] text-[#64748B] hover:text-[#E2E8F0] hover:border-[#4F8EF7]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Income table */}
      <div className="card overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden lg:grid grid-cols-12 px-5 py-3 border-b border-[#2A2D35]">
          <div className="col-span-4 text-xs text-[#64748B] uppercase tracking-wider">
            Source
          </div>

          <div className="col-span-3 text-xs text-[#64748B] uppercase tracking-wider">
            Type
          </div>

          <div className="col-span-2 text-xs text-[#64748B] uppercase tracking-wider">
            Date
          </div>

          <div className="col-span-2 text-xs text-[#64748B] uppercase tracking-wider text-right">
            Amount
          </div>

          <div className="col-span-1"></div>
        </div>

        {/* Loading state */}
        {monthLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="text-center text-[#64748B] py-12 text-sm">
            No income records found
          </div>
        ) : (
          filtered.map((inc) => {
            const nt = normalizeType(inc.type);

            const style =
              TYPE_COLORS[nt] || TYPE_COLORS.Other;

            return (
              <div
                key={inc._id}
                className="border-b border-[#2A2D35] last:border-0 hover:bg-[#16181D] transition-colors"
              >
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-12 px-5 py-3.5">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#16181D] flex items-center justify-center text-base flex-shrink-0">
                      {inc.icon || "💰"}
                    </div>

                    <p className="text-sm text-[#E2E8F0] font-medium truncate">
                      {inc.source}
                    </p>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
                    >
                      {nt}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-[#64748B]">
                      {new Date(
                        inc.date,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-sm font-semibold text-emerald-400">
                      +₹{inc.amount?.toLocaleString()}
                    </span>
                  </div>

                  {/* Delete button */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() =>
                        handleDelete(inc._id)
                      }
                      className="w-8 h-8 rounded-lg bg-[#16181D] hover:bg-rose-500/20 flex items-center justify-center text-[#64748B] hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#16181D] flex items-center justify-center text-base flex-shrink-0">
                      {inc.icon || "💰"}
                    </div>

                    <div>
                      <p className="text-sm text-[#E2E8F0] font-medium">
                        {inc.source}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                        >
                          {nt}
                        </span>

                        <p className="text-xs text-[#64748B]">
                          {new Date(
                            inc.date,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-400">
                      +₹{inc.amount?.toLocaleString()}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() =>
                        handleDelete(inc._id)
                      }
                      className="w-7 h-7 rounded-lg hover:bg-rose-500/20 flex items-center justify-center text-[#64748B] hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 lg:px-5 py-3 bg-[#16181D] border-t border-[#2A2D35]">
            <span className="text-xs text-[#64748B]">
              {filtered.length} transactions
            </span>

            <span className="text-sm font-semibold text-emerald-400">
              Total: +₹{totalFiltered.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Add income modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-[#E2E8F0]">
                Add Income
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-[#64748B] hover:text-[#E2E8F0] text-xl"
              >
                ×
              </button>
            </div>

            {/* Income form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Icon selection */}
              <div>
                <label className="text-xs text-[#64748B] uppercase tracking-wider mb-2 block">
                  Pick Icon
                </label>

                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          icon: ic,
                        })
                      }
                      className={`w-9 h-9 rounded-lg text-base transition-all ${
                        form.icon === ic
                          ? "bg-[#4F8EF7]/30 ring-1 ring-[#4F8EF7]"
                          : "bg-[#16181D] hover:bg-[#2A2D35]"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source input */}
              <div>
                <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Income Source

                  {aiDetecting && (
                    <span className="text-[#4F8EF7] flex items-center gap-1 normal-case font-normal">
                      <Sparkles
                        size={11}
                        className="animate-pulse"
                      />
                      detecting...
                    </span>
                  )}
                </label>

                <input
                  className="input-field"
                  placeholder="Infosys salary, Freelance project..."
                  value={form.source}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      source: e.target.value,
                    })
                  }
                  required
                />

                {/* Detected type */}
                {form.source.length >= 3 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[#64748B]">
                      {aiDetecting
                        ? "Detecting..."
                        : "Detected:"}
                    </span>

                    {!aiDetecting && (
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${detectedStyle.bg} ${detectedStyle.text}`}
                      >
                        {detectedType}
                      </span>
                    )}
                  </div>
                )}

                {/* Override type */}
                {form.source.length >= 3 &&
                  !aiDetecting && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs text-[#64748B] self-center">
                        Override:
                      </span>

                      {INCOME_TYPES.map((t) => {
                        const s =
                          TYPE_COLORS[t] ||
                          TYPE_COLORS.Other;

                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setDetectedType(t)
                            }
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                              detectedType === t
                                ? `${s.bg} ${s.text} border-transparent`
                                : "border-[#2A2D35] text-[#64748B] hover:border-[#4F8EF7]"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
                  Amount (₹)
                </label>

                <input
                  className="input-field"
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Date input */}
              <div>
                <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
                  Date
                </label>

                <input
                  className="input-field"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting || aiDetecting}
                className="w-full btn-primary py-3 mt-2 disabled:opacity-50"
              >
                {submitting
                  ? "Adding..."
                  : aiDetecting
                    ? "Detecting type..."
                    : "Add Income"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}