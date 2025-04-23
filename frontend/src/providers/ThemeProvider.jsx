"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Create context
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null,
});

export function ThemeProvider({ children }) {
  // Get initial theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    // Check for stored preference
    const savedTheme = localStorage.getItem('theme');
    
    // Always default to 'light' if no saved preference exists
    return savedTheme || 'light';
  });

  // Effect to update HTML class and localStorage when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the previous theme class
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Provide the theme context
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}