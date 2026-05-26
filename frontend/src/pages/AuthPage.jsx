import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { isDark } = useTheme();

  const navigate = useNavigate();

  // Handle authentication
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Auth form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* App logo */}
          <div className="flex items-center gap-3 mb-10">
            <img
              src={isDark ? "/favicon-dark.svg" : "/favicon-light.svg"}
              alt="Spendly"
              className="w-10 h-10 object-contain"
            />

            <span
              className="font-display text-xl font-semibold"
              style={{ color: "#4F8EF7" }}
            >
              Spendly
            </span>
          </div>

          {/* Page heading */}
          <h1 className="font-display text-3xl font-semibold text-lavender mb-1">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>

          <p className="text-steel text-sm mb-8">
            {isLogin
              ? "Sign in to your account"
              : "Start tracking your finances"}
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Auth form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs text-steel uppercase tracking-wider mb-1.5 block">
                  Full Name
                </label>

                <input
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs text-steel uppercase tracking-wider mb-1.5 block">
                Email
              </label>

              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs text-steel uppercase tracking-wider mb-1.5 block">
                Password
              </label>

              {/* Password input */}
              <div className="relative">
                <input
                  className="input-field pr-10"
                  type={showPass ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />

                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-lavender"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F8EF7] hover:bg-[#3a7be0] text-white font-medium py-3 rounded-xl transition-all duration-200 mt-2 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          {/* Toggle auth mode */}
          <p className="text-center text-steel text-sm mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-[#4F8EF7] hover:text-white font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="hidden lg:flex flex-1 bg-[#16181D] items-center justify-center relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[#2A2D35]"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* Feature section */}
        <div className="relative text-center px-12">
          <div className="text-7xl mb-6">💸</div>

          <h2 className="font-display text-3xl font-semibold text-lavender mb-4">
            Smart Finance Tracking
          </h2>

          <p className="text-steel text-sm leading-relaxed max-w-xs mx-auto">
            AI-powered expense categorization, monthly reports, and spending
            insights — all in one place.
          </p>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Auto-categorize", icon: "🏷️" },
              { label: "AI Reports", icon: "📊" },
              { label: "Insights", icon: "✨" },
            ].map((f) => (
              <div key={f.label} className="card p-3 rounded-xl text-center">
                <div className="text-2xl mb-1">{f.icon}</div>

                <div className="text-xs text-steel">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}