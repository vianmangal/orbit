import type { Metadata } from "next";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem("daily-orbit-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export const metadata: Metadata = {
  title: "Daily Orbit — Your daily game routine",
  description: "Keep your favorite daily games and progress in one calm place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
