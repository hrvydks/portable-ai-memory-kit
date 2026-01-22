import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        slate: "#1f2937",
        mist: "#f8fafc",
        accent: "#2563eb"
      }
    }
  },
  plugins: []
};

export default config;
