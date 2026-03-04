import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const CATEGORIES = [
  { id: "food", label: "အစားအသောက်", icon: "🍚", color: "#f97316" },
  { id: "transport", label: "သွားလာရေး", icon: "🚌", color: "#3b82f6" },
  { id: "electricity", label: "လျှပ်စစ်/ရေ", icon: "⚡", color: "#eab308" },
  { id: "health", label: "ကျန်းမာရေး", icon: "💊", color: "#ef4444" },
  { id: "education", label: "ပညာရေး", icon: "📚", color: "#8b5cf6" },
  { id: "entertainment", label: "အပျော်အပါး", icon: "🎮", color: "#ec4899" },
  { id: "savings", label: "စုငွေ", icon: "🏦", color: "#10b981" },
  { id: "other", label: "အခြား", icon: "📦", color: "#6b7280" },
];

const MONTHS = [
  "ဇန်နဝါရီ",
  "ဖေဖော်ဝါရီ",
  "မတ်",
  "ဧပြီ",
  "မေ",
  "ဇွန်",
  "ဇူလိုင်",
  "သြဂုတ်",
  "စက်တင်ဘာ",
  "အောက်တိုဘာ",
  "နိုဝင်ဘာ",
  "ဒီဇင်ဘာ",
];

const formatMMK = (n) => {
  if (n >= 100000000) return "¥" + (n / 100000000).toFixed(1) + "億";
  if (n >= 10000) return "¥" + (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return "¥" + (n / 1000).toFixed(1) + "千";
  return "¥" + n.toLocaleString();
};

const initialMonthData = () => ({
  income: "",
  savingsGoal: "",
  expenses: CATEGORIES.map((c) => ({ categoryId: c.id, amount: "" })),
});

export default function BudgetPlanner() {
  const now = new Date();
  const [activeMonth, setActiveMonth] = useState(now.getMonth());
  const [monthsData, setMonthsData] = useState(() => {
    const d = {};
    MONTHS.forEach((_, i) => {
      d[i] = initialMonthData();
    });
    return d;
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [savingsName, setSavingsName] = useState("အိမ်ဝယ်ရန်");

  const current = monthsData[activeMonth];

  const totalExpenses = useMemo(
    () => current.expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
    [current]
  );

  const income = parseFloat(current.income) || 0;
  const savingsGoal = parseFloat(current.savingsGoal) || 0;
  const balance = income - totalExpenses;
  const savingsPct =
    savingsGoal > 0 ? Math.min((balance / savingsGoal) * 100, 100) : 0;

  const pieData = current.expenses
    .filter((e) => parseFloat(e.amount) > 0)
    .map((e) => {
      const cat = CATEGORIES.find((c) => c.id === e.categoryId);
      return {
        name: cat.label,
        value: parseFloat(e.amount),
        color: cat.color,
        icon: cat.icon,
      };
    });

  const barData = MONTHS.map((m, i) => {
    const d = monthsData[i];
    const inc = parseFloat(d.income) || 0;
    const exp = d.expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    return {
      month: m.slice(0, 3),
      income: inc,
      expenses: exp,
      balance: inc - exp,
    };
  });

  const updateExpense = (idx, val) => {
    setMonthsData((prev) => {
      const updated = { ...prev };
      const expenses = [...updated[activeMonth].expenses];
      expenses[idx] = { ...expenses[idx], amount: val };
      updated[activeMonth] = { ...updated[activeMonth], expenses };
      return updated;
    });
  };

  const updateField = (field, val) => {
    setMonthsData((prev) => ({
      ...prev,
      [activeMonth]: { ...prev[activeMonth], [field]: val },
    }));
  };

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "expenses", label: "💸 ကုန်ကျစရိတ်" },
    { id: "savings", label: "🏦 စုငွေ" },
    { id: "chart", label: "📈 Chart" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            💰 Budget Planner
          </h1>
          <p
            style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}
          >
            日本円 (JPY)
          </p>
        </div>
        <select
          value={activeMonth}
          onChange={(e) => setActiveMonth(Number(e.target.value))}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 12,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i} style={{ background: "#302b63" }}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "16px 24px 0",
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "12px 12px 0 0",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background:
                activeTab === t.id ? "rgba(255,255,255,0.15)" : "transparent",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.4)",
              borderBottom:
                activeTab === t.id
                  ? "2px solid #a78bfa"
                  : "2px solid transparent",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "20px",
                marginBottom: 20,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                လစဉ်ဝင်ငွေ (円)
              </label>
              <input
                type="number"
                placeholder="例: 250000"
                value={current.income}
                onChange={(e) => updateField("income", e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: "ဝင်ငွေ",
                  value: income,
                  color: "#10b981",
                  icon: "📥",
                },
                {
                  label: "ကုန်ကျစရိတ်",
                  value: totalExpenses,
                  color: "#f97316",
                  icon: "📤",
                },
                {
                  label: "လက်ကျန်",
                  value: balance,
                  color: balance >= 0 ? "#3b82f6" : "#ef4444",
                  icon: "💼",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "18px",
                    border: `1px solid ${card.color}33`,
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: 4,
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{ fontSize: 20, fontWeight: 800, color: card.color }}
                  >
                    {formatMMK(card.value)}
                  </div>
                </div>
              ))}
            </div>

            {pieData.length > 0 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>
                  Category Breakdown
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 20,
                  }}
                >
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => formatMMK(v)}
                        contentStyle={{
                          background: "#1a1a2e",
                          border: "none",
                          borderRadius: 8,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    {pieData.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: d.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {d.icon} {d.name}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {formatMMK(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {pieData.length === 0 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: "40px 20px",
                  border: "1px dashed rgba(255,255,255,0.15)",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
                <div style={{ fontSize: 14 }}>
                  ကုန်ကျစရိတ်များ ထည့်ရန် "ကုန်ကျစရိတ်" tab သို့ သွားပါ
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPENSES */}
        {activeTab === "expenses" && (
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>
              {MONTHS[activeMonth]} — ကုန်ကျစရိတ်ထည့်ရန်
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {CATEGORIES.map((cat, i) => (
                <div
                  key={cat.id}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: "14px",
                    border: `1px solid ${cat.color}33`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {cat.label}
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={current.expenses[i].amount}
                    onChange={(e) => updateExpense(i, e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${cat.color}55`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                  {current.expenses[i].amount && (
                    <div
                      style={{ fontSize: 11, color: cat.color, marginTop: 4 }}
                    >
                      {formatMMK(parseFloat(current.expenses[i].amount) || 0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 16,
                padding: "14px",
                background: "rgba(249,115,22,0.15)",
                borderRadius: 12,
                border: "1px solid rgba(249,115,22,0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700 }}>စုစုပေါင်း ကုန်ကျစရိတ်</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#f97316" }}>
                {formatMMK(totalExpenses)}
              </span>
            </div>
          </div>
        )}

        {/* SAVINGS */}
        {activeTab === "savings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "20px",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>
                🎯 စုငွေပန်းတိုင်
              </h3>
              <input
                placeholder="ပန်းတိုင်အမည် (ဥပမာ: အိမ်ဝယ်ရန်)"
                value={savingsName}
                onChange={(e) => setSavingsName(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: 14,
                  marginBottom: 12,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <label
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                ပန်းတိုင်ပမာဏ (円)
              </label>
              <input
                type="number"
                placeholder="例: 1000000"
                value={current.savingsGoal}
                onChange={(e) => updateField("savingsGoal", e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 20,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                  >
                    {savingsName}
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}
                  >
                    {savingsPct.toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 12,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${savingsPct}%`,
                      background: "linear-gradient(90deg, #10b981, #34d399)",
                      borderRadius: 6,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {[
                  { label: "လက်ရှိ လက်ကျန်", value: balance, color: "#3b82f6" },
                  { label: "ပန်းတိုင်", value: savingsGoal, color: "#10b981" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 12,
                      padding: "14px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: item.color,
                      }}
                    >
                      {formatMMK(item.value)}
                    </div>
                  </div>
                ))}
              </div>

              {savingsGoal > 0 && balance > 0 && balance < savingsGoal && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px",
                    background: "rgba(234,179,8,0.15)",
                    borderRadius: 10,
                    border: "1px solid rgba(234,179,8,0.3)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  💡 ပန်းတိုင်ရောက်ဖို့{" "}
                  <strong style={{ color: "#eab308" }}>
                    {formatMMK(savingsGoal - balance)}
                  </strong>{" "}
                  လိုသေးတယ်
                </div>
              )}
              {balance >= savingsGoal && savingsGoal > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px",
                    background: "rgba(16,185,129,0.15)",
                    borderRadius: 10,
                    border: "1px solid rgba(16,185,129,0.3)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  🎉 ပန်းတိုင်ရောက်ပြီ! ဂုဏ်ယူပါတယ်!
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHART */}
        {activeTab === "chart" && (
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>
              📈 နှစ်တစ်နှစ်စာ အနှစ်ချုပ်
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? v / 1000 + "K" : v)}
                />
                <Tooltip
                  formatter={(v, n) => [
                    formatMMK(v),
                    n === "income"
                      ? "ဝင်ငွေ"
                      : n === "expenses"
                      ? "ကုန်ကျ"
                      : "လက်ကျန်",
                  ]}
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="balance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              {[
                ["#10b981", "ဝင်ငွေ"],
                ["#f97316", "ကုန်ကျ"],
                ["#3b82f6", "လက်ကျန်"],
              ].map(([c, l]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: c,
                    }}
                  />
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
