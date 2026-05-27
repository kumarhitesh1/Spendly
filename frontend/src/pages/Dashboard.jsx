import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CATEGORY_COLORS = {
  "Food & Dining": "#4F8EF7",
  Groceries: "#34D399",
  "Transport & Fuel": "#F87171",
  Shopping: "#F59E0B",
  "Health & Medical": "#A78BFA",
  "Utilities, Bills & Recharges": "#38BDF8",
  "Utilities & Bills": "#38BDF8",
  "Rent & Housing": "#4F8EF7",
  Entertainment: "#F59E0B",
  Education: "#34D399",
  Subscriptions: "#F472B6",
  "Personal Care": "#A78BFA",
  "Gifts & Donations": "#FB923C",
  Travel: "#38BDF8",
  Other: "#94A3B8",
};

const COLORS = [
  "#4F8EF7",
  "#6C63FF",
  "#34D399",
  "#F59E0B",
  "#F87171",
  "#A78BFA",
];

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const isPie = !label && payload[0]?.name;

    return (
      <div className="bg-[#16181D] border border-[#2A2D35] rounded-xl px-4 py-2 text-sm">
        <p className="text-[#64748B] mb-1">
          {isPie ? payload[0]?.name : label}
        </p>

        <p className="text-[#E2E8F0] font-medium">
          ₹{payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Fetch dashboard data
  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#1C1F26] rounded-xl" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-28 bg-[#1C1F26]" />
          ))}
        </div>

        <div className="card p-5 h-64 bg-[#1C1F26]" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 h-48 bg-[#1C1F26]" />
          <div className="card p-5 h-48 bg-[#1C1F26]" />
        </div>
      </div>
    );
  }

  const last30 = data?.last30DaysExpenses?.transactions || [];

  const totalExpense = data?.totalExpense || 0;
  const totalIncome = data?.totalIncome || 0;
  const totalBalance = data?.totalBalance || 0;

  // Group expenses by category
  const categoryMap = {};

  last30.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryMap).sort(
    (a, b) => b[1] - a[1],
  );

  const topCategory = sortedCategories[0];

  const pieData = sortedCategories.map(([name, value]) => ({
    name,
    value,
  }));

  // Group expenses by date
  const groupedByDate = {};

  last30.forEach((t) => {
    const dateKey = new Date(t.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        amount: 0,
        category: t.category,
      };
    }

    groupedByDate[dateKey].amount += t.amount;
  });

  // Last 30 days chart data
  const barData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();

    d.setDate(d.getDate() - (29 - i));

    const dateKey = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    return {
      name: dateKey,
      amount: groupedByDate[dateKey]?.amount || 0,
      category: groupedByDate[dateKey]?.category || "Other",
    };
  });

  const now = new Date();

  const monthName = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#E2E8F0]">
            {monthName}
          </h1>

          <p className="text-[#64748B] text-sm mt-0.5">
            Personal expense overview
          </p>
        </div>

        {/* Add expense button */}
        <a
          href="/expense"
          className="flex items-center gap-2 bg-[#1C1F26] border border-[#2A2D35] hover:border-[#4F8EF7] text-[#E2E8F0] px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all"
        >
          <Plus size={14} />

          <span className="hidden sm:inline">Add expense</span>
          <span className="sm:hidden">Add</span>
        </a>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-3">
            Total Balance
          </p>

          <p className="font-display text-2xl font-semibold text-[#E2E8F0]">
            ₹{totalBalance.toLocaleString()}
          </p>

          <div className="flex items-center gap-1 mt-2 text-xs text-[#4F8EF7]">
            <Wallet size={12} /> All time
          </div>
        </div>

        <div className="card p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-3">
            Total Income
          </p>

          <p className="font-display text-2xl font-semibold text-emerald-400">
            ₹{totalIncome.toLocaleString()}
          </p>

          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
            <ArrowUpRight size={12} /> All time
          </div>
        </div>

        <div className="card p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-3">
            Total Spent
          </p>

          <p className="font-display text-2xl font-semibold text-rose-400">
            ₹{totalExpense.toLocaleString()}
          </p>

          <div className="flex items-center gap-1 mt-2 text-xs text-rose-400">
            <ArrowDownRight size={12} /> All time
          </div>
        </div>

        <div className="card p-5">
          <p className="text-[#64748B] text-xs uppercase tracking-wider mb-3">
            Largest Category
          </p>

          <p className="font-display text-base lg:text-xl font-semibold text-[#E2E8F0] leading-tight">
            {topCategory ? topCategory[0] : "—"}
          </p>

          {topCategory && (
            <p className="text-xs text-[#64748B] mt-2">
              ₹{topCategory[1].toLocaleString()} ·{" "}
              {Math.round((topCategory[1] / totalExpense) * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* Category overview */}
      <div className="card p-5">
        <p className="text-xs text-[#64748B] uppercase tracking-wider mb-5">
          Spending by Category
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category progress bars */}
          <div className="space-y-3">
            {sortedCategories.map(([cat, amt]) => {
              const pct =
                totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;

              const color = CATEGORY_COLORS[cat] || "#94A3B8";

              return (
                <div key={cat} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />

                  <span className="text-xs lg:text-sm text-[#94A3B8] w-20 lg:w-36 truncate">
                    {cat}
                  </span>

                  <div className="flex-1 bg-[#16181D] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: color,
                      }}
                    />
                  </div>

                  <span className="text-xs text-[#64748B] w-8 text-right">
                    {pct}%
                  </span>

                  <span className="text-sm text-[#E2E8F0] font-medium w-20 text-right">
                    ₹{amt.toLocaleString()}
                  </span>
                </div>
              );
            })}

            {/* Empty state */}
            {sortedCategories.length === 0 && (
              <p className="text-[#64748B] text-sm text-center py-6">
                No expenses this month
              </p>
            )}
          </div>

          {/* Donut chart */}
          <div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          CATEGORY_COLORS[entry.name] ||
                          COLORS[i % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-[#64748B] text-sm">
                No expense data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expenses chart */}
        <div className="card p-5">
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">
            Last 30 Days Expenses
          </p>

          <p className="text-[#64748B] text-xs mb-4">
            ₹{data?.last30DaysExpenses?.total?.toLocaleString()} total
          </p>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={8}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />

              <YAxis
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={45}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />

              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.amount === 0
                        ? "#2A2D35"
                        : CATEGORY_COLORS[entry.category] || "#4F8EF7"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs expense */}
        <div className="card p-5">
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-4">
            Income vs Expenses
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#16181D] rounded-xl p-3">
              <p className="text-xs text-[#64748B] mb-1">Total Income</p>

              <p className="text-lg font-semibold text-emerald-400 font-display">
                ₹{totalIncome.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#16181D] rounded-xl p-3">
              <p className="text-xs text-[#64748B] mb-1">Total Spent</p>

              <p className="text-lg font-semibold text-rose-400 font-display">
                ₹{totalExpense.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Savings rate */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
              <span>Savings rate</span>

              <span className="text-emerald-400 font-medium">
                {totalIncome > 0
                  ? Math.round(
                      ((totalIncome - totalExpense) / totalIncome) * 100,
                    )
                  : 0}
                %
              </span>
            </div>

            <div className="w-full bg-[#16181D] rounded-full h-2">
              <div
                className="h-2 rounded-full bg-emerald-400 transition-all duration-700"
                style={{
                  width: `${
                    totalIncome > 0
                      ? Math.round(
                          ((totalIncome - totalExpense) / totalIncome) * 100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Spent rate */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
              <span>Spent rate</span>

              <span className="text-rose-400 font-medium">
                {totalIncome > 0
                  ? Math.round((totalExpense / totalIncome) * 100)
                  : 0}
                %
              </span>
            </div>

            <div className="w-full bg-[#16181D] rounded-full h-2">
              <div
                className="h-2 rounded-full bg-rose-400 transition-all duration-700"
                style={{
                  width: `${
                    totalIncome > 0
                      ? Math.round((totalExpense / totalIncome) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Net balance */}
          <div className="bg-[#16181D] rounded-xl p-3 flex items-center justify-between">
            <p className="text-xs text-[#64748B]">Net Balance</p>

            <p
              className={`font-semibold font-display ${
                totalBalance >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              ₹{totalBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions and income */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent transactions */}
        <div className="card p-5">
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-4">
            Recent Transactions
          </p>

          <div className="space-y-1">
            {(data?.recentTransactions || []).slice(0, 6).map((txn, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-[#2A2D35] last:border-0 hover:bg-[#16181D] transition-colors rounded-xl px-2 -mx-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#16181D] flex items-center justify-center text-base">
                    {txn.icon || (txn.type === "Income" ? "💰" : "💸")}
                  </div>

                  <div>
                    <p className="text-sm text-[#E2E8F0] font-medium">
                      {txn.category || txn.source}
                    </p>

                    <p className="text-xs text-[#64748B]">
                      {new Date(txn.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-sm font-semibold ${
                    txn.type === "Income" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {txn.type === "Income" ? "+" : "-"}₹
                  {txn.amount?.toLocaleString()}
                </span>
              </div>
            ))}

            {/* Empty state */}
            {(!data?.recentTransactions ||
              data.recentTransactions.length === 0) && (
              <p className="text-center text-[#64748B] text-sm py-8">
                No transactions yet
              </p>
            )}
          </div>
        </div>

        {/* Income overview */}
        <div className="card p-5">
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-4">
            Income Overview
          </p>

          <div className="mb-4 pb-4 border-b border-[#2A2D35]">
            <p className="font-display text-2xl font-semibold text-emerald-400">
              ₹{totalIncome.toLocaleString()}
            </p>

            <p className="text-xs text-[#64748B] mt-1">Total income all time</p>
          </div>

          <div className="space-y-1">
            {(data?.last60DaysIncome?.transactions || [])
              .slice(0, 5)
              .map((inc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-[#2A2D35] last:border-0 hover:bg-[#16181D] transition-colors rounded-xl px-2 -mx-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#16181D] flex items-center justify-center text-base">
                      {inc.icon || "💰"}
                    </div>

                    <div>
                      <p className="text-sm text-[#E2E8F0] font-medium">
                        {inc.source}
                      </p>

                      <p className="text-xs text-[#64748B]">
                        {new Date(inc.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-emerald-400">
                    +₹{inc.amount?.toLocaleString()}
                  </span>
                </div>
              ))}

            {/* Empty state */}
            {(!data?.last60DaysIncome?.transactions ||
              data.last60DaysIncome.transactions.length === 0) && (
              <p className="text-center text-[#64748B] text-sm py-8">
                No income records yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
