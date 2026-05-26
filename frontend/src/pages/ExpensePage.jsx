import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Plus, Trash2, Download, Search, Sparkles } from "lucide-react";

import API from "../utils/api";

const ICONS = [
  "🍽️",
  "🚗",
  "🛍️",
  "🎬",
  "🏥",
  "💡",
  "📚",
  "✈️",
  "🛒",
  "🏠",
  "💆",
  "📱",
  "🎁",
  "💸",
];

const CATEGORY_COLORS = {
  "Food & Dining": {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    label: "food",
  },
  Groceries: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    label: "groceries",
  },
  "Transport & Fuel": {
    bg: "bg-rose-500/20",
    text: "text-rose-400",
    label: "transport",
  },
  Shopping: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    label: "shopping",
  },
  "Health & Medical": {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    label: "health",
  },
  "Utilities, Bills & Recharges": {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    label: "utilities",
  },
  "Utilities & Bills": {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    label: "utilities",
  },
  "Rent & Housing": {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    label: "housing",
  },
  Entertainment: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    label: "entertain",
  },
  Education: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    label: "education",
  },
  Subscriptions: {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    label: "subscriptions",
  },
  "Personal Care": {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    label: "personal",
  },
  "Gifts & Donations": {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    label: "gifts",
  },
  Travel: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    label: "travel",
  },
  Other: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
    label: "other",
  },
};

const FILTER_TABS = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Health",
  "Housing",
  "Other",
];

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#16181D] border border-[#2A2D35] rounded-xl px-4 py-2 text-sm">
        <p className="text-[#64748B] mb-1">{label}</p>

        <p className="text-[#E2E8F0] font-medium">
          ₹{payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  const [form, setForm] = useState({
    icon: "💸",
    category: "",
    description: "",
    amount: "",
    date: "",
  });

  const [aiDetecting, setAiDetecting] = useState(false);

  // Fetch expenses
  const fetchExpenses = () => {
    API.get("/expense/get")
      .then((res) => setExpenses(res.data.expenses || []))
      .finally(() => setLoading(false));
  };

  // Load expenses
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await API.post("/expense/add", {
        icon: form.icon,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
      });

      setShowModal(false);

      setForm({
        icon: "💸",
        category: "",
        description: "",
        amount: "",
        date: "",
      });

      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding expense");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    await API.delete(`/expense/delete/${id}`);

    fetchExpenses();
  };

  // Export expenses
  const handleExport = async () => {
    try {
      const res = await API.get("/expense/downloadexcel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const a = document.createElement("a");

      a.href = url;
      a.download = "expenses.xlsx";

      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download");
    }
  };

  // Filter expenses
  const filtered = expenses.filter((e) => {
    const expMonth = new Date(e.date).toISOString().slice(0, 7);

    const matchMonth = expMonth === selectedMonth;

    const matchSearch =
      e.category?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());

    const matchTab =
      activeTab === "All" ||
      e.category?.toLowerCase().includes(activeTab.toLowerCase());

    return matchMonth && matchSearch && matchTab;
  });

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  // Chart data
  const chartData = [...expenses]
    .reverse()
    .slice(-15)
    .map((e) => ({
      name: new Date(e.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      amount: e.amount,
    }));

  // Month options
  const monthOptions = [];

  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    const label = d.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    monthOptions.push({ val, label });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-semibold text-[#E2E8F0]">
            All Expenses
          </h1>

          <p className="text-[#64748B] text-xs lg:text-sm mt-0.5">
            {filtered.length} transactions ·{" "}
            {monthOptions.find((m) => m.val === selectedMonth)?.label}
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

            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Expense chart */}
      <div className="card p-4 lg:p-5">
        <h2 className="font-display text-sm lg:text-base font-semibold text-[#E2E8F0] mb-3">
          Expense Trend
        </h2>

        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
              </linearGradient>
            </defs>

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
              width={40}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#4F8EF7"
              strokeWidth={2}
              fill="url(#expGrad)"
              dot={{ fill: "#4F8EF7", r: 3 }}
            />
          </AreaChart>
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Month filter */}
          <select
            className="input-field w-36 lg:w-44 text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map((m) => (
              <option key={m.val} value={m.val}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
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

      {/* Expenses list */}
      <div className="card overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden lg:grid grid-cols-12 px-5 py-3 border-b border-[#2A2D35]">
          <div className="col-span-4 text-xs text-[#64748B] uppercase tracking-wider">
            Merchant
          </div>

          <div className="col-span-3 text-xs text-[#64748B] uppercase tracking-wider">
            Category
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="text-center text-[#64748B] py-12 text-sm">
            No expenses found
          </div>
        ) : (
          filtered.map((e) => {
            const catStyle =
              CATEGORY_COLORS[e.category] || CATEGORY_COLORS["Other"];

            return (
              <div
                key={e._id}
                className="border-b border-[#2A2D35] last:border-0 hover:bg-[#16181D] transition-colors"
              >
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-12 px-5 py-3.5">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#16181D] flex items-center justify-center text-base flex-shrink-0">
                      {e.icon || "💸"}
                    </div>

                    <p className="text-sm text-[#E2E8F0] font-medium truncate">
                      {e.description || e.category}
                    </p>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}
                    >
                      {catStyle.label}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-[#64748B]">
                      {new Date(e.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-sm font-semibold text-rose-400">
                      −₹{e.amount?.toLocaleString()}
                    </span>
                  </div>

                  {/* Delete button */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="w-8 h-8 rounded-lg bg-[#16181D] hover:bg-rose-500/20 flex items-center justify-center text-[#64748B] hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Mobile card */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#16181D] flex items-center justify-center text-base flex-shrink-0">
                      {e.icon || "💸"}
                    </div>

                    <div>
                      <p className="text-sm text-[#E2E8F0] font-medium">
                        {e.description || e.category}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}
                        >
                          {catStyle.label}
                        </span>

                        <p className="text-xs text-[#64748B]">
                          {new Date(e.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-rose-400">
                      −₹{e.amount?.toLocaleString()}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(e._id)}
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

            <span className="text-sm font-semibold text-rose-400">
              Total: −₹{totalFiltered.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Add expense modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-[#E2E8F0]">
                Add Expense
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-[#64748B] hover:text-[#E2E8F0] text-xl"
              >
                ×
              </button>
            </div>

            {/* Expense form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      onClick={() => setForm({ ...form, icon: ic })}
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

              {/* Description input */}
              <div>
                <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Description
                  {aiDetecting && (
                    <span className="text-[#4F8EF7] flex items-center gap-1 normal-case">
                      <Sparkles size={11} className="animate-pulse" />
                      AI detecting...
                    </span>
                  )}
                </label>

                <input
                  className="input-field"
                  placeholder="e.g. Zomato dinner, Jio recharge..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />

                <p className="text-xs text-[#64748B] mt-1">
                  Type a description — category will be auto-detected
                </p>
              </div>

              {/* Category input */}
              <div>
                <label className="text-xs text-[#64748B] uppercase tracking-wider mb-1.5 block">
                  Category
                  {form.category && (
                    <span className="text-[#4F8EF7] normal-case font-normal">
                      {" "}
                      — {form.category}
                    </span>
                  )}
                </label>

                <input
                  className="input-field"
                  placeholder="Or type manually"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                />
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
                disabled={submitting}
                className="w-full btn-primary py-3 mt-2 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
