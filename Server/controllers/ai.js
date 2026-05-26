const Groq = require("groq-sdk");
const Expense = require("../models/expense");
const Income = require("../models/income");
const { Types } = require("mongoose");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CATEGORIES = [
  "Food & Dining",
  "Transport & Fuel",
  "Shopping",
  "Entertainment",
  "Health & Medical",
  "Utilities, Bills & Recharges",
  "Education",
  "Travel",
  "Groceries",
  "Rent & Housing",
  "Personal Care",
  "Subscriptions",
  "Gifts & Donations",
  "Other",
];

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️",
  "Transport & Fuel": "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  "Health & Medical": "🏥",
  "Utilities, Bills & Recharges": "💡",
  Education: "📚",
  Travel: "✈️",
  Groceries: "🛒",
  "Rent & Housing": "🏠",
  "Personal Care": "💆",
  Subscriptions: "📱",
  "Gifts & Donations": "🎁",
  Other: "💸",
};

// Normalize category names
const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, "");

// Suggest expense category
async function suggestCategory(description, amount) {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 20,
      messages: [
        {
          role: "system",
          content: `You are an expense categorizer for Indian users. Reply with ONLY one category name from this exact list, nothing else, no punctuation, no explanation:
${CATEGORIES.join(", ")}

Examples:
Zomato dinner → Food & Dining
Swiggy order → Food & Dining
BPCL petrol → Transport & Fuel
Uber ride → Transport & Fuel
mobile recharge → Utilities, Bills & Recharges
data recharge → Utilities, Bills & Recharges
Jio recharge → Utilities, Bills & Recharges
airtel recharge → Utilities, Bills & Recharges
electricity bill → Utilities, Bills & Recharges
gas bill → Utilities, Bills & Recharges
water bill → Utilities, Bills & Recharges
Netflix → Subscriptions
Hotstar → Subscriptions
Spotify → Subscriptions
Amazon Prime → Subscriptions
Apollo pharmacy → Health & Medical
Big Bazaar → Groceries
Amazon order → Shopping
school fees → Education
flight ticket → Travel`,
        },
        {
          role: "user",
          content: `Expense: "${description}", Amount: ${amount}`,
        },
      ],
    });

    const suggested = response.choices[0]?.message?.content?.trim();

    console.log("Groq returned:", suggested);

    const category =
      CATEGORIES.find((c) => normalize(c) === normalize(suggested)) ||
      CATEGORIES.find((c) => normalize(suggested)?.includes(normalize(c))) ||
      "Other";

    return {
      category,
      icon: CATEGORY_ICONS[category],
    };
  } catch (error) {
    console.error("Groq categorization error:", error.message);

    return {
      category: "Other",
      icon: CATEGORY_ICONS["Other"],
    };
  }
}

// Generate monthly AI report
async function getMonthlyReport(req, res) {
  try {
    const userId = req.user._id;

    const userObjectId = new Types.ObjectId(userId);

    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch monthly transactions
    const [expenses, incomes] = await Promise.all([
      Expense.find({
        userId: userObjectId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: -1 }),

      Income.find({
        userId: userObjectId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: -1 }),
    ]);

    // Empty report fallback
    if (expenses.length === 0 && incomes.length === 0) {
      return res.status(200).json({
        month,
        year,

        summary: {
          headline: "No transactions this month 📭",

          highlights: ["No expenses or income recorded for this month."],

          tip: "Start adding your expenses to get AI insights!",
        },

        stats: {
          totalExpense: 0,
          totalIncome: 0,
          savings: 0,
          byCategory: {},
        },
      });
    }

    // Calculate totals
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    const savings = totalIncome - totalExpense;

    const savingsPct =
      totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Group expenses by category
    const byCategory = {};

    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(", ");

    const topCategory = Object.entries(byCategory).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const monthName = new Date(year, month - 1).toLocaleString("default", {
      month: "long",
    });

    // Generate AI summary
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 400,

      messages: [
        {
          role: "system",

          content: `You are a personal finance advisor for Indian users.
Return ONLY a valid JSON object with exactly these three fields. No markdown, no backticks, no explanation — raw JSON only:
{
  "headline": "one short punchy sentence with an emoji summarizing the month (mention savings % if good)",
  "highlights": ["3 specific insight sentences using exact ₹ amounts from the data"],
  "tip": "one specific actionable money saving tip based on their biggest spending category"
}
Do not compare with previous months. Only describe what happened this month using the exact numbers given. Never say "saved" for an expense. Always use "You" not "We".`,
        },

        {
          role: "user",

          content: `Month: ${monthName} ${year}
Total Income: ₹${totalIncome}
Total Expenses: ₹${totalExpense}
Savings: ₹${savings} (${savingsPct}% of income)
Total transactions: ${expenses.length}
Spending by category: ${sortedCategories}
Biggest category: ${
            topCategory ? topCategory[0] + " ₹" + topCategory[1] : "N/A"
          }`,
        },
      ],
    });

    // Parse AI response
    const raw = response.choices[0]?.message?.content?.trim();

    let summary;

    try {
      const clean = raw.replace(/```json|```/g, "").trim();

      summary = JSON.parse(clean);
    } catch (e) {
      // Fallback summary
      summary = {
        headline: `You spent ₹${totalExpense} in ${monthName} ${year}`,

        highlights: [
          `Total expenses: ₹${totalExpense} across ${expenses.length} transactions`,

          `Biggest category: ${
            topCategory ? topCategory[0] + " at ₹" + topCategory[1] : "N/A"
          }`,

          `You saved ₹${savings} this month (${savingsPct}% of income)`,
        ],

        tip: "Track your expenses daily to stay on top of your budget.",
      };
    }

    res.status(200).json({
      month,
      year,

      summary,

      stats: {
        totalIncome,
        totalExpense,
        savings,
        savingsPct,
        transactionCount: expenses.length,
        byCategory,
      },
    });
  } catch (error) {
    console.error("Monthly report error:", error.message);

    res.status(500).json({ message: "Could not generate report" });
  }
}

// Suggest income type
async function suggestIncomeType(source) {
  try {
    const INCOME_TYPES = [
      "Salary",
      "Freelance",
      "Investment",
      "Rental",
      "Business",
      "Other",
    ];

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 10,

      messages: [
        {
          role: "system",

          content: `You are an income type classifier. Reply with ONLY one word from this exact list: Salary, Freelance, Investment, Rental, Business, Other. No explanation, no punctuation, just one word.

Rules:
- salary, pay, job, employment, company, corporate, office, CTC, monthly pay = Salary
- freelance, client, project, upwork, fiverr, contract, gig = Freelance  
- investment, stock, mutual fund, dividend, SIP, trading, crypto, interest = Investment
- rent, rental, tenant, property, lease, house rent = Rental
- business, shop, store, ecommerce, youtube, blog, ads, affiliate = Business
- anything else = Other`,
        },

        {
          role: "user",

          content: `Classify this income source into one of: Salary, Freelance, Investment, Rental, Business, Other
Income source: "${source}"
Reply with just one word:`,
        },
      ],
    });

    const suggested = response.choices[0]?.message?.content?.trim();

    const type =
      INCOME_TYPES.find((t) => normalize(t) === normalize(suggested)) ||
      "Other";

    return { type };
  } catch (error) {
    console.error("Groq income type error:", error.message);

    return { type: "Other" };
  }
}

module.exports = {
  suggestCategory,
  getMonthlyReport,
  CATEGORIES,
  CATEGORY_ICONS,
  suggestIncomeType,
};
