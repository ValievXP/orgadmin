import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Admin Panel | OSNOVA",
  description: "Advanced admin panel for organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full overflow-hidden antialiased bg-[var(--bg-app)] text-[var(--text-default)]">
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-[var(--bg-app)]">
            <main className="flex-1 overflow-auto bg-[var(--bg-app)] relative h-full flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
