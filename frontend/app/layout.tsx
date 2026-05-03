import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Outfit({ subsets: ["latin"], variable: "--font-syne", weight: ["400","600","700","800"] });

export const metadata: Metadata = {
  title: "Voter-Ready — Know Your Vote",
  description: "Education platform for first-time Indian voters.",
  themeColor: "#ffffff",
};

// Prevents dark mode flash on load by reading localStorage before React hydrates
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('vr-theme');
    if (t === 'dark') document.documentElement.setAttribute('data-theme','dark');
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} h-full`}>
      <head>
        {/* Inline script runs before any paint — no theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full" style={{ background: "var(--bg)", color: "var(--text-1)" }}>
        {children}
      </body>
    </html>
  );
}
