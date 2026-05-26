import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  // Apply theme settings
  useEffect(() => {
    const favicon = document.getElementById("favicon");

    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");

      if (favicon) favicon.href = "/favicon-dark.svg";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");

      if (favicon) favicon.href = "/favicon-light.svg";
    }
  }, [isDark]);

  // Toggle theme
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);