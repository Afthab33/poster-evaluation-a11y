/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx}",
      "./components/**/*.{js,jsx}"
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--background)",
          foreground: "var(--foreground)",
          primary: "var(--primary)",
          "primary-foreground": "var(--primary-foreground)",
          secondary: "var(--secondary)",
          "secondary-foreground": "var(--secondary-foreground)",
          accent: "var(--accent)",
          "accent-foreground": "var(--accent-foreground)",
          muted: "var(--muted)",
          "muted-foreground": "var(--muted-foreground)",
          card: "var(--card)",
          "card-foreground": "var(--card-foreground)",
          popover: "var(--popover)",
          "popover-foreground": "var(--popover-foreground)",
          border: "var(--border)",
          ring: "var(--ring)",
          destructive: "var(--destructive)",
          "destructive-foreground": "var(--destructive-foreground)",
          input: "var(--input)"
        },
        borderRadius: {
          lg: "1rem",
          md: "0.5rem",
          sm: "0.25rem"
        },
      },
    },
    darkMode: "class", // Enable class-based dark mode
    plugins: [],
  };
  