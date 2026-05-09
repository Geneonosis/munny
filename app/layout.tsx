import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "munny",
  description: "Open source personal finance management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
    >
      {/* Blocking script prevents flash of wrong theme */}
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional inline theme-init script
          dangerouslySetInnerHTML={{
            __html: `
          (function(){
            var t = localStorage.getItem('munny-theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (t === 'dark' || (!t && prefersDark)) {
              document.documentElement.classList.add('dark');
            }
          })();
        `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex justify-end px-6 py-3 border-b">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
